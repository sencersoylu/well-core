import { describe, expect, test } from "vitest";
import { app } from "../../app.js";

describe("checkins routes (unauth)", () => {
  test.each([
    ["POST", "/checkins"],
    ["GET", "/me/checkins"],
  ])("%s %s → 401", async (method, path) => {
    const res = await app.request(path, {
      method,
      headers: { "content-type": "application/json" },
      body: method === "GET" ? undefined : "{}",
    });
    expect(res.status).toBe(401);
  });
});
