import { Button } from '@/components/ui/button'
import { ArrowDown } from 'lucide-react'

export const ScrollButton = ({
	isAutoScrollEnabled,
	handleScrollDownClick,
}: {
	isAutoScrollEnabled: boolean
	handleScrollDownClick: () => void
}) => {
	return (
		<>
			{!isAutoScrollEnabled && (
				<Button
					onClick={handleScrollDownClick}
					className="bg-primary/50 text-primary-foreground hover:bg-primary/80 fixed bottom-24 left-1/2 z-10 -translate-x-1/2 rounded-full shadow-md hover:cursor-pointer"
					aria-label="Scroll to bottom"
				>
					<ArrowDown />
				</Button>
			)}
		</>
	)
}
