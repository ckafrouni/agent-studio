import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Workflow } from "@/hooks/useChatStream";
import { cn } from "@/lib/utils";
import { Globe, Send } from "lucide-react";

export const UserInput = ({
  input,
  setInput,
  sendMessage,
  selectedWorkflow,
  setSelectedWorkflow,
  className,
}: {
  input: string;
  setInput: (input: string) => void;
  sendMessage: (prompt: string, workflow: Workflow) => Promise<void>;
  selectedWorkflow: string;
  setSelectedWorkflow: (workflow: string) => void;
  className?: string;
}) => {
  return (
    <div className={cn("bg-background pb-4 pt-2", className)}>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          className={`hover:cursor-pointer hover:bg-blue-500 hover:text-secondary ${
            selectedWorkflow === "web-search-rag"
              ? "bg-blue-400 text-secondary"
              : ""
          }`}
          onClick={() =>
            selectedWorkflow === "web-search-rag"
              ? setSelectedWorkflow("vector-rag")
              : setSelectedWorkflow("web-search-rag")
          }
          aria-label="Toggle Web Search Fallback"
        >
          <Globe className="h-4 w-4" />
        </Button>
        <form
          className="flex gap-2 w-full"
          onSubmit={async (e) => {
            e.preventDefault();
            const prompt = input.trim();

            if (!prompt) return;

            setInput("");
            await sendMessage(prompt, selectedWorkflow as Workflow);
          }}
        >
          <Input
            type="text"
            name="prompt"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1"
          />
          <Button
            variant="default"
            className="hover:cursor-pointer"
            type="submit"
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
