import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import agentsRouter from "@/routers/agents-router";
import rootRouter from "@/routers/root";

const app = new Hono();

app.use(logger());
app.use(cors());

app.route("/agents", agentsRouter);
app.route("/", rootRouter);

app.get("/heartbeat", (c) => {
  return c.json(
    {
      status: "alive",
      timestamp: new Date().toISOString(),
    },
    200
  );
});

export default app;
