import { describe, expect, test } from "vitest";
import { app } from "../../app.js";

describe("GET /protocols", () => {
  test("returns array (may be empty pre-seed)", async () => {
    const res = await app.request("/protocols");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
  test("GET /protocols/:slug returns 404 for unknown", async () => {
    const res = await app.request("/protocols/does-not-exist");
    expect(res.status).toBe(404);
  });
});
