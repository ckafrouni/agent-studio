import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import workflowsRouter from '~/routers/workflows.router'
import { filesRouter } from '~/routers/files.router'

const app = new Hono()

app.use(logger())
app.use(cors())

app.route('/api/workflows', workflowsRouter)
app.route('/api/files', filesRouter)

app.get('/heartbeat', (c) => {
	return c.json(
		{
			status: 'alive',
			timestamp: new Date().toISOString(),
		},
		200,
	)
})

export default app
