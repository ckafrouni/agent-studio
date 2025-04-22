import { Hono } from "hono";

const router = new Hono();

router.get("/", (c) => {
  return c.html("<h1>Server Root</h1>");
});

export default router;
