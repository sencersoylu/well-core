import { describe, expect, test } from "vitest";
import { CheckinCreateSchema } from "../checkins.js";

describe("CheckinCreateSchema", () => {
  test("valid payload parses", () => {
    const r = CheckinCreateSchema.safeParse({
      checkinType: "pre",
      promisGlobalPhysical: 4, promisGlobalMental: 4,
      painLevel: 2, energyLevel: 7, sleepQuality: 6, focusLevel: 7,
    });
    expect(r.success).toBe(true);
  });
  test("rejects out-of-range PROMIS", () => {
    const r = CheckinCreateSchema.safeParse({
      checkinType: "post", promisGlobalPhysical: 9, promisGlobalMental: 3,
      painLevel: 1, energyLevel: 5, sleepQuality: 5, focusLevel: 5,
    });
    expect(r.success).toBe(false);
  });
  test("rejects notes > 500 chars", () => {
    const r = CheckinCreateSchema.safeParse({
      checkinType: "pre", promisGlobalPhysical: 3, promisGlobalMental: 3,
      painLevel: 0, energyLevel: 0, sleepQuality: 0, focusLevel: 0,
      notes: "x".repeat(501),
    });
    expect(r.success).toBe(false);
  });
});
