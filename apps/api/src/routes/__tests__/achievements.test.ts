import { describe, expect, test } from "vitest";
import { app } from "../../app.js";

describe("achievements (unauth)", () => {
  test("GET /me/achievements → 401", async () => {
    const res = await app.request("/me/achievements");
    expect(res.status).toBe(401);
  });
});
