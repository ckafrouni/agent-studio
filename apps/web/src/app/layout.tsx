import type { Metadata } from 'next'
import './globals.css'
import { NavBar } from '@/components/layout/navbar/NavBar'
import { Toaster } from '@/components/ui/sonner'
import Providers from './providers'

export const metadata: Metadata = {
	title: 'My RAG App',
	description: 'Chat with your documents',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body className="antialiased">
				<Providers>
					<NavBar />
					<main className="">{children}</main>
					<Toaster position="bottom-right" />
				</Providers>
			</body>
		</html>
	)
}
