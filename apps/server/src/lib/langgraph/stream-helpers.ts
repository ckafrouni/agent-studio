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
    // Set Content-Type for NDJSON
    c.header("Content-Type", "application/x-ndjson");

    return stream(c, async (stream) => {
      const messagesStream: IterableReadableStream<[BaseMessage, unknown]> =
        await workflow.stream(inputs, {
          streamMode: ["updates", "messages"],
        });

      for await (const chunk of messagesStream) {
        // Check if the chunk itself is valid (not strictly necessary but good practice)
        if (chunk) {
          console.log("Streaming update chunk:", chunk);
          // Format the entire chunk array as NDJSON
          const ndjsonChunk = `${JSON.stringify(chunk)}\n`;
          await stream.write(ndjsonChunk);
        }
      }

      // Optional: Signal the end of the stream if needed, though often not necessary with NDJSON
      // await stream.write("event: end\ndata: {}\n\n");
    });
  } catch (error) {
    console.error("Error:", error);
    // Ensure error response is standard JSON, not NDJSON
    c.res = c.json({ error: "Failed to process request" }, 500);
  }
};

export const streamEvents = async (
  workflow: typeof vectorRagWorkflow,
  c: Context,
  inputs: { messages: BaseMessage[] }
) => {
  try {
    return stream(c, async (stream) => {
      const eventStream = workflow.streamEvents(inputs, {
        version: "v2",
      });

      for await (const event of eventStream) {
        const payload = JSON.stringify(event);
        await stream.write(payload + "\n");
      }
    });
  } catch (error) {
    console.error("Error:", error);
    return c.json({ error: "Failed to process request" }, 500);
  }
};
