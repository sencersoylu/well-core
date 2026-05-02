import { describe, expect, it } from "vitest";
import { app } from "../app.js";

describe("GET /health", () => {
  it("returns ok and version", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true, version: "0.0.0" });
  });
});
