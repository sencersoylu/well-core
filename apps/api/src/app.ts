import { Hono } from "hono";
import { APP_VERSION } from "@wellcore/shared";

export const app = new Hono()
  .get("/health", (c) => c.json({ ok: true, version: APP_VERSION }));

export type AppType = typeof app;
