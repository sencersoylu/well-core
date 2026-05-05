import { describe, expect, test } from "vitest";
import * as schema from "../schema/index.js";

describe("user schema", () => {
  test("users table is exported with id/email/apple_sub/locale/created_at", () => {
    expect(schema.users).toBeDefined();
    const cols = Object.keys((schema.users as any));
    for (const c of ["id", "email", "appleSub", "locale", "createdAt"]) {
      expect(cols).toContain(c);
    }
  });
  test("profiles, consentEvents, suicidalityScreens are exported", () => {
    expect(schema.profiles).toBeDefined();
    expect(schema.consentEvents).toBeDefined();
    expect(schema.suicidalityScreens).toBeDefined();
  });
});
