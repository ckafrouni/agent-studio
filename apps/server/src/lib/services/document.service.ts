import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { Document } from '@langchain/core/documents'
import { IncludeEnum } from 'chromadb'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import mammoth from 'mammoth'
import { z } from 'zod'
import { env } from '@/env'
import { getUserCollection } from '@/lib/vector-database/chroma'

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

const extractFilename = (sourceUriOrFilename: string | undefined): string | undefined => {
	if (!sourceUriOrFilename) return undefined
	try {
		if (sourceUriOrFilename.startsWith('s3://')) {
			const parts = sourceUriOrFilename.split('/')
			return parts[parts.length - 1]
		}
		return sourceUriOrFilename
	} catch {
		return sourceUriOrFilename
	}
}

class DocumentService {
	async addDocumentFromBuffer(
		userId: string,
		fileBuffer: Buffer,
		fileName: string,
		fileType: string,
	): Promise<AddDocumentResult> {
		let docs: Document[] = []
		const userCollection = await getUserCollection(userId)

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

			const chunks = await splitter.splitDocuments(docs)
			const validChunks = chunks.filter(
				(chunk) => chunk.pageContent && chunk.pageContent.trim() !== '',
			)

			if (validChunks.length === 0) {
				return {
					fileName,
					docCount: docs.length,
					chunksAdded: 0,
				}
			}

			const simplifiedMetadatas = validChunks.map((chunk) => {
				const simpleMeta: Record<string, string | number | boolean> = {}
				for (const key in chunk.metadata) {
					if (
						typeof chunk.metadata[key] === 'string' ||
						typeof chunk.metadata[key] === 'number' ||
						typeof chunk.metadata[key] === 'boolean'
					) {
						simpleMeta[key] = chunk.metadata[key]
					}
				}
				simpleMeta.source = fileName
				return simpleMeta
			})

			const ids = validChunks.map(
				(_, index) => `${fileName}_${String(Date.now())}_${String(index)}`,
			)

			await userCollection.add({
				ids,
				documents: validChunks.map((chunk) => chunk.pageContent),
				metadatas: simplifiedMetadatas,
			})

			return {
				fileName,
				docCount: docs.length,
				chunksAdded: validChunks.length,
			}
		} catch (_error) {
			const message = _error instanceof Error ? _error.message : 'File processing failed.'
			throw new Error(`Failed to process file ${fileName}: ${message}`)
		}
	}

	async listDocuments(userId: string) {
		const userCollection = await getUserCollection(userId)
		try {
			const results = await userCollection.get({
				limit: 1000,
				include: [IncludeEnum.Metadatas],
			})

			const uniqueSources = new Map<string, { id: string; metadata: { source?: string } }>()
			results.ids.forEach((id, index) => {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- metadata can be nullish due to optional chain above
				const metadata = results.metadatas?.[index]
				const originalSource = metadata?.source as string | undefined
				const filename = extractFilename(originalSource)

				if (filename && !uniqueSources.has(filename)) {
					uniqueSources.set(filename, { id, metadata: { source: filename } })
				}
			})

			return { documents: Array.from(uniqueSources.values()) }
		} catch (_error) {
			throw new Error('Failed to retrieve document list from vector store.')
		}
	}

	async searchDocuments(userId: string, query: string, k?: number) {
		const userCollection = await getUserCollection(userId)
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
			const results = await userCollection.query({
				queryTexts: [validatedQuery],
				nResults: validatedK,
				include: [IncludeEnum.Metadatas, IncludeEnum.Documents, IncludeEnum.Distances],
			})

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- results.ids?.[0] can be undefined if results.ids is empty
			const resultCount = results.ids?.[0]?.length ?? 0
			if (resultCount === 0) {
				return { results: [] }
			}

			const formattedResults = results.ids[0].map((id, index) => ({
				id,
				document: results.documents[0][index] ?? '',
				metadata: {
					...(results.metadatas[0][index] ?? {}),
					distance: results.distances?.[0]?.[index] ?? null,
				},
			}))

			return { results: formattedResults }
		} catch (_error) {
			throw new Error('Failed to search documents in vector store.')
		}
	}

	async deleteVectorDataBySource(userId: string, source: string) {
		const userCollection = await getUserCollection(userId)
		const validation = DeleteSchema.safeParse({ source })
		if (!validation.success) {
			const errorMessages = validation.error.errors
				.map((e) => `${e.path.join('.')}: ${e.message}`)
				.join(', ')
			throw new Error(`Invalid delete input (filename): ${errorMessages}`)
		}
		const validatedFilename = validation.data.source

		try {
			// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression -- Unclear why this rule triggers on the 'where' clause
			const deleteResult = await userCollection.delete({
				where: { source: validatedFilename },
			})
			const deletedCount = Array.isArray(deleteResult) ? deleteResult.length : undefined
			return {
				success: true,
				message: `Successfully deleted vector data for source: ${validatedFilename}`,
				deletedVectorCount: deletedCount,
			}
		} catch (_error) {
			throw new Error(`Failed to delete vector data for source '${validatedFilename}'.`)
		}
	}
}

export const documentService = new DocumentService()
