"use client";
import { useState, useEffect, useRef } from "react";
import { useChatStream } from "@/hooks/useChatStream";
import { useQueryState } from "nuqs";
import { WorkflowSteps } from "./components/workflow-steps";
import { SourcesBlocks } from "./components/sources-blocks";
import { MarkdownRenderer } from "./components/markdown-renderer";
import { UserMessage } from "./components/user-message";
import { UserInput } from "./components/user-input";

export default function Home() {
  const { turns, sendMessage } = useChatStream();
  const [input, setInput] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useQueryState("workflow", {
    defaultValue: "vector-rag",
  });
  const turnsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (turnsContainerRef.current) {
      turnsContainerRef.current.scrollTop =
        turnsContainerRef.current.scrollHeight;
    }
  }, [turns]);

  return (
    <div className="container mx-auto flex flex-col pt-16">
      <div
        id="turns-container"
        ref={turnsContainerRef}
        className="flex-1 overflow-y-auto space-y-4"
      >
        {turns.map((turn, index) => (
          <div
            key={index}
            className={`mb-16 ${index === turns.length - 1 ? "mb-48" : ""}`}
          >
            <UserMessage content={turn.user.content as string} />
            <WorkflowSteps steps={turn.steps} />
            <MarkdownRenderer
              className="text-sm"
              content={turn.ai?.content as string}
            />
            <SourcesBlocks sourceDocuments={turn.sourceDocuments ?? []} />
          </div>
        ))}
      </div>

      <UserInput
        className="fixed bottom-0 container"
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        selectedWorkflow={selectedWorkflow}
        setSelectedWorkflow={setSelectedWorkflow}
      />
    </div>
  );
}
