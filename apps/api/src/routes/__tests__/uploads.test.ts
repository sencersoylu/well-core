import { describe, expect, test } from "vitest";
import { app } from "../../app.js";

describe("uploads", () => {
  test("POST /uploads/presign without auth → 401", async () => {
    const res = await app.request("/uploads/presign", { method: "POST", body: "{}", headers: { "content-type": "application/json" } });
    expect(res.status).toBe(401);
  });
});
