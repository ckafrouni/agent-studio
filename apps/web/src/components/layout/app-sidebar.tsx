'use client'

import * as React from 'react'
import {
	IconCamera,
	IconChartBar,
	IconDashboard,
	IconDatabase,
	IconFileAi,
	IconFileDescription,
	IconFileWord,
	IconFolder,
	IconGrain,
	IconHelp,
	IconReport,
	IconSettings,
	IconTestPipe,
	IconUsers,
} from '@tabler/icons-react'

import { NavDocuments } from '@/components/layout/nav-documents'
import { NavMain } from '@/components/layout/nav-main'
import { NavSecondary } from '@/components/layout/nav-secondary'
import { NavUser } from '@/components/layout/nav-user'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import { useEffect, useState } from 'react'

const data = {
	navMain: [
		{
			title: 'Dashboard',
			url: '/studio/dashboard',
			icon: IconDashboard,
		},
		{
			title: 'Playground',
			url: '/studio/playground',
			icon: IconTestPipe,
		},
		{
			title: 'Analytics',
			url: '#',
			icon: IconChartBar,
		},
		{
			title: 'Projects',
			url: '/studio/projects',
			icon: IconFolder,
		},
		{
			title: 'Usage',
			url: '#',
			icon: IconReport,
		},
		{
			title: 'Team',
			url: '#',
			icon: IconUsers,
		},
	],
	navClouds: [
		{
			title: 'Capture',
			icon: IconCamera,
			isActive: true,
			url: '#',
			items: [
				{
					title: 'Active Proposals',
					url: '#',
				},
				{
					title: 'Archived',
					url: '#',
				},
			],
		},
		{
			title: 'Proposal',
			icon: IconFileDescription,
			url: '#',
			items: [
				{
					title: 'Active Proposals',
					url: '#',
				},
				{
					title: 'Archived',
					url: '#',
				},
			],
		},
		{
			title: 'Prompts',
			icon: IconFileAi,
			url: '#',
			items: [
				{
					title: 'Active Proposals',
					url: '#',
				},
				{
					title: 'Archived',
					url: '#',
				},
			],
		},
	],
	navSecondary: [
		{
			title: 'Settings',
			url: '#',
			icon: IconSettings,
		},
		{
			title: 'Get Help',
			url: '#',
			icon: IconHelp,
		},
	],
	documents: [
		{
			name: 'Data Library',
			url: '#',
			icon: IconDatabase,
		},
		{
			name: 'Reports',
			url: '#',
			icon: IconReport,
		},
		{
			name: 'Word Assistant',
			url: '#',
			icon: IconFileWord,
		},
	],
}

export function CommandMenu({
	open,
	setOpen,
}: {
	open: boolean
	setOpen: (open: boolean) => void
}) {
	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault()
				setOpen(!open)
			}
		}
		document.addEventListener('keydown', down)
		return () => document.removeEventListener('keydown', down)
	}, [open, setOpen])

	return (
		<CommandDialog open={open} onOpenChange={setOpen}>
			<CommandInput placeholder="Type a command or search..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Suggestions">
					<CommandItem>Calendar</CommandItem>
					<CommandItem>Search Emoji</CommandItem>
					<CommandItem>Calculator</CommandItem>
				</CommandGroup>
			</CommandList>
		</CommandDialog>
	)
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: session } = authClient.useSession()
	const [openCommand, setOpenCommand] = useState(false)

	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
							<Link href="#">
								<IconGrain className="!size-5" />
								<span className="text-base font-semibold">Agent Studio.</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavDocuments items={data.documents} />
				<NavSecondary
					items={data.navSecondary}
					setOpenCommand={setOpenCommand}
					className="mt-auto"
				/>
			</SidebarContent>
			<SidebarFooter>
				<NavUser
					user={{
						name: session?.user.name ?? 'John Doe',
						email: session?.user.email ?? 'johndoe@agentstudio.ai',
						avatar: session?.user.image ?? '/avatars/shadcn.jpg',
					}}
				/>
			</SidebarFooter>
			<CommandMenu open={openCommand} setOpen={setOpenCommand} />
		</Sidebar>
	)
}
