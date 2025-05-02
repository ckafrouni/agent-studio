import Link from 'next/link'
import { Server } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
	return (
		<header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-lg supports-[backdrop-filter]:bg-black/50">
			<div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
				<div className="flex gap-6 md:gap-10">
					<Link href="/" className="flex items-center space-x-2">
						<div className="rounded-sm bg-white p-1">
							<Server className="h-5 w-5 text-black" />
						</div>
						<span className="inline-block font-bold">Agent Studio</span>
					</Link>
					<nav className="hidden gap-6 md:flex">
						<Link
							href="#features"
							className="flex items-center text-sm font-medium text-white/70 transition-colors hover:text-white"
						>
							Features
						</Link>
						<Link
							href="#how-it-works"
							className="flex items-center text-sm font-medium text-white/70 transition-colors hover:text-white"
						>
							How It Works
						</Link>
						<Link
							href="#pricing"
							className="flex items-center text-sm font-medium text-white/70 transition-colors hover:text-white"
						>
							Pricing
						</Link>
						<Link
							href="#faq"
							className="flex items-center text-sm font-medium text-white/70 transition-colors hover:text-white"
						>
							FAQ
						</Link>
					</nav>
				</div>
				<div className="flex flex-1 items-center justify-end space-x-4">
					<nav className="flex items-center space-x-2">
						<Button asChild variant="outline" className="bg-white text-black hover:bg-white/90">
							<Link href="/login">Login</Link>
						</Button>
						<Button asChild variant="default" className="bg-white text-black hover:bg-white/90">
							<Link href="/signup">Get Started</Link>
						</Button>
					</nav>
				</div>
			</div>
		</header>
	)
}
