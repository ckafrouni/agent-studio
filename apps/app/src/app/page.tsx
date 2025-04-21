"use client";
import { useState } from "react";
// Removed unused imports: HumanMessage, AIMessage, AIMessageChunk, Turn
import { useChatStream } from "@/hooks/useChatStream";

export default function Home() {
  const { turns, sendMessage } = useChatStream();
  const [input, setInput] = useState("");

  return (
    <div className="flex flex-col p-4">
      <div id="turns-container">
        {turns.map((turn, index) => (
          <div key={index} className="mb-4 pb-4 border-b last:border-b-0">
            <div className="mb-2">
              <strong>User:</strong> {turn.user.content as string}{" "}
            </div>

            {turn.steps.length > 0 && (
              <div className="mb-2 pl-4">
                {turn.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="text-sm text-gray-600 mb-2">
                    <strong className="font-semibold">[{step.name}]:</strong>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mt-1">
                      {JSON.stringify(step.data, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {turn.ai && (
              <div className="mb-2">
                <strong>AI:</strong> {turn.ai.content as string}{" "}
              </div>
            )}
          </div>
        ))}
      </div>

      <form
        className="flex gap-2 mt-4 pt-4 border-t"
        onSubmit={async (e) => {
          e.preventDefault();
          const prompt = input;

          if (!prompt) return; // Do nothing if input is empty

          setInput("");
          await sendMessage(prompt);
        }}
      >
        <input
          className="border rounded"
          type="text"
          name="prompt"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="border rounded hover:bg-gray-100 active:bg-gray-200"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
