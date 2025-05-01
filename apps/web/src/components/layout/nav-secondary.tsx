'use client'

import * as React from 'react'
import { IconSearch, type Icon } from '@tabler/icons-react'

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'
import Link from 'next/link'

export function NavSecondary({
	items,
	setOpenCommand,
	...props
}: {
	setOpenCommand: (open: boolean) => void
	items: {
		title: string
		url: string
		icon: Icon
	}[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton asChild>
								<Link href={item.url}>
									<item.icon />
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
					<SidebarMenuItem key="search">
						<SidebarMenuButton asChild>
							<button className="flex justify-between" onClick={() => setOpenCommand(true)}>
								<div className="flex items-center gap-2">
									<IconSearch className="size-4" />
									<span>Search</span>
								</div>
								<kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
									<span className="text-sm">⌘</span>K
								</kbd>
							</button>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	)
}
