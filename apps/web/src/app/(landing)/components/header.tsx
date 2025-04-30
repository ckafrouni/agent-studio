import Link from 'next/link'
import { Server } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
	return (
		<header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
			<div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
				<div className="flex gap-6 md:gap-10">
					<Link href="/" className="flex items-center space-x-2">
						<Server className="h-6 w-6" />
						<span className="inline-block font-extrabold">Agent Studio</span>
					</Link>
					<nav className="hidden gap-6 md:flex">
						<Link
							href="#features"
							className="text-muted-foreground hover:text-foreground flex items-center text-sm font-medium transition-colors"
						>
							Features
						</Link>
						<Link
							href="#how-it-works"
							className="text-muted-foreground hover:text-foreground flex items-center text-sm font-medium transition-colors"
						>
							How It Works
						</Link>
						<Link
							href="#pricing"
							className="text-muted-foreground hover:text-foreground flex items-center text-sm font-medium transition-colors"
						>
							Pricing
						</Link>
						<Link
							href="#faq"
							className="text-muted-foreground hover:text-foreground flex items-center text-sm font-medium transition-colors"
						>
							FAQ
						</Link>
					</nav>
				</div>
				<div className="flex flex-1 items-center justify-end space-x-4">
					<nav className="flex items-center space-x-4">
						<Link
							href="/login"
							className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
						>
							Login
						</Link>
						<Button asChild>
							<Link href="/login">Get Started</Link>
						</Button>
					</nav>
				</div>
			</div>
		</header>
	)
}
