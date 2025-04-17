import { Context, Hono } from "hono";
import { stream } from "hono/streaming";
import { env } from "@/env";
import { AzureChatOpenAI } from "@langchain/openai";
import {
  AIMessageChunk,
  BaseMessage,
  HumanMessage,
} from "@langchain/core/messages";
import { IterableReadableStreamInterface } from "@langchain/core/utils/stream";
import {
  graphWorkflow,
  GraphAnnotation,
  GraphAnnotationType,
} from "@/graphs/rag";
import { StreamEvent } from "@langchain/core/tracers/log_stream";
import { CompiledStateGraph, StateGraph } from "@langchain/langgraph";

// MARK: - LLM Config
const model = new AzureChatOpenAI({
  azureOpenAIApiVersion: env.AZURE_OPENAI_API_VERSION,
  azureOpenAIApiKey: env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiInstanceName: env.AZURE_OPENAI_API_INSTANCE_NAME,
  azureOpenAIApiDeploymentName: env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
  model: env.AZURE_OPENAI_CHAT_MODEL,
  streaming: true,
});

// MARK: - Helpers
const streamMessages = async (
  c: Context,
  inputs: { messages: BaseMessage[] }
) => {
  try {
    return stream(c, async (stream) => {
      const langchainStream: IterableReadableStreamInterface<
        [AIMessageChunk, unknown]
      > = await graphWorkflow.stream(inputs, {
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

router.post("/rag", async (c) => {
  const { prompt } = await c.req.json();

  if (!prompt) {
    return c.json({ error: "Missing prompt" }, 400);
  }

  return streamUpdates(graphWorkflow, c, {
    messages: [
      new HumanMessage({
        content: prompt,
      }),
    ],
  });
});

export default router;
