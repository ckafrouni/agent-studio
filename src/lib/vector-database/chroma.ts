import { env } from "~/env";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChromaClient } from "chromadb";

// MARK: - Embedding
const openAIEmbeddings = new OpenAIEmbeddings({
  apiKey: env.OPENAI_API_KEY,
  model: env.OPENAI_EMBEDDING_MODEL,
});

const embeddingFunction = {
  generate: async (texts: string[]) => {
    return openAIEmbeddings.embedDocuments(texts);
  },
};

const client = new ChromaClient();

export const collection = await client.getOrCreateCollection({
  name: env.CHROMA_COLLECTION_NAME,
  embeddingFunction: embeddingFunction,
});
