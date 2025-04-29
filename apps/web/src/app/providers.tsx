'use client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/utils/trpc'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<NuqsAdapter>{children}</NuqsAdapter>
		</QueryClientProvider>
	)
}
