import { describe, expect, it } from "vitest";

import { getCvSampleById } from "~/flagdown/constants/cv-samples";
import { analyzeSharkImage } from "~/flagdown/services/cv-analyze";

describe("CV samples", () => {
  it("returns shark positive preset for shark-aerial sample", async () => {
    const result = await analyzeSharkImage({ sampleId: "shark-aerial" });
    expect(result.sharkDetected).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.bbox).toBeDefined();
    expect(result.model).toBe("preset");
  });

  it("returns negative preset for clear-water sample", async () => {
    const result = await analyzeSharkImage({ sampleId: "clear-water" });
    expect(result.sharkDetected).toBe(false);
  });

  it("getCvSampleById finds samples", () => {
    expect(getCvSampleById("shark-aerial")?.name).toMatch(/shark/i);
    expect(getCvSampleById("missing")).toBeUndefined();
  });
});
