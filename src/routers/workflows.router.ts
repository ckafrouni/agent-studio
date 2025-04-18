import { Context, Hono } from "hono";
import { stream } from "hono/streaming";
import {
  AIMessageChunk,
  BaseMessage,
  HumanMessage,
} from "@langchain/core/messages";
import { IterableReadableStreamInterface } from "@langchain/core/utils/stream";
import vectorRagWorkflow from "~/lib/workflows/vector-rag";

// MARK: - Helpers
const streamMessages = async (
  c: Context,
  inputs: { messages: BaseMessage[] }
) => {
  try {
    return stream(c, async (stream) => {
      const langchainStream: IterableReadableStreamInterface<
        [AIMessageChunk, unknown]
      > = await vectorRagWorkflow.stream(inputs, {
        streamMode: "messages",
      });

      for await (const [message, _metadata] of langchainStream) {
        console.log("Received chunk:", message.content);
        await stream.write(message.content.toString());
      }
    });
  } catch (error) {
    console.error("Error:", error);
    return c.json({ error: "Failed to process request" }, 500);
  }
};

const streamUpdates = async (
  workflow: any,
  c: Context,
  inputs: { messages: BaseMessage[] }
) => {
  try {
    return stream(c, async (stream) => {
      const eventStream = workflow.streamEvents(inputs, {
        version: "v2",
      });

      for await (const { event, tags, data } of eventStream) {
        console.log("Event:", event, "Tags:", tags, "Data:", data);
        if (event === "on_chat_model_stream") {
          if (data.chunk.content) {
            console.log("Received chunk:", data.chunk.content);
            await stream.write(data.chunk.content.toString());
          }
        }
      }
    });
  } catch (error) {
    console.error("Error:", error);
    return c.json({ error: "Failed to process request" }, 500);
  }
};

// MARK: - Router
const router = new Hono();

router.post("/vector-rag", async (c) => {
  const { prompt } = await c.req.json();

  if (!prompt) {
    return c.json({ error: "Missing prompt" }, 400);
  }

  return streamUpdates(vectorRagWorkflow, c, {
    messages: [
      new HumanMessage({
        content: prompt,
      }),
    ],
  });
});

export default router;
