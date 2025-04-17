import { AzureOpenAIEmbeddings, OpenAIEmbeddings } from "@langchain/openai";
import { ChromaClient } from "chromadb";
import { env } from "@/env";

// MARK: - Embedding
const azureOpenAIEmbeddings = new AzureOpenAIEmbeddings({
  azureOpenAIApiVersion: env.AZURE_OPENAI_API_VERSION,
  azureOpenAIApiKey: env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiInstanceName: env.AZURE_OPENAI_EMBEDDING_MODEL,
  azureOpenAIApiDeploymentName: env.AZURE_OPENAI_EMBEDDING_MODEL,
  model: env.AZURE_OPENAI_EMBEDDING_MODEL,
});

const openAIEmbeddings = new OpenAIEmbeddings({
  apiKey: env.OPENAI_API_KEY,
  model: env.AZURE_OPENAI_EMBEDDING_MODEL,
});

const embeddingFunction = {
  generate: async (texts: string[]) => {
    return openAIEmbeddings.embedDocuments(texts);
  },
};

const client = new ChromaClient();

export const collection = await client.getOrCreateCollection({
  name: "test",
  embeddingFunction: embeddingFunction,
});

// console.log("Collection created:", collection);

// await collection.upsert({
//   documents: [
//     "Laurine is gay.",
//     "Julian is the gayest.",
//     "Chris is not openly gay.",
//   ],
//   ids: ["1", "2", "3"],
// });

// console.log("Documents upserted");
