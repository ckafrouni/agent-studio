import { AlphaBanner } from './components/alpha-banner'
import { Header } from './components/header'

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<>
			<AlphaBanner />
			<Header />
			<main className="">{children}</main>
		</>
	)
}
