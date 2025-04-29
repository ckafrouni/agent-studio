import { MarkdownRenderer } from "./markdown-renderer";

export const UserMessage = ({ content }: { content: string }) => {
  return (
    <MarkdownRenderer
      className="text-sm px-3 py-2 rounded-lg bg-secondary"
      content={content}
    />
  );
};
