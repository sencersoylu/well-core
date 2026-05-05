import { describe, expect, test } from "vitest";
import { app } from "../../app.js";

describe("user-protocols routes (unauth)", () => {
  test.each([
    ["GET", "/me/protocols"],
    ["POST", "/me/protocols"],
    ["PATCH", "/me/protocols/00000000-0000-0000-0000-000000000000"],
  ])("%s %s → 401", async (method, path) => {
    const res = await app.request(path, {
      method,
      headers: { "content-type": "application/json" },
      body: method === "GET" ? undefined : "{}",
    });
    expect(res.status).toBe(401);
  });
});
