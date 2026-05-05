import { describe, expect, test } from "vitest";
import { app } from "../../app.js";

describe("privacy (unauth)", () => {
  test("POST /privacy/dsar → 401", async () => {
    const res = await app.request("/privacy/dsar", { method: "POST", body: "{}", headers: { "content-type": "application/json" } });
    expect(res.status).toBe(401);
  });
});
