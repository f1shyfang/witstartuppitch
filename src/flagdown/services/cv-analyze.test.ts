import { describe, expect, it } from "vitest";

import { getCvSampleById } from "~/flagdown/constants/cv-samples";
import { analyzeSharkImage } from "~/flagdown/services/cv-analyze";
import type { CvDetection } from "~/flagdown/types/cv";

describe("CV samples", () => {
  it("returns shark positive preset for shark-aerial sample", async () => {
    const result = await analyzeSharkImage({ sampleId: "shark-aerial" });
    expect(result.sharkDetected).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.bbox).toBeDefined();
    expect(result.model).toBe("preset");
    expect(result.detections.length).toBeGreaterThan(0);
    const hasShark = result.detections.some((d) => /shark/i.test(d.label));
    expect(hasShark).toBe(true);
  });

  it("returns negative preset for clear-water sample", async () => {
    const result = await analyzeSharkImage({ sampleId: "clear-water" });
    expect(result.sharkDetected).toBe(false);
    expect(result.detections.length).toBeGreaterThan(0);
    const hasShark = result.detections.some((d) => /shark/i.test(d.label));
    expect(hasShark).toBe(false);
  });

  it("returns shark positive preset for reef-shark sample with danger tags", async () => {
    const result = await analyzeSharkImage({ sampleId: "reef-shark" });
    expect(result.sharkDetected).toBe(true);
    expect(result.topDanger).toBe("high");
    expect(result.detections.some((d) => d.danger === "high")).toBe(true);
  });

  it("getCvSampleById finds samples", () => {
    expect(getCvSampleById("shark-aerial")?.name).toMatch(/shark/i);
    expect(getCvSampleById("missing")).toBeUndefined();
  });
});

describe("analyzeSharkImage — client on-device detections path", () => {
  const sharkDet: CvDetection = {
    label: "shark in water",
    score: 0.82,
    bbox: { x: 0.38, y: 0.42, width: 0.22, height: 0.14 },
  };
  const swimmerDet: CvDetection = {
    label: "person swimming in water",
    score: 0.41,
    bbox: { x: 0.12, y: 0.55, width: 0.08, height: 0.12 },
  };

  it("ingests a threat when client detections contain a shark above threshold", async () => {
    const result = await analyzeSharkImage({
      clientDetections: [sharkDet, swimmerDet],
    });
    expect(result.sharkDetected).toBe(true);
    expect(result.confidence).toBeCloseTo(0.82, 5);
    expect(result.model).toBe("owlvit-base-patch32");
    expect(result.bbox).toEqual(sharkDet.bbox);
    expect(result.detections.length).toBe(2);
    // sorted by score desc
    expect(result.detections[0]?.label).toMatch(/shark/i);
  });

  it("does NOT flag a shark when only non-shark detections are present", async () => {
    const result = await analyzeSharkImage({
      clientDetections: [swimmerDet],
    });
    expect(result.sharkDetected).toBe(false);
    expect(result.detections.length).toBe(1);
  });

  it("does NOT flag a shark below threshold", async () => {
    const weakShark: CvDetection = {
      label: "shark",
      score: 0.05,
      bbox: { x: 0.4, y: 0.4, width: 0.2, height: 0.1 },
    };
    const result = await analyzeSharkImage({
      clientDetections: [weakShark, swimmerDet],
    });
    expect(result.sharkDetected).toBe(false);
  });

  it("uses FlagDown YOLO model id and danger when clientModel is set", async () => {
    const yoloShark: CvDetection = {
      label: "shark",
      score: 0.91,
      bbox: { x: 0.5, y: 0.5, width: 0.2, height: 0.1 },
      danger: "high",
    };
    const jelly: CvDetection = {
      label: "jellyfish",
      score: 0.55,
      bbox: { x: 0.2, y: 0.2, width: 0.1, height: 0.1 },
      danger: "moderate",
    };
    const result = await analyzeSharkImage({
      clientDetections: [yoloShark, jelly],
      clientModel: "flagdown-yolov8n",
    });
    expect(result.model).toBe("flagdown-yolov8n");
    expect(result.datasetRef).toBe("kaggle/underwater-yolov8");
    expect(result.sharkDetected).toBe(true);
    expect(result.topDanger).toBe("high");
    expect(result.summary).toMatch(/FlagDown YOLO/i);
  });

  it("demo-fallback carries detections when no input provided", async () => {
    const result = await analyzeSharkImage({});
    expect(result.sharkDetected).toBe(true);
    expect(result.model).toBe("demo-fallback");
    expect(result.detections.length).toBeGreaterThan(0);
  });
});
