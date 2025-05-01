import type { BaseMessage } from '@langchain/core/messages'
import type { IterableReadableStream } from '@langchain/core/utils/stream'
import type { CompiledStateGraph } from '@langchain/langgraph'
import type { Context } from 'hono'
import { stream } from 'hono/streaming'

interface WorkflowInput {
	messages: BaseMessage[]
	userId: string
}
type StreamableWorkflow = CompiledStateGraph<WorkflowInput, Partial<WorkflowInput>, string>

export const streamMessages = (workflow: StreamableWorkflow, c: Context, inputs: WorkflowInput) => {
	try {
		c.header('Content-Type', 'application/x-ndjson')

		return stream(c, async (stream) => {
			const messagesStream: IterableReadableStream<[BaseMessage, unknown]> = (await workflow.stream(
				inputs,
				{
					streamMode: ['updates', 'messages'],
				},
			)) as IterableReadableStream<[BaseMessage, unknown]>

			for await (const chunk of messagesStream) {
				const ndjsonChunk = `${JSON.stringify(chunk)}\n`
				await stream.write(ndjsonChunk)
			}
		})
	} catch (_error) {
		console.error('Error streaming messages:', _error)
	}
}
