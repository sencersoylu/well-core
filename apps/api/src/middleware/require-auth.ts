import type { MiddlewareHandler } from "hono";
import { auth } from "../auth.js";

export type AuthVariables = {
  user: { id: string; email: string };
  sessionId: string;
};

export const requireAuth: MiddlewareHandler<{ Variables: AuthVariables }> = async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) {
    return c.json({ error: "unauthorized" }, 401);
  }
  c.set("user", { id: session.user.id, email: session.user.email });
  c.set("sessionId", session.session.id);
  await next();
};
