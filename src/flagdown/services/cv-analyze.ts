import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

import { getCvSampleById } from "~/flagdown/constants/cv-samples";
import type { CvAnalysisResult } from "~/flagdown/types/cv";
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

export async function analyzeSharkImage(input: {
  imageBase64?: string;
  sampleId?: string;
}): Promise<CvAnalysisResult> {
  if (input.sampleId) {
    const sample = getCvSampleById(input.sampleId);
    if (sample) {
      return sample.preset;
    }
  }

  const base64 = input.imageBase64?.replace(/^data:image\/\w+;base64,/, "");

  if (!base64) {
    return {
      sharkDetected: true,
      confidence: 0.87,
      summary: "Demo fallback: shark-like object detected in Manly drone frame.",
      bbox: { x: 0.4, y: 0.4, width: 0.2, height: 0.15 },
      model: "demo-fallback",
      datasetRef: "underwater-yolov8",
    };
  }

  if (!env.OPENAI_API_KEY) {
    return {
      sharkDetected: true,
      confidence: 0.84,
      summary:
        "No OPENAI_API_KEY — demo fallback on uploaded frame (use Kaggle-trained YOLO in prod).",
      bbox: { x: 0.35, y: 0.38, width: 0.25, height: 0.16 },
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

  return cvAnalysisResultSchema.parse({
    ...object,
    model: "gpt-4o-mini",
    datasetRef: "underwater-yolov8",
  });
}
