import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    ANTHROPIC_API_KEY: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),

    AZURE_OPENAI_API_KEY: z.string().min(1),
    AZURE_OPENAI_EMBEDDING_MODEL: z.string().default("text-embedding-ada-002"),
    AZURE_OPENAI_CHAT_MODEL: z.string().default("chat-model-4o-mini"),
    AZURE_OPENAI_API_VERSION: z.string().default("2024-02-01"),
    AZURE_OPENAI_API_INSTANCE_NAME: z.string().default("chat-model-4o-mini"),
    AZURE_OPENAI_API_DEPLOYMENT_NAME: z
      .string()
      .default("chat-model-gpt-4o-mini"),

    CHROMA_HOST: z.string(),
    CHROMA_CLIENT_AUTH_CREDENTIALS: z.string(),
    CHROMA_COLLECTION_NAME: z.string(),
  },
  runtimeEnv: process.env,
});
