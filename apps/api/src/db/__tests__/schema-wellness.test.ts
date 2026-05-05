import { describe, expect, test } from "vitest";
import * as schema from "../schema/index.js";

describe("wellness + meta schemas", () => {
  test("wellness_checkins uses STRUCTURED PROMIS columns (not jsonb blob)", () => {
    const t = schema.wellnessCheckins as any;
    for (const c of [
      "userId", "sessionId", "checkinType",
      "promisGlobalPhysical", "promisGlobalMental",
      "painLevel", "energyLevel", "sleepQuality", "focusLevel",
      "notes", "recordedAt",
    ]) {
      expect(Object.keys(t)).toContain(c);
    }
  });
  test("achievements, subscription, dsarRequests are exported", () => {
    expect(schema.achievements).toBeDefined();
    expect(schema.subscription).toBeDefined();
    expect(schema.dsarRequests).toBeDefined();
  });
});
