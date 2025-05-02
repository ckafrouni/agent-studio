import { env } from '@/env'
import { createAuthClient } from 'better-auth/react'
import { apiKeyClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
	baseURL: env.NEXT_PUBLIC_SERVER_URL,
	plugins: [apiKeyClient()],
})
