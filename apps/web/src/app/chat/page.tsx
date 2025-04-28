"use client";
import { useState, useEffect, useRef } from "react";
import { useChatStream } from "@/hooks/useChatStream";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { turns, sendMessage } = useChatStream();
  const [input, setInput] = useState("");
  const turnsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (turnsContainerRef.current) {
      turnsContainerRef.current.scrollTop =
        turnsContainerRef.current.scrollHeight;
    }
  }, [turns]);

  return (
    <div className="container mx-auto flex flex-col p-4 pt-24 min-h-screen">
      <div
        id="turns-container"
        ref={turnsContainerRef}
        className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2"
      >
        {turns.map((turn, index) => (
          <div key={index} className="mb-4">
            <div className="px-3 py-2 rounded-lg bg-primary text-primary-foreground">
              {turn.user.content as string}
            </div>

            {turn.steps.length > 0 && (
              <Accordion type="multiple" className="text-muted-foreground">
                {turn.steps.map((step, stepIndex) => {
                  const stepName = Object.values(step)[0] as string;
                  const stepData = Object.values(step)[1] as string;
                  return (
                    <AccordionItem
                      key={stepIndex}
                      value={`turn-${index}-step-${stepIndex}`}
                      className=""
                    >
                      <AccordionTrigger className="text-xs">
                        Step {stepIndex + 1} - {stepName}
                      </AccordionTrigger>
                      <AccordionContent>
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(stepData, null, 2)}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}

            {turn.ai && (
              <div className="prose dark:prose-invert max-w-none text-foreground">
                {/* Directly render AI content using ReactMarkdown */}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]} // Add GFM plugin
                  components={{
                    // Custom renderer for link (a) tags
                    a: ({ /* node is unused */ ...props }) => (
                      <a
                        {...props}
                        target="_blank" // Open in new tab
                        rel="noopener noreferrer" // Security measure for target="_blank"
                      />
                    ),
                  }}
                >
                  {turn.ai.content as string}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}
      </div>

      <form
        className="flex gap-2 sticky bottom-0 bg-background"
        onSubmit={async (e) => {
          e.preventDefault();
          const prompt = input.trim();

          if (!prompt) return;

          setInput("");
          await sendMessage(prompt);
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
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}
