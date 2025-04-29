import Link from 'next/link'
import { NavLink } from './NavLink'
import UserMenu from './user-menu'

export function NavBar() {
	return (
		<div className="bg-background fixed top-0 right-0 left-0 z-50 border-b">
			<nav className="container mx-auto flex items-center justify-between pt-2 pb-2">
				<Link href="/chat" className="text-lg font-semibold">
					LangGraph Demo
				</Link>
				<div className="space-x-2">
					<NavLink href="/chat" label="Chat" />
					<NavLink href="/admin" label="Admin" />
					<UserMenu />
				</div>
			</nav>
		</div>
	)
}
