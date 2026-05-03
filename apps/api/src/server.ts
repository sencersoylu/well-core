import { ServerEnvSchema } from "@wellcore/shared/env";
import { app } from "./app.js";

const env = ServerEnvSchema.parse(process.env);

export default {
  port: env.PORT,
  fetch: app.fetch,
};

console.log(`[wellcore-api] listening on http://localhost:${env.PORT}`);
