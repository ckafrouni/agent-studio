import { HumanMessage, AIMessage, AIMessageChunk } from '@langchain/core/messages'
import type {
	Document as ServerDocument,
	Routes as ServerRoutes,
} from '@agent-studio/server/lib/workflows/vector-rag.ts'

export interface ParsedAIMessageChunk {
	type: string
	id: string[]
	kwargs?: {
		content?: string
	}
}

export interface RetrieverOutput {
	documents: ServerDocument[]
}

export interface CheckerOutput {
	routing: ServerRoutes
}

export interface GeneratorOutput {
	messages: AIMessageChunk | ParsedAIMessageChunk
}

export type GraphUpdate =
	| { retriever: RetrieverOutput }
	| { checker: CheckerOutput }
	| { generator: GeneratorOutput }
	| Record<string, RetrieverOutput | CheckerOutput | GeneratorOutput | unknown>

export interface Document {
	pageContent: string
	metadata: {
		id: string
		distance?: number
		source?: string
	}
}

export interface Turn {
	user: HumanMessage
	steps: GraphUpdate[]
	ai: AIMessage | null
	sourceDocuments?: Document[]
}
