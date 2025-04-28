import { Hono } from "hono";
import vectorRagWorkflow from "~/lib/workflows/vector-rag";
import webSearchRagWorkflow from "~/lib/workflows/web-search-rag";

import { streamMessages } from "~/lib/langgraph/stream-helpers";
import { HumanMessage } from "@langchain/core/messages";

const router = new Hono();

router.post("/messages", async (c) => {
  const { prompt, workflow: workflowName = "vector-rag" } = await c.req.json<{
    prompt: string;
    workflow?: string;
  }>();

  if (!prompt) {
    return c.json({ error: "Missing prompt" }, 400);
  }

  const selectedWorkflow =
    workflowName === "web-search-rag"
      ? webSearchRagWorkflow
      : vectorRagWorkflow; // Default to vector-rag

  return streamMessages(selectedWorkflow, c, {
    messages: [
      new HumanMessage({
        content: prompt,
      }),
    ],
  });
});

export default router;
