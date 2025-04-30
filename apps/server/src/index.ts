import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { trpcServer } from '@hono/trpc-server'
import { auth } from '@/lib/auth'
import type { HonoEnv } from './hono.types'

import workflowsRouter from '@/routers/workflows.router'
import { filesRouter } from '@/routers/files.router'
import { env } from '@/env'
import { createContext } from '@/lib/context'
import { appRouter, type AppRouter } from '@/routers'

const app = new Hono<HonoEnv>()

app.use(logger())
app.use(
	'/*',
	cors({
		origin: env.CORS_ORIGIN,
		allowMethods: ['GET', 'POST', 'OPTIONS'],
		allowHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
	}),
)

app.use('/api/*', async (c, next) => {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	})

	if (!session) {
		c.set('session', null)
		c.set('user', null)
		return next()
	}

	c.set('session', session.session)
	c.set('user', session.user)
	await next()
})

app.route('/api/workflows', workflowsRouter)
app.route('/api/files', filesRouter)

app.on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw))
app.use(
	'/trpc/*',
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context })
		},
	}),
)

app.get('/heartbeat', (c) => {
	return c.json(
		{
			status: 'alive',
			timestamp: new Date().toISOString(),
		},
		200,
	)
})

export { type AppRouter }
export default app
