import { describe, expect, it } from "vitest";
import { evidenceLevelToDots, type EvidenceLevel } from "../evidence.js";

describe("evidenceLevelToDots", () => {
  it("maps strong to 3 filled", () => {
    expect(evidenceLevelToDots("strong")).toEqual({ filled: 3, total: 3 });
  });
  it("maps moderate to 2 filled", () => {
    expect(evidenceLevelToDots("moderate")).toEqual({ filled: 2, total: 3 });
  });
  it("maps weak to 1 filled", () => {
    expect(evidenceLevelToDots("weak")).toEqual({ filled: 1, total: 3 });
  });
  it("maps absent to 0 filled", () => {
    expect(evidenceLevelToDots("absent")).toEqual({ filled: 0, total: 3 });
  });
});
