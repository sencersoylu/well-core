import { Hono } from "hono";
import { APP_VERSION } from "@wellcore/shared";
import { authRoute } from "./routes/auth.js";
import { checkinsRoute } from "./routes/checkins.js";
import { profileRoute } from "./routes/profile.js";
import { protocolsRoute } from "./routes/protocols.js";
import { sessionsRoute } from "./routes/sessions.js";
import { userProtocolsRoute } from "./routes/user-protocols.js";

export const app = new Hono()
  .get("/health", (c) => c.json({ ok: true, version: APP_VERSION }))
  .route("/", authRoute)
  .route("/", profileRoute)
  .route("/", protocolsRoute)
  .route("/", userProtocolsRoute)
  .route("/", sessionsRoute)
  .route("/", checkinsRoute);

export type AppType = typeof app;
