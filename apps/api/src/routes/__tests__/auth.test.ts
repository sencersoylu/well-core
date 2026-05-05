import { describe, expect, test } from "vitest";
import { app } from "../../app.js";

describe("auth routes", () => {
  test("GET /auth/me without cookie → 401", async () => {
    const res = await app.request("/auth/me");
    expect(res.status).toBe(401);
  });
  test("better-auth handler is mounted at /api/auth/*", async () => {
    const res = await app.request("/api/auth/sign-in/social", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ provider: "apple", callbackURL: "/" }),
    });
    expect([200, 302, 400]).toContain(res.status);
  });
});
