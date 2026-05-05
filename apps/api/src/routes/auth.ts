import { Hono } from "hono";
import { auth } from "../auth.js";
import { requireAuth, type AuthVariables } from "../middleware/require-auth.js";

export const authRoute = new Hono<{ Variables: AuthVariables }>()
  .all("/api/auth/*", (c) => auth.handler(c.req.raw))
  .get("/auth/me", requireAuth, (c) => {
    const user = c.var.user;
    return c.json({ user });
  })
  .post("/auth/signout", async (c) => {
    return auth.handler(
      new Request(new URL("/api/auth/sign-out", c.req.url).toString(), {
        method: "POST",
        headers: c.req.raw.headers,
      }),
    );
  });
