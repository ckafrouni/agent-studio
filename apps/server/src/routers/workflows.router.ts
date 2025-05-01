import { HumanMessage } from '@langchain/core/messages'
import { Hono } from 'hono'
import type { HonoEnv } from '@/hono.types'
import { streamMessages } from '@/lib/utils/stream-helpers'
import vectorRagWorkflow from '@/lib/workflows/vector-rag'
import webSearchRagWorkflow from '@/lib/workflows/web-search-rag'

const router = new Hono<HonoEnv>()

router.post('/messages', async (c) => {
	const { prompt, workflow: workflowName = 'vector-rag' } = await c.req.json<{
		prompt: string
		workflow?: string
	}>()

	const user = c.get('user')

	if (!user?.id) {
		return c.json({ error: 'Unauthorized' }, 401)
	}

	if (!prompt) {
		return c.json({ error: 'Missing prompt' }, 400)
	}

	const selectedWorkflow =
		workflowName === 'web-search-rag' ? webSearchRagWorkflow : vectorRagWorkflow

	return streamMessages(selectedWorkflow, c, {
		userId: user.id,
		messages: [
			new HumanMessage({
				content: prompt,
			}),
		],
	})
})

export default router
