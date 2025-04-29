import { collection } from '~/lib/vector-database/chroma'
import { IncludeEnum } from 'chromadb'
import { z } from 'zod'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import mammoth from 'mammoth'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document } from '@langchain/core/documents'
import { env } from '~/env'

const SearchSchema = z.object({
	query: z.string().min(1, 'Search query cannot be empty.'),
	k: z.number().int().positive().optional().default(5),
})

const DeleteSchema = z.object({
	source: z.string().min(1, 'Source filename cannot be empty.'),
})

interface AddDocumentResult {
	fileName: string
	docCount: number
	chunksAdded: number
}

const splitter = new RecursiveCharacterTextSplitter({
	chunkSize: env.CHUNK_SIZE,
	chunkOverlap: env.CHUNK_OVERLAP,
})

// Helper function to extract filename (S3 key)
const extractFilename = (sourceUriOrFilename: string | undefined): string | undefined => {
	if (!sourceUriOrFilename) return undefined
	try {
		// Handle full URIs like s3://bucket/filename.txt
		if (sourceUriOrFilename.startsWith('s3://')) {
			const parts = sourceUriOrFilename.split('/')
			return parts[parts.length - 1] // Get last part
		}
		// If not starting with s3://, assume it's already a filename
		return sourceUriOrFilename
	} catch (e) {
		// If any error, return original (or handle differently)
		console.warn(`[extractFilename] Could not parse source: ${sourceUriOrFilename}`, e)
		return sourceUriOrFilename
	}
}

class DocumentService {
	async addDocumentFromBuffer(
		fileBuffer: Buffer,
		fileName: string,
		fileType: string,
	): Promise<AddDocumentResult> {
		let docs: Document[] = []

		try {
			const fileBlob = new Blob([fileBuffer], { type: fileType })

			if (fileType === 'application/pdf') {
				const loader = new PDFLoader(fileBlob, { splitPages: false })
				docs = await loader.load()
			} else if (
				fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
			) {
				const { value } = await mammoth.extractRawText({ buffer: fileBuffer })
				docs = [new Document({ pageContent: value })]
			} else if (fileType === 'text/plain' || fileType === 'text/markdown') {
				const loader = new TextLoader(fileBlob)
				docs = await loader.load()
			} else {
				throw new Error(`Unsupported file type: ${fileType}`)
			}

			if (!docs || docs.length === 0) {
				console.warn(`No documents extracted from ${fileName}.`)
				return {
					fileName,
					docCount: 0,
					chunksAdded: 0,
				}
			}

			const chunks = await splitter.splitDocuments(docs)
			const validChunks = chunks.filter(
				(chunk) => chunk.pageContent && chunk.pageContent.trim() !== '',
			)

			if (validChunks.length === 0) {
				console.warn(`No valid text chunks found in ${fileName} after splitting.`)
				return {
					fileName,
					docCount: docs.length,
					chunksAdded: 0,
				}
			}

			const simplifiedMetadatas = validChunks.map((chunk) => {
				const simpleMeta: { [key: string]: any } = {}
				if (chunk.metadata) {
					for (const key in chunk.metadata) {
						if (
							typeof chunk.metadata[key] === 'string' ||
							typeof chunk.metadata[key] === 'number' ||
							typeof chunk.metadata[key] === 'boolean'
						) {
							simpleMeta[key] = chunk.metadata[key]
						}
					}
				}
				simpleMeta.source = fileName
				return simpleMeta
			})

			const ids = validChunks.map((_, index) => `${fileName}_${Date.now()}_${index}`)

			await collection.add({
				ids,
				documents: validChunks.map((chunk) => chunk.pageContent),
				metadatas: simplifiedMetadatas,
			})

			return {
				fileName,
				docCount: docs.length,
				chunksAdded: validChunks.length,
			}
		} catch (error) {
			console.error(
				`[DocumentService.addDocumentFromBuffer] Error processing file ${fileName}:`,
				error,
			)
			const message = error instanceof Error ? error.message : 'File processing failed.'
			throw new Error(`Failed to process file ${fileName}: ${message}`)
		}
	}

	async listDocuments() {
		try {
			const results = await collection.get({
				limit: 1000,
				include: [IncludeEnum.Metadatas],
			})

			const uniqueSources = new Map<string, { id: string; metadata: { source?: string } }>()
			results.ids.forEach((id, index) => {
				const metadata = results.metadatas?.[index]
				const originalSource = metadata?.source as string | undefined
				// UPDATE: Extract filename before adding to map
				const filename = extractFilename(originalSource)

				if (filename && !uniqueSources.has(filename)) {
					// Store using filename as key and in metadata
					uniqueSources.set(filename, { id, metadata: { source: filename } })
				}
			})

			return { documents: Array.from(uniqueSources.values()) }
		} catch (error) {
			console.error('[DocumentService.listDocuments] Error:', error)
			throw new Error('Failed to retrieve document list from vector store.')
		}
	}

	async searchDocuments(query: string, k?: number) {
		const validation = SearchSchema.safeParse({ query, k })
		if (!validation.success) {
			const errorMessages = validation.error.errors
				.map((e) => `${e.path.join('.')}: ${e.message}`)
				.join(', ')
			throw new Error(`Invalid search input: ${errorMessages}`)
		}

		const validatedQuery = validation.data.query
		const validatedK = validation.data.k

		try {
			const results = await collection.query({
				queryTexts: [validatedQuery],
				nResults: validatedK,
				include: [IncludeEnum.Metadatas, IncludeEnum.Documents, IncludeEnum.Distances],
			})

			const resultCount = results.ids?.[0]?.length ?? 0
			if (
				resultCount === 0 ||
				!results.documents?.[0] ||
				!results.metadatas?.[0] ||
				!results.distances?.[0]
			) {
				return { results: [] }
			}

			const formattedResults = results.ids[0].map((id, index) => ({
				id,
				document: results.documents![0][index] ?? '',
				metadata: {
					...(results.metadatas![0][index] ?? {}),
					distance: results.distances![0][index] ?? null,
				},
			}))

			return { results: formattedResults }
		} catch (error) {
			console.error('[DocumentService.searchDocuments] Error:', error)
			throw new Error('Failed to search documents in vector store.')
		}
	}

	async deleteVectorDataBySource(source: string) {
		const validation = DeleteSchema.safeParse({ source })
		if (!validation.success) {
			const errorMessages = validation.error.errors
				.map((e) => `${e.path.join('.')}: ${e.message}`)
				.join(', ')
			throw new Error(`Invalid delete input (filename): ${errorMessages}`)
		}
		const validatedFilename = validation.data.source

		try {
			const deleteResult = await collection.delete({
				where: { source: validatedFilename },
			})
			console.log(
				`[DocumentService.deleteVectorDataBySource] Deleted vectors for source filename: ${validatedFilename}`,
				deleteResult,
			)
			const deletedCount = Array.isArray(deleteResult) ? deleteResult.length : undefined
			return {
				success: true,
				message: `Successfully deleted vector data for source: ${validatedFilename}`,
				deletedVectorCount: deletedCount,
			}
		} catch (error) {
			console.error(
				`[DocumentService.deleteVectorDataBySource] Error deleting vectors for source filename ${validatedFilename}:`,
				error,
			)
			throw new Error(`Failed to delete vector data for source '${validatedFilename}'.`)
		}
	}
}

export const documentService = new DocumentService()
