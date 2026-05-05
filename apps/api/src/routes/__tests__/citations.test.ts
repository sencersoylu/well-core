import { describe, expect, test } from "vitest";
import { app } from "../../app.js";

describe("GET /citations", () => {
  test("returns array from @wellcore/shared", async () => {
    const res = await app.request("/citations");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});
