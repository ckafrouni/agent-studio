import Link from 'next/link'
import { Server } from 'lucide-react'

export function Footer() {
	return (
		<footer className="bg-background w-full border-t py-6">
			<div className="container flex flex-col items-center justify-between gap-4 md:flex-row md:gap-0">
				<div className="flex items-center gap-2">
					<Server className="h-5 w-5" />
					<p className="text-sm font-medium">
						© {new Date().getFullYear()} Agent Studio. All rights reserved.
					</p>
				</div>
				<nav className="flex gap-4 sm:gap-6">
					<Link href="#" className="text-muted-foreground text-sm font-medium hover:underline">
						Terms
					</Link>
					<Link href="#" className="text-muted-foreground text-sm font-medium hover:underline">
						Privacy
					</Link>
					<Link href="#" className="text-muted-foreground text-sm font-medium hover:underline">
						Docs
					</Link>
					<Link href="#" className="text-muted-foreground text-sm font-medium hover:underline">
						Blog
					</Link>
				</nav>
			</div>
		</footer>
	)
}
