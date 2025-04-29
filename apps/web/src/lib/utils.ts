import { AIMessageChunk } from '@langchain/core/messages'
import type { ParsedAIMessageChunk } from '@/types/chat'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

/**
 * Type guard to check if the received data resembles an AIMessageChunk
 * or the parsed structure we expect from the stream.
 */
export const isAIMessageChunk = (data: unknown): data is AIMessageChunk | ParsedAIMessageChunk => {
	if (typeof data !== 'object' || data === null) {
		return false
	}
	const obj = data as Record<string, unknown>

	// Check for properties of a standard AIMessageChunk instance
	const hasAIMessageChunkProps =
		typeof obj?.content === 'string' || typeof obj?._lc_kwargs === 'object'

	// Check for properties of our specific ParsedAIMessageChunk interface
	// This structure might appear when the object is deserialized from JSON
	const hasParsedChunkProps =
		obj?.type === 'constructor' &&
		Array.isArray(obj?.id) &&
		(obj.id as unknown[]).includes('AIMessageChunk') &&
		typeof obj.kwargs === 'object'

	return hasAIMessageChunkProps || hasParsedChunkProps
}
