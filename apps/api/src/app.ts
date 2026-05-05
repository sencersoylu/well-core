import { Hono } from "hono";
import { APP_VERSION } from "@wellcore/shared";
import { authRoute } from "./routes/auth.js";
import { profileRoute } from "./routes/profile.js";
import { protocolsRoute } from "./routes/protocols.js";

export const app = new Hono()
  .get("/health", (c) => c.json({ ok: true, version: APP_VERSION }))
  .route("/", authRoute)
  .route("/", profileRoute)
  .route("/", protocolsRoute);

export type AppType = typeof app;
