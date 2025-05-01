'use client'
import { useState, useEffect, useRef } from 'react'
import { useChatStream } from '@/hooks/useChatStream'
import { useQueryState } from 'nuqs'
import { WorkflowSteps } from './components/workflow-steps'
import { SourcesBlocks } from './components/sources-blocks'
import { MarkdownRenderer } from './components/markdown-renderer'
import { UserMessage } from './components/user-message'
import { UserInput } from './components/user-input'
import { ScrollButton } from './components/scroll-button'
import { DatabaseIcon, GlobeIcon } from 'lucide-react'

const workflowOptions = [
	{ name: 'vector-rag', label: 'Vector RAG', icon: DatabaseIcon },
	{ name: 'web-search-rag', label: 'Web Search', icon: GlobeIcon },
]

export default function Home() {
	const { turns, sendMessage } = useChatStream()
	const [input, setInput] = useState('')
	const [selectedWorkflow, setSelectedWorkflow] = useQueryState('workflow', {
		defaultValue: 'vector-rag',
	})
	const turnsContainerRef = useRef<HTMLDivElement>(null)
	const bottomRef = useRef<HTMLDivElement>(null)
	const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)

	useEffect(() => {
		if (isAutoScrollEnabled) {
			bottomRef.current?.scrollIntoView()
		}
	}, [turns, isAutoScrollEnabled])

	useEffect(() => {
		const container = turnsContainerRef.current
		if (!container) return

		const handleScroll = () => {
			const { scrollTop, scrollHeight, clientHeight } = container
			const isAtBottom = scrollHeight - scrollTop - clientHeight < 5

			if (!isAtBottom && isAutoScrollEnabled) {
				setIsAutoScrollEnabled(false)
			} else if (isAtBottom && !isAutoScrollEnabled) {
				setIsAutoScrollEnabled(true)
			}
		}

		container.addEventListener('scroll', handleScroll, { passive: true })

		return () => {
			container.removeEventListener('scroll', handleScroll)
		}
	}, [isAutoScrollEnabled])

	const handleScrollDownClick = () => {
		setIsAutoScrollEnabled(true)
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	return (
		<div className="flex h-full flex-col">
			<div
				id="turns-container"
				ref={turnsContainerRef}
				className="container mx-auto flex-1 overflow-y-auto px-4"
			>
				{turns.map((turn, index) => (
					<div key={index} className={`mb-16`}>
						<UserMessage content={turn.user.content as string} />
						<WorkflowSteps steps={turn.steps} />
						<MarkdownRenderer className="text-sm" content={turn.ai?.content as string} />
						<SourcesBlocks sourceDocuments={turn.sourceDocuments ?? []} />
					</div>
				))}
				<div ref={bottomRef} />
			</div>

			<ScrollButton
				isAutoScrollEnabled={isAutoScrollEnabled}
				handleScrollDownClick={handleScrollDownClick}
			/>

			{/* Sticky container for the user input */}
			<div className="bg-background sticky bottom-0 w-full px-4 py-4">
				<UserInput
					input={input}
					setInput={setInput}
					sendMessage={sendMessage}
					selectedWorkflow={selectedWorkflow}
					setSelectedWorkflow={setSelectedWorkflow}
					workflowOptions={workflowOptions}
				/>
			</div>
		</div>
	)
}
