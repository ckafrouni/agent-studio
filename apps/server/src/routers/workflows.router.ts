import { Hono } from "hono";
import vectorRagWorkflow from "~/lib/workflows/vector-rag";

import { streamMessages } from "~/lib/langgraph/stream-helpers";
import { HumanMessage } from "@langchain/core/messages";

const router = new Hono();

router.post("/vector-rag/messages", async (c) => {
  const { prompt } = await c.req.json();

  if (!prompt) {
    return c.json({ error: "Missing prompt" }, 400);
  }

  return streamMessages(vectorRagWorkflow, c, {
    messages: [
      new HumanMessage({
        content: prompt,
      }),
    ],
  });
});

export default router;
