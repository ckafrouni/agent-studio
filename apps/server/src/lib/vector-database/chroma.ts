import { env } from '@/env'
import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb'

// MARK: - Embedding
const embeddingFunction = new OpenAIEmbeddingFunction({
	openai_api_key: env.OPENAI_API_KEY,
	openai_model: 'text-embedding-3-large',
})

const client = new ChromaClient()

/**
 * Retrieves or creates a ChromaDB collection specific to a user.
 * @param userId The unique identifier for the user.
 * @returns The user-specific ChromaDB collection.
 */
export async function getUserCollection(userId: string) {
	const collectionName = `user-${userId}` // Or any other naming scheme
	const collection = await client.getOrCreateCollection({
		name: collectionName,
		embeddingFunction: embeddingFunction,
		metadata: { 'hnsw:space': 'cosine' }, // Keep cosine distance
	})
	return collection
}
