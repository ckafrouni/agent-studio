import Link from 'next/link'
import { Server } from 'lucide-react'

export function Footer() {
	return (
		<footer className="w-full border-t border-white/10 bg-black py-6">
			<div className="container flex flex-col items-center justify-between gap-4 md:flex-row md:gap-0">
				<div className="flex items-center gap-2">
					<div className="rounded-sm bg-white p-1">
						<Server className="h-4 w-4 text-black" />
					</div>
					<p className="text-sm font-medium text-white/70">
						© {new Date().getFullYear()} Agent Studio. All rights reserved.
					</p>
				</div>
				<nav className="flex gap-4 sm:gap-6">
					<Link href="/terms" className="text-sm font-medium text-white/50 hover:text-white">
						Terms
					</Link>
					<Link href="/privacy" className="text-sm font-medium text-white/50 hover:text-white">
						Privacy
					</Link>
					<Link href="/docs" className="text-sm font-medium text-white/50 hover:text-white">
						Docs
					</Link>
					<Link href="/blog" className="text-sm font-medium text-white/50 hover:text-white">
						Blog
					</Link>
				</nav>
			</div>
		</footer>
	)
}
