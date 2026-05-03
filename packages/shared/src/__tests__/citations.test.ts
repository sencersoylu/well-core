import { describe, expect, it } from "vitest";
import { citations, getCitation, CitationSchema } from "../citations.js";

describe("citations data layer", () => {
  it("validates every citation against CitationSchema", () => {
    for (const [tag, citation] of Object.entries(citations)) {
      const result = CitationSchema.safeParse(citation);
      expect(result.success, `citation "${tag}" failed: ${JSON.stringify(result.error?.issues ?? "")}`).toBe(true);
    }
  });

  it("looks up a known citation by tag", () => {
    const c = getCitation("hbo-plasma-1500");
    expect(c).toBeDefined();
    expect(c?.source.year).toBeGreaterThan(1900);
  });

  it("returns undefined for unknown tag", () => {
    expect(getCitation("nonexistent-citation-tag-xyz")).toBeUndefined();
  });
});
