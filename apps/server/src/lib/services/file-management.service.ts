import { z } from 'zod'
import { documentService } from './document.service'
import { fileStorageService } from './file-storage.service'
import { randomUUID } from 'crypto'

const DeleteSchema = z.object({
	source: z.string().min(1, 'Source filename cannot be empty.'),
})

const extractFilename = (sourceUriOrFilename: string | undefined): string | undefined => {
	if (!sourceUriOrFilename) return undefined
	try {
		let decodedSource = decodeURIComponent(sourceUriOrFilename)
		if (decodedSource.startsWith('s3://')) {
			const parts = decodedSource.split('/')
			return parts[parts.length - 1]
		}
		return decodedSource
	} catch (e) {
		try {
			return decodeURIComponent(sourceUriOrFilename)
		} catch {
			return sourceUriOrFilename
		}
	}
}

class FileManagementService {
	async uploadAndProcessDocument(
		userId: string,
		fileBuffer: Buffer,
		originalFilename: string,
		fileType: string,
		fileSize: number,
	) {
		if (!fileBuffer || fileBuffer.length === 0) {
			throw new Error('File buffer cannot be empty.')
		}
		if (!originalFilename) {
			throw new Error('Original filename is required.')
		}
		if (!fileType) {
			throw new Error('File type (mimetype) is required.')
		}
		if (fileSize === undefined || fileSize < 0) {
			throw new Error('Valid file size is required.')
		}

		try {
			const uniqueFilename = `${randomUUID()}-${originalFilename}`

			await fileStorageService.uploadFileToS3(fileBuffer, uniqueFilename, fileType)

			const result = await documentService.addDocumentFromBuffer(
				userId,
				fileBuffer,
				uniqueFilename,
				fileType,
			)

			return {
				success: true,
				message: `Successfully uploaded and processed ${originalFilename}. ${result.chunksAdded} chunk(s) added.`,
				fileName: result.fileName,
				docCount: result.docCount,
				chunksAdded: result.chunksAdded,
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Processing failed.'
			if (message.includes('S3')) {
				throw new Error(`Failed to upload ${originalFilename} to storage: ${message}`)
			} else {
				throw new Error(`Failed to process file ${originalFilename}: ${message}`)
			}
		}
	}

	async deleteDocument(userId: string, source: string) {
		const filename = extractFilename(source)
		if (!filename) {
			throw new Error(`Invalid source format: ${source}`)
		}

		try {
			await fileStorageService.deleteFileFromS3(filename)
		} catch (s3Error) {
			return {
				warning: `Vector data deleted, but failed to delete file from S3: ${
					s3Error instanceof Error ? s3Error.message : 'Unknown S3 error'
				}`,
			}
		}

		const dbDeleteResult = await documentService.deleteVectorDataBySource(userId, filename)

		return dbDeleteResult
	}
}

export const fileManagementService = new FileManagementService()
