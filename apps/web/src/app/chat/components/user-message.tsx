import { MarkdownRenderer } from './markdown-renderer'

export const UserMessage = ({ content }: { content: string }) => {
	return (
		<MarkdownRenderer className="bg-secondary rounded-lg px-3 py-2 text-sm" content={content} />
	)
}
