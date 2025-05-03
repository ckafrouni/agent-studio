import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Toaster } from '@/components/ui/sonner'
import Providers from '@/providers'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Agent Studio',
	description: 'Build, Host, and Manage your AI Agents',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={cn(inter.className)}>
				<Providers>
					<main>{children}</main>
					<Toaster position="bottom-right" />
				</Providers>
			</body>
		</html>
	)
}
