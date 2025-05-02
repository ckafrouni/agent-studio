import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { IconBrandGithub, IconChevronRight } from '@tabler/icons-react'
import Link from 'next/link'

export function SiteHeader({ breadcrumbs }: { breadcrumbs: string[] }) {
	return (
		<header className="h-(--header-height) group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) flex shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<SidebarTrigger className="-ml-1" />
				<Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
				{breadcrumbs.map((breadcrumb, index) => (
					<div key={index} className="flex items-center gap-2">
						{index > 0 && <IconChevronRight className="size-4" />}
						<h1 className="text-base font-medium">{breadcrumb}</h1>
					</div>
				))}
				<div className="ml-auto flex items-center gap-2">
					<Button variant="ghost" asChild size="sm" className="hidden sm:flex">
						<Link
							href="https://github.com/ckafrouni/agent-studio"
							rel="noopener noreferrer"
							target="_blank"
							className="dark:text-foreground"
						>
							<IconBrandGithub />
						</Link>
					</Button>
				</div>
			</div>
		</header>
	)
}
