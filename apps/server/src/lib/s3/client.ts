import { S3Client } from '@aws-sdk/client-s3'
import { env } from '@/env'

const s3ClientConfig = {
	region: env.AWS_REGION,
	// Setup for localstack/MinIO only
	...(env.S3_ENDPOINT_URL && {
		endpoint: env.S3_ENDPOINT_URL,
		forcePathStyle: true,
		credentials: {
			accessKeyId: env.AWS_ACCESS_KEY_ID ?? 'test',
			secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? 'test',
		},
	}),
}

export const s3Client = new S3Client(s3ClientConfig)

export const bucketName = env.S3_BUCKET_NAME
