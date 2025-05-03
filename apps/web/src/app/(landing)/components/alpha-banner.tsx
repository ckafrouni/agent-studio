import { AlertTriangle } from 'lucide-react'

export function AlphaBanner() {
	return (
		<div className="w-full border-b border-black/10 bg-black px-4 py-2 text-center text-white dark:border-white/10 dark:bg-black">
			<div className="container flex items-center justify-center gap-2">
				<AlertTriangle className="h-4 w-4 text-[oklch(0.577_0.245_27.325)]" />
				<p className="text-sm font-medium">
					Agent Studio is currently in alpha. Not all features mentioned are fully available yet.
				</p>
			</div>
		</div>
	)
}
