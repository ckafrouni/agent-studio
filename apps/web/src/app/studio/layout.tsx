'use client'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SiteHeader } from '@/components/layout/site-header'
import { SidebarInset } from '@/components/ui/sidebar'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const { data: session, isPending } = authClient.useSession()

	useEffect(() => {
		if (!session && !isPending) {
			router.push('/login')
		}
	}, [session, isPending, router])

	if (isPending) {
		return <div className="flex h-screen items-center justify-center">Loading...</div>
	}

	return (
		<SidebarProvider
			style={
				{
					'--sidebar-width': 'calc(var(--spacing) * 72)',
					'--header-height': 'calc(var(--spacing) * 12)',
				} as React.CSSProperties
			}
		>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<SiteHeader title="Dashboard" />
				<div className="flex flex-1 flex-col">
					<div className="@container/main relative flex flex-1 flex-col gap-2 overflow-clip">
						{children}
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
