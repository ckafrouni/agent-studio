import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb'
import { env } from '@/env'

const embeddingFunction = new OpenAIEmbeddingFunction({
	openai_api_key: env.OPENAI_API_KEY,
	openai_model: 'text-embedding-3-large',
})

const client = new ChromaClient()

export async function getUserCollection(userId: string) {
	const collectionName = `user-${userId}`
	const collection = await client.getOrCreateCollection({
		name: collectionName,
		embeddingFunction: embeddingFunction,
		metadata: { 'hnsw:space': 'cosine' },
	})
	return collection
}
