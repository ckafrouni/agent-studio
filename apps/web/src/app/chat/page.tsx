"use client";
import { useState, useEffect, useRef } from "react";
import { useChatStream } from "@/hooks/useChatStream";
import { Document } from "@/types/chat"; // Import the client-side Document type
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

// Component to render AI response with citations
const AICitationResponse = ({
  content,
  documents,
}: {
  content: string;
  documents?: Document[];
}) => {
  if (!documents || documents.length === 0) {
    return <div>{content}</div>;
  }

  // Matches [doc: suivi par des lettres/chiffres/underscores] suivi par (#quelque chose)
  const citationRegex = /\[doc:(\w+)\]\(.*?\)/g;
  const parts = content.split(citationRegex);

  return (
    <div>
      {parts.map((part, index) => {
        // Even indices are text, odd indices are doc IDs
        if (index % 2 === 0) {
          return <span key={index}>{part}</span>;
        } else {
          const docId = part;
          const document = documents.find((doc) => doc.metadata.id === docId);

          return (
            <Popover key={index}>
              <PopoverTrigger asChild>
                <Badge
                  variant="outline"
                  className="cursor-pointer mx-1 hover:bg-accent hover:text-accent-foreground"
                >
                  [doc:{docId}]
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                {document ? (
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">
                      Source Document
                    </h4>
                    <p className="text-muted-foreground">
                      ID: {document.metadata.id}
                    </p>
                    <p className="max-h-40 overflow-y-auto">
                      {document.pageContent}
                    </p>
                  </div>
                ) : (
                  "Document not found"
                )}
              </PopoverContent>
            </Popover>
          );
        }
      })}
    </div>
  );
};

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
              <AICitationResponse
                content={turn.ai.content as string}
                documents={turn.sourceDocuments}
              />
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
