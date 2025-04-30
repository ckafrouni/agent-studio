import { AlertTriangle } from 'lucide-react'

export function AlphaBanner() {
	return (
		<div className="w-full bg-amber-500 px-4 py-2 text-center text-amber-950">
			<div className="container flex items-center justify-center gap-2">
				<AlertTriangle className="h-4 w-4" />
				<p className="text-sm font-medium">
					Agent Studio is currently in alpha. Not all features mentioned are fully available yet.
				</p>
			</div>
		</div>
	)
}
