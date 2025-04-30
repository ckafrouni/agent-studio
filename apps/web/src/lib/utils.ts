import { AIMessageChunk } from '@langchain/core/messages'
import type { ParsedAIMessageChunk } from '@/types/chat'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const isAIMessageChunk = (data: unknown): data is AIMessageChunk | ParsedAIMessageChunk => {
	if (typeof data !== 'object' || data === null) {
		return false
	}
	const obj = data as Record<string, unknown>

	const hasAIMessageChunkProps =
		typeof obj?.content === 'string' || typeof obj?._lc_kwargs === 'object'

	const hasParsedChunkProps =
		obj?.type === 'constructor' &&
		Array.isArray(obj?.id) &&
		(obj.id as unknown[]).includes('AIMessageChunk') &&
		typeof obj.kwargs === 'object'

	return hasAIMessageChunkProps || hasParsedChunkProps
}
