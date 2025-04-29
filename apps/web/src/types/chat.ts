import { HumanMessage, AIMessage, AIMessageChunk } from '@langchain/core/messages'
import type {
	Document as ServerDocument,
	Routes as ServerRoutes,
} from '@server/lib/workflows/vector-rag.ts'

// Represents the structure of an AIMessageChunk when parsed from NDJSON,
// as it might not conform perfectly to the class instance.
export interface ParsedAIMessageChunk {
	type: string
	id: string[]
	kwargs?: {
		content?: string
	}
}

// Specific output types for different nodes in the graph
export interface RetrieverOutput {
	documents: ServerDocument[]
}

export interface CheckerOutput {
	routing: ServerRoutes
}

export interface GeneratorOutput {
	messages: AIMessageChunk | ParsedAIMessageChunk
}

// Represents a generic update from the LangGraph stream
// Represents a single update from a graph node
// It should ideally have exactly one key, which is the node name.
export type GraphUpdate =
	| { retriever: RetrieverOutput }
	| { checker: CheckerOutput }
	| { generator: GeneratorOutput }
	// Using a record for flexibility, assuming one key per update object.
	| Record<string, RetrieverOutput | CheckerOutput | GeneratorOutput | unknown>

export interface Document {
	pageContent: string
	metadata: {
		id: string
		distance?: number
		source?: string
	}
}

// Represents a single user-AI interaction turn
export interface Turn {
	user: HumanMessage
	steps: GraphUpdate[]
	ai: AIMessage | null
	sourceDocuments?: Document[]
}
