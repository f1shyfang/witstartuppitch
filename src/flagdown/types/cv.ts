import { z } from "zod";

export const cvBBoxSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0).max(1),
  height: z.number().min(0).max(1),
});

export const cvDetectionSchema = z.object({
  label: z.string(),
  /** detection confidence 0..1 */
  score: z.number().min(0).max(1),
  bbox: cvBBoxSchema,
});

export const cvAnalysisResultSchema = z.object({
  sharkDetected: z.boolean(),
  /** primary confidence 0..1 — max shark-class score, or 1 - maxScore for negatives */
  confidence: z.number().min(0).max(1),
  summary: z.string(),
  /** primary shark bbox (legacy single-box field, kept for threat router) */
  bbox: cvBBoxSchema.optional(),
  /** all detections found in frame, with per-box label + confidence */
  detections: z.array(cvDetectionSchema).default([]),
  model: z.enum([
    "owlvit-base-patch32",
    "gpt-4o-mini",
    "preset",
    "demo-fallback",
  ]),
  datasetRef: z.string().optional(),
  /** inference latency in ms (real models only) */
  latencyMs: z.number().int().nonnegative().optional(),
});

export type CvBBox = z.infer<typeof cvBBoxSchema>;
export type CvDetection = z.infer<typeof cvDetectionSchema>;
export type CvAnalysisResult = z.infer<typeof cvAnalysisResultSchema>;
