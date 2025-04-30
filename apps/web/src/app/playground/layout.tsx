import { NavBar } from '@/components/layout/navbar/NavBar'

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<>
			<NavBar />
			<main className="">{children}</main>
		</>
	)
}
