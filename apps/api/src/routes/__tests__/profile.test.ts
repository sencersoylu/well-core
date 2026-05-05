import { describe, expect, test } from "vitest";
import { app } from "../../app.js";

describe("profile routes (unauth)", () => {
  test("GET /profile → 401", async () => {
    const res = await app.request("/profile");
    expect(res.status).toBe(401);
  });
  test("PUT /profile → 401", async () => {
    const res = await app.request("/profile", { method: "PUT", body: "{}", headers: { "content-type": "application/json" } });
    expect(res.status).toBe(401);
  });
});
