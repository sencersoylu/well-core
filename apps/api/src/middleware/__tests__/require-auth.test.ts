import { describe, expect, test } from "vitest";
import { Hono } from "hono";
import { requireAuth } from "../require-auth.js";

describe("requireAuth", () => {
  const app = new Hono().use("/me/*", requireAuth).get("/me/ping", (c) => c.json({ ok: true }));

  test("returns 401 when no cookie", async () => {
    const res = await app.request("/me/ping");
    expect(res.status).toBe(401);
  });

  test("returns 401 when invalid cookie", async () => {
    const res = await app.request("/me/ping", { headers: { cookie: "better-auth.session=garbage" } });
    expect(res.status).toBe(401);
  });
});
