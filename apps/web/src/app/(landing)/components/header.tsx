import Link from 'next/link'
import { Server } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
	return (
		<header className="sticky top-0 z-50 w-full border-b border-black/10 bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-black/80 dark:supports-[backdrop-filter]:bg-black/50">
			<div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
				<div className="flex gap-6 md:gap-10">
					<Link href="/" className="flex items-center space-x-2">
						<div className="rounded-sm bg-black p-1 dark:bg-white">
							<Server className="h-5 w-5 text-white dark:text-black" />
						</div>
						<span className="inline-block font-bold">Agent Studio</span>
					</Link>
					<nav className="hidden gap-6 md:flex">
						<Link
							href="#features"
							className="text-muted-foreground flex items-center text-sm font-medium transition-colors hover:text-black dark:hover:text-white"
						>
							Features
						</Link>
						<Link
							href="#how-it-works"
							className="text-muted-foreground flex items-center text-sm font-medium transition-colors hover:text-black dark:hover:text-white"
						>
							How It Works
						</Link>
						<Link
							href="#pricing"
							className="text-muted-foreground flex items-center text-sm font-medium transition-colors hover:text-black dark:hover:text-white"
						>
							Pricing
						</Link>
						<Link
							href="#faq"
							className="text-muted-foreground flex items-center text-sm font-medium transition-colors hover:text-black dark:hover:text-white"
						>
							FAQ
						</Link>
					</nav>
				</div>
				<div className="flex flex-1 items-center justify-end space-x-4">
					<nav className="flex items-center space-x-2">
						<ThemeToggle />
						<Link
							href="/login"
							className="text-muted-foreground text-sm font-medium transition-colors hover:text-black dark:hover:text-white"
						>
							Login
						</Link>
						<Button className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90">
							<Link href="/signup">Get Started</Link>
						</Button>
					</nav>
				</div>
			</div>
		</header>
	)
}
