import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import Providers from '@/providers'

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
			<body className="antialiased">
				<Providers>
					<main>{children}</main>
					<Toaster position="bottom-right" />
				</Providers>
			</body>
		</html>
	)
}
