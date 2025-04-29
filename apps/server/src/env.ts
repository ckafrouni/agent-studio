import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
	server: {
		CORS_ORIGIN: z.string().min(1),

		BETTER_AUTH_SECRET: z.string().min(1),
		BETTER_AUTH_URL: z.string().url(),

		DATABASE_URL: z.string().url(),

		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),

		OPENAI_API_KEY: z.string().min(1),

		TAVILY_API_KEY: z.string().min(1),

		OPENAI_CHAT_MODEL: z.string().optional().default('gpt-4o'),
		OPENAI_EMBEDDING_MODEL: z.string().optional().default('text-embedding-3-small'),

		CHROMA_HOST: z.string().url(),
		CHROMA_CLIENT_AUTH_CREDENTIALS: z.string().min(1), // e.g., "user:password"
		CHROMA_COLLECTION_NAME: z.string().optional().default('documents'),

		CHUNK_SIZE: z.coerce.number().int().positive().optional().default(1000),
		CHUNK_OVERLAP: z.coerce.number().int().nonnegative().optional().default(200),
		EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().optional().default(1536), // Adjust based on text-embedding-3-small

		S3_BUCKET_NAME: z.string().min(1),
		S3_ENDPOINT_URL: z.string().url().optional(),
		AWS_REGION: z.string().min(1),
		AWS_ACCESS_KEY_ID: z.string().optional(),
		AWS_SECRET_ACCESS_KEY: z.string().optional(),
	},
	runtimeEnv: process.env,
})
