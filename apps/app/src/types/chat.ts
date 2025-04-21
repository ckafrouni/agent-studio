import {
  HumanMessage,
  AIMessage,
  AIMessageChunk,
} from "@langchain/core/messages";
import type {
  Document as ServerDocument,
  Routes as ServerRoutes,
} from "@server/lib/workflows/vector-rag.ts";

// Represents the structure of an AIMessageChunk when parsed from NDJSON,
// as it might not conform perfectly to the class instance.
export interface ParsedAIMessageChunk {
  type: string;
  id: string[];
  kwargs?: {
    content?: string;
  };
}

// Specific output types for different nodes in the graph
export interface RetrieverOutput {
  documents: ServerDocument[];
}

export interface CheckerOutput {
  routing: ServerRoutes;
}

export interface GeneratorOutput {
  messages: AIMessageChunk | ParsedAIMessageChunk;
}

// Represents a generic update from the LangGraph stream
export interface GraphUpdate {
  generator?: GeneratorOutput;
  retriever?: RetrieverOutput;
  checker?: CheckerOutput;
  // Add other potential node keys here, refining their types as needed
}

// Represents a single user-AI interaction turn
export interface Turn {
  user: HumanMessage;
  steps: Array<{
    name: string;
    data: RetrieverOutput | CheckerOutput | GeneratorOutput | unknown;
  }>;
  ai: AIMessage | null;
}
