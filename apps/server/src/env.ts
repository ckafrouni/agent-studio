import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    OPENAI_API_KEY: z.string().min(1),

    OPENAI_CHAT_MODEL: z.string().default("gpt-4.1-nano-2025-04-14"),
    OPENAI_EMBEDDING_MODEL: z.string().default("text-embedding-3-large"),

    CHROMA_HOST: z.string().default("http://localhost:8000"),
    CHROMA_CLIENT_AUTH_CREDENTIALS: z.string().default("user:password"),
    CHROMA_COLLECTION_NAME: z.string().default("default-collection"),

    CHUNK_SIZE: z.coerce.number().int().positive().default(1000), // Default chunk size
    CHUNK_OVERLAP: z.coerce.number().int().nonnegative().default(200), // Default overlap
    EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().default(1536), // Default for text-embedding-3-small
  },
  runtimeEnv: process.env,
});
