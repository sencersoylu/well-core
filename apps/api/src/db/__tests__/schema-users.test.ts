import { describe, expect, test } from "vitest";
import * as schema from "../schema/index.js";

describe("user schema", () => {
  test("auth_user is the canonical user table; legacy users table is removed", () => {
    expect((schema as any).users).toBeUndefined();
    expect(schema.authUser).toBeDefined();
    const cols = Object.keys(schema.authUser as any);
    for (const c of ["id", "email", "emailVerified", "createdAt"]) {
      expect(cols).toContain(c);
    }
  });
  test("profiles, consentEvents, suicidalityScreens are exported", () => {
    expect(schema.profiles).toBeDefined();
    expect(schema.consentEvents).toBeDefined();
    expect(schema.suicidalityScreens).toBeDefined();
  });
});
