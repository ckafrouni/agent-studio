import { Context } from "hono";
import { stream } from "hono/streaming";
import type { BaseMessage } from "@langchain/core/messages";
import type { IterableReadableStream } from "@langchain/core/utils/stream";
import vectorRagWorkflow from "~/lib/workflows/vector-rag";

export const streamMessages = async (
  workflow: typeof vectorRagWorkflow,
  c: Context,
  inputs: { messages: BaseMessage[] }
) => {
  try {
    c.header("Content-Type", "application/x-ndjson");

    return stream(c, async (stream) => {
      const messagesStream: IterableReadableStream<[BaseMessage, unknown]> =
        await workflow.stream(inputs, {
          streamMode: ["updates", "messages"],
        });

      for await (const chunk of messagesStream) {
        if (chunk) {
          const ndjsonChunk = `${JSON.stringify(chunk)}\n`;
          await stream.write(ndjsonChunk);
        }
      }
    });
  } catch (error) {
    console.error("Error:", error);
    c.res = c.json({ error: "Failed to process request" }, 500);
  }
};
