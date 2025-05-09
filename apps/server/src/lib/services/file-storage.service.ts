import type { GetObjectCommandOutput } from '@aws-sdk/client-s3'
import {
	GetObjectCommand,
	DeleteObjectCommand,
	NoSuchKey,
	PutObjectCommand,
} from '@aws-sdk/client-s3'
import mime from 'mime-types'
import { Readable as NodeReadable } from 'node:stream'
import { s3Client, bucketName } from '@/lib/s3/client'

class FileStorageService {
	private async _streamToBuffer(stream: NodeReadable): Promise<Buffer> {
		const chunks: Buffer[] = []
		return new Promise((resolve, reject) => {
			stream.on('data', (chunk: Buffer) => chunks.push(chunk))
			stream.on('error', reject)
			stream.on('end', () => {
				resolve(Buffer.concat(chunks))
			})
		})
	}

	async getFileFromS3(
		source: string,
	): Promise<{ buffer: Buffer; contentType: string | undefined }> {
		const getObjectParams = {
			Bucket: bucketName,
			Key: source,
		}

		try {
			const command = new GetObjectCommand(getObjectParams)
			const s3Response = await s3Client.send(command)

			if (!s3Response.Body) {
				throw new Error('S3 response body is missing.')
			}

			if (!(s3Response.Body instanceof NodeReadable)) {
				throw new Error('S3 response body is not a Node.js Readable stream.')
			}

			const buffer = await this._streamToBuffer(s3Response.Body)

			return {
				buffer,
				contentType: s3Response.ContentType,
			}
		} catch (error: unknown) {
			if (error instanceof NoSuchKey) {
				throw error
			}
			if (error instanceof Error) {
				throw new Error(`Failed to retrieve file from S3: ${error.message}`)
			}
			throw new Error('Failed to retrieve file from S3: Unknown error')
		}
	}

	getContentTypeFromS3Response(s3Response: GetObjectCommandOutput, source: string): string {
		return s3Response.ContentType ?? (mime.lookup(source) || 'application/octet-stream')
	}

	async deleteFileFromS3(source: string): Promise<void> {
		const deleteParams = {
			Bucket: bucketName,
			Key: source,
		}

		const command = new DeleteObjectCommand(deleteParams)
		await s3Client.send(command)
	}

	async uploadFileToS3(fileBuffer: Buffer, fileName: string, fileType: string): Promise<void> {
		const uploadParams = {
			Bucket: bucketName,
			Key: fileName,
			Body: fileBuffer,
			ContentType: fileType,
		}
		try {
			const command = new PutObjectCommand(uploadParams)
			await s3Client.send(command)
		} catch (error: unknown) {
			if (error instanceof Error) {
				throw new Error(`Failed to upload file to S3: ${error.message}`)
			}
			throw new Error('Failed to upload file to S3: Unknown error')
		}
	}
}

export const fileStorageService = new FileStorageService()
