import { describe, expect, test } from "vitest";
import { app } from "../../app.js";

describe("sessions routes (unauth)", () => {
  test.each([
    ["POST", "/sessions"],
    ["PATCH", "/sessions/00000000-0000-0000-0000-000000000000"],
    ["GET", "/me/sessions"],
  ])("%s %s → 401", async (method, path) => {
    const res = await app.request(path, {
      method,
      headers: { "content-type": "application/json" },
      body: method === "GET" ? undefined : "{}",
    });
    expect(res.status).toBe(401);
  });
});
