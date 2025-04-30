import { AIMessageChunk } from '@langchain/core/messages'
import type { ParsedAIMessageChunk } from '@/types/chat'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { env } from '@/env'

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
		!!obj?.kwargs &&
		typeof obj.kwargs === 'object' &&
		obj.kwargs !== null

	return hasAIMessageChunkProps || hasParsedChunkProps
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
	const url = `${env.NEXT_PUBLIC_SERVER_URL}${path}`

	const mergedOptions: RequestInit = {
		...options,
		credentials: 'include',
		headers: {
			...(options.headers || {}),
		},
	}

	return fetch(url, mergedOptions)
}
