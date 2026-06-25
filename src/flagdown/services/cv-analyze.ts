import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

import { getCvSampleById } from "~/flagdown/constants/cv-samples";
import type { CvAnalysisResult, CvDetection } from "~/flagdown/types/cv";
import { cvAnalysisResultSchema } from "~/flagdown/types/cv";
import { env } from "~/env";

const visionResultSchema = z.object({
  sharkDetected: z.boolean(),
  confidence: z.number().min(0).max(1),
  summary: z.string(),
  bbox: z
    .object({
      x: z.number().min(0).max(1),
      y: z.number().min(0).max(1),
      width: z.number().min(0).max(1),
      height: z.number().min(0).max(1),
    })
    .optional(),
});

export type AnalyzeSharkImageInput = {
  imageBase64?: string;
  sampleId?: string;
  /** Detections produced on-device by the client OWL-ViT detector. */
  clientDetections?: CvDetection[];
};

const SHARK_LABEL_RE = /shark|dorsal fin/i;

function summarizeClientDetections(detections: CvDetection[]): {
  sharkDetected: boolean;
  confidence: number;
  summary: string;
  bbox?: CvAnalysisResult["bbox"];
  detections: CvDetection[];
} {
  const sorted = [...detections].sort((a, b) => b.score - a.score);
  const sharks = sorted.filter((d) => SHARK_LABEL_RE.test(d.label));
  const topShark = sharks[0];
  const sharkDetected = Boolean(topShark && topShark.score >= 0.1);

  const confidence = sharkDetected
    ? topShark!.score
    : sorted.length > 0
      ? Math.max(0, 1 - sorted[0]!.score)
      : 0.5;

  const summary = sharkDetected
    ? `On-device OWL-ViT: ${sharks.length} shark detection(s), top confidence ${(topShark!.score * 100).toFixed(0)}% across ${sorted.length} objects.`
    : sorted.length > 0
      ? `On-device OWL-ViT: no shark. ${sorted.length} object(s) (top: "${sorted[0]!.label}" @ ${(sorted[0]!.score * 100).toFixed(0)}%).`
      : "On-device OWL-ViT: no objects above threshold.";

  return {
    sharkDetected,
    confidence,
    summary,
    bbox: topShark?.bbox,
    detections: sorted,
  };
}

export async function analyzeSharkImage(
  input: AnalyzeSharkImageInput,
): Promise<CvAnalysisResult> {
  if (input.sampleId) {
    const sample = getCvSampleById(input.sampleId);
    if (sample) {
      return sample.preset;
    }
  }

  if (input.clientDetections && input.clientDetections.length > 0) {
    const det = summarizeClientDetections(input.clientDetections);
    return cvAnalysisResultSchema.parse({
      ...det,
      model: "owlvit-base-patch32",
      datasetRef: "owlvit-zero-shot-marine",
    });
  }

  const base64 = input.imageBase64?.replace(/^data:image\/\w+;base64,/, "");

  if (!base64) {
    return {
      sharkDetected: true,
      confidence: 0.87,
      summary: "Demo fallback: shark-like object detected in Manly drone frame.",
      bbox: { x: 0.4, y: 0.4, width: 0.2, height: 0.15 },
      detections: [
        {
          label: "shark",
          score: 0.87,
          bbox: { x: 0.4, y: 0.4, width: 0.2, height: 0.15 },
        },
      ],
      model: "demo-fallback",
      datasetRef: "underwater-yolov8",
    };
  }

  if (!env.OPENAI_API_KEY) {
    return {
      sharkDetected: true,
      confidence: 0.84,
      summary:
        "No OPENAI_API_KEY — demo fallback on uploaded frame (use on-device OWL-ViT or Kaggle-trained YOLO in prod).",
      bbox: { x: 0.35, y: 0.38, width: 0.25, height: 0.16 },
      detections: [
        {
          label: "shark",
          score: 0.84,
          bbox: { x: 0.35, y: 0.38, width: 0.25, height: 0.16 },
        },
      ],
      model: "demo-fallback",
      datasetRef: "underwater-yolov8",
    };
  }

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: visionResultSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are a drone beach patrol CV model. Does this image contain a shark or shark-like object visible in the water?
Return normalized bounding box (0-1) if sharkDetected is true. Be conservative — only flag clear shark shapes.`,
          },
          { type: "image", image: base64 },
        ],
      },
    ],
  });

  const detections: CvDetection[] = object.bbox
    ? [{ label: "shark", score: object.confidence, bbox: object.bbox }]
    : [];

  return cvAnalysisResultSchema.parse({
    ...object,
    detections,
    model: "gpt-4o-mini",
    datasetRef: "underwater-yolov8",
  });
}
