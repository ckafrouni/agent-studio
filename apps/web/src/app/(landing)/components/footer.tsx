import Link from 'next/link'
import { Server } from 'lucide-react'

export function Footer() {
	return (
		<footer className="w-full border-t border-black/10 bg-white py-6 dark:border-white/10 dark:bg-black">
			<div className="container flex flex-col items-center justify-between gap-4 md:flex-row md:gap-0">
				<div className="flex items-center gap-2">
					<div className="rounded-sm bg-black p-1 dark:bg-white">
						<Server className="h-4 w-4 text-white dark:text-black" />
					</div>
					<p className="text-muted-foreground text-sm font-medium">
						© {new Date().getFullYear()} Agent Studio. All rights reserved.
					</p>
				</div>
				<nav className="flex gap-4 sm:gap-6">
					<Link
						href="/terms"
						className="text-muted-foreground text-sm font-medium hover:text-black dark:hover:text-white"
					>
						Terms
					</Link>
					<Link
						href="/privacy"
						className="text-muted-foreground text-sm font-medium hover:text-black dark:hover:text-white"
					>
						Privacy
					</Link>
					<Link
						href="/docs"
						className="text-muted-foreground text-sm font-medium hover:text-black dark:hover:text-white"
					>
						Docs
					</Link>
					<Link
						href="/blog"
						className="text-muted-foreground text-sm font-medium hover:text-black dark:hover:text-white"
					>
						Blog
					</Link>
				</nav>
			</div>
		</footer>
	)
}
