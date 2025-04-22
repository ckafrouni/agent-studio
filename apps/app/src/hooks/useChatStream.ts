import { useState, useCallback } from "react";
import {
  HumanMessage,
  AIMessage,
  AIMessageChunk,
} from "@langchain/core/messages";
import type { Turn, GraphUpdate, Document } from "@/types/chat";
import { isAIMessageChunk } from "@/lib/utils";
import { env } from "@/env";

export function useChatStream() {
  const [turns, setTurns] = useState<Turn[]>([]);

  const sendMessage = useCallback(async (prompt: string) => {
    // Add user message immediately
    setTurns((prevTurns) => [
      ...prevTurns,
      {
        user: new HumanMessage(prompt),
        steps: [],
        ai: null,
        sourceDocuments: [],
      },
    ]);

    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_SERVER_URL}/api/workflows/vector-rag/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/x-ndjson",
          },
          body: JSON.stringify({ prompt }),
        }
      );

      if (!response.ok || !response.body) {
        console.error("SSE request failed:", response.statusText);
        // Optionally update the last turn with an error message
        setTurns((prevTurns) => {
          const lastTurnIndex = prevTurns.length - 1;
          if (lastTurnIndex < 0) return prevTurns;
          const lastTurn = prevTurns[lastTurnIndex];
          return [
            ...prevTurns.slice(0, -1),
            {
              ...lastTurn,
              ai: new AIMessage(`Error: ${response.statusText}`),
            },
          ];
        });
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim() === "") continue;

          try {
            const parsedData = JSON.parse(line);
            console.log(
              "Received NDJSON update chunk:",
              JSON.stringify(parsedData, null, 2)
            );

            // Check if parsedData is the expected array structure
            if (!Array.isArray(parsedData) || parsedData.length !== 2) {
              console.warn("Received unexpected NDJSON structure:", parsedData);
              continue;
            }

            const [eventType, payload] = parsedData;

            if (eventType === "updates") {
              const update = payload as GraphUpdate;
              // Update steps based on node updates in the payload
              const nodeKeys = Object.keys(update);
              if (nodeKeys.length > 0) {
                const stepName = nodeKeys[0];
                const stepData = (update as Record<string, unknown>)[stepName];
                setTurns((prevTurns) => {
                  const lastTurnIndex = prevTurns.length - 1;
                  if (lastTurnIndex < 0) return prevTurns;
                  const lastTurn = prevTurns[lastTurnIndex];
                  return [
                    ...prevTurns.slice(0, -1),
                    {
                      ...lastTurn,
                      steps: [
                        ...lastTurn.steps,
                        { name: stepName, data: stepData },
                      ],
                    },
                  ];
                });
              }
            } else if (eventType === "messages") {
              // Payload for 'messages' is expected to be an array where the first element is the chunk
              if (!Array.isArray(payload) || payload.length === 0) {
                console.warn(
                  "Received unexpected payload structure for 'messages':",
                  payload
                );
                continue;
              }
              const messageChunk = payload[0]; // Get the actual message chunk object

              // Update AI message based on message chunk content
              if (isAIMessageChunk(messageChunk)) {
                let chunkContent = "";
                // Check for properties of ParsedAIMessageChunk first
                if (
                  "kwargs" in messageChunk &&
                  messageChunk.kwargs &&
                  typeof messageChunk.kwargs.content === "string"
                ) {
                  chunkContent = messageChunk.kwargs.content;
                }
                // Otherwise check for standard AIMessageChunk content
                else if (
                  "content" in messageChunk &&
                  typeof messageChunk.content === "string"
                ) {
                  chunkContent = messageChunk.content;
                }

                if (chunkContent) {
                  setTurns((prevTurns) => {
                    const lastTurnIndex = prevTurns.length - 1;
                    if (lastTurnIndex < 0) return prevTurns;
                    const currentTurn = prevTurns[lastTurnIndex];

                    const currentAIContent =
                      (currentTurn.ai?.content as string) || "";
                    const updatedAIContent = currentAIContent + chunkContent;

                    // Check for source documents in metadata
                    let sourceDocuments = currentTurn.sourceDocuments;
                    const metadataChunk = messageChunk as AIMessageChunk;
                    if (
                      metadataChunk.response_metadata &&
                      "source_documents" in metadataChunk.response_metadata &&
                      Array.isArray(
                        metadataChunk.response_metadata.source_documents
                      )
                    ) {
                      sourceDocuments = metadataChunk.response_metadata
                        .source_documents as Document[];
                    }

                    const updatedTurn = {
                      ...currentTurn,
                      ai: new AIMessage({
                        content: updatedAIContent,
                        // Preserve existing metadata if any, merge with new
                        response_metadata: {
                          ...(currentTurn.ai?.response_metadata || {}),
                          ...(metadataChunk.response_metadata || {}),
                        },
                      }),
                      sourceDocuments, // Update sourceDocuments
                    };

                    // Return the full updated turns array
                    const updatedTurns = [...prevTurns];
                    updatedTurns[lastTurnIndex] = updatedTurn;
                    return updatedTurns;
                  });
                }
              } else {
                console.warn(
                  "Received non-AIMessageChunk structure inside messages event:",
                  messageChunk
                );
              }
            } else {
              console.warn("Received unknown event type:", eventType);
            }
          } catch (error) {
            console.error("Failed to parse NDJSON line:", error, line);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching chat stream:", error);
      // Optionally update UI to show a general error
      setTurns((prevTurns) => {
        const lastTurnIndex = prevTurns.length - 1;
        if (lastTurnIndex < 0) return prevTurns;
        const lastTurn = prevTurns[lastTurnIndex];
        return [
          ...prevTurns.slice(0, -1),
          {
            ...lastTurn,
            ai: new AIMessage(`Error: Failed to connect or process stream.`), // More generic error
          },
        ];
      });
    }
  }, []); // Empty dependency array ensures sendMessage function identity is stable

  return { turns, sendMessage };
}
