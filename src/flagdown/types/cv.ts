import { z } from "zod";

export const cvBBoxSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0).max(1),
  height: z.number().min(0).max(1),
});

export const cvAnalysisResultSchema = z.object({
  sharkDetected: z.boolean(),
  confidence: z.number().min(0).max(1),
  summary: z.string(),
  bbox: cvBBoxSchema.optional(),
  model: z.enum(["gpt-4o-mini", "preset", "demo-fallback"]),
  datasetRef: z.string().optional(),
});

export type CvBBox = z.infer<typeof cvBBoxSchema>;
export type CvAnalysisResult = z.infer<typeof cvAnalysisResultSchema>;
