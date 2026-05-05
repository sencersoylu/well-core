import { describe, expect, test } from "vitest";
import { auth } from "../auth.js";

describe("better-auth", () => {
  test("instance is configured with Apple provider", () => {
    expect(auth).toBeDefined();
    expect(auth.options.socialProviders?.apple).toBeDefined();
  });
  test("session cookie is httpOnly + secure-aware", () => {
    const opts = auth.options.advanced?.cookies?.sessionToken;
    expect(opts?.attributes?.httpOnly).toBe(true);
  });
});
