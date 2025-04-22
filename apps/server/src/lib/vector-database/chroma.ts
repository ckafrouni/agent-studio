import { env } from "~/env";
import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";

// MARK: - Embedding
const embeddingFunction = new OpenAIEmbeddingFunction({
  openai_api_key: env.OPENAI_API_KEY,
  // Explicitly set the model to match the collection's expected 3072 dimensions
  openai_model: "text-embedding-3-large",
});

const client = new ChromaClient();

export const collection = await client.getOrCreateCollection({
  name: env.CHROMA_COLLECTION_NAME,
  embeddingFunction: embeddingFunction,
});
