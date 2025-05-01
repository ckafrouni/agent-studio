'use client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/utils/trpc'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ThemeProvider } from './theme-provider'

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<NuqsAdapter>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem enableColorScheme>
					{children}
				</ThemeProvider>
			</NuqsAdapter>
		</QueryClientProvider>
	)
}
