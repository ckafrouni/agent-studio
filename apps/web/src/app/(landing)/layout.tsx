import { AlphaBanner } from './components/alpha-banner'
import { Footer } from './components/footer'
import { Header } from './components/header'

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<div className="flex min-h-screen flex-col bg-black text-white">
			<AlphaBanner />
			<Header />
			<main className="flex-1">{children}</main>
			<Footer />
		</div>
	)
}
