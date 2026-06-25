"use client";

import type { CvAnalysisResult, CvBBox, CvDetection } from "~/flagdown/types/cv";

/**
 * On-device shark detection using OWL-ViT zero-shot detector
 * (onnx-community/owlvit-base-patch32-ONNX) via Transformers.js + ONNX Runtime Web.
 *
 * Model hosting:
 * - Local dev: served from `public/models/owlvit-base-patch32/` (no download).
 * - Vercel production: the 156MB ONNX exceeds Vercel's 100MB deploy file limit,
 *   so it's hosted on Vercel Blob and loaded via NEXT_PUBLIC_OWLVIT_MODEL_BASE.
 *
 * Zero-shot lets us query marine-relevant classes ("shark", "person in water",
 * "surfboard", "boat") without a custom-trained checkpoint — so the demo runs
 * real ML in the browser and still detects sharks (COCO YOLOv8 has no shark class).
 */

export const SHARK_QUERY_LABELS = [
  "shark",
  "shark in water",
  "dorsal fin",
  "person swimming in water",
  "surfer on surfboard",
  "boat",
] as const;

export type OwlVitRawDetection = {
  score: number;
  label: string;
  box: { xmin: number; ymin: number; xmax: number; ymax: number };
};

type OwlVitPipeline = ((
  image: HTMLCanvasElement | string,
  labels: string[],
  opts?: {
    threshold?: number;
    top_k?: number;
  },
) => Promise<OwlVitRawDetection[]>);

let pipelinePromise: Promise<OwlVitPipeline> | null = null;

/**
 * Model id and hosting. In dev the model is served from `public/models/`
 * (env.localModelPath=/models/). In production the 156MB ONNX lives on Vercel
 * Blob — `NEXT_PUBLIC_OWLVIT_MODEL_BASE` points Transformers.js at it.
 */
const LOCAL_MODEL_ID = "owlvit-base-patch32";
const LOCAL_MODEL_PATH = "/models/";
const BLOB_BASE = process.env.NEXT_PUBLIC_OWLVIT_MODEL_BASE;

async function getDetector(): Promise<OwlVitPipeline> {
  pipelinePromise ??= (async () => {
    const { pipeline, env } = await import("@huggingface/transformers");

    if (BLOB_BASE) {
      // Production: load the committed model from Vercel Blob.
      env.allowLocalModels = false;
      env.allowRemoteModels = true;
      env.remoteHost = BLOB_BASE;
      env.remotePathTemplate = "{model}/";
    } else {
      // Dev: load from public/models/ (no download), fall back to HF if missing.
      env.allowLocalModels = true;
      env.localModelPath = LOCAL_MODEL_PATH;
      env.allowRemoteModels = true;
    }

    // Prefer WebGPU when available; fall back to WASM (CPU) for browsers without it.
    let detector: OwlVitPipeline;
    try {
      detector = (await pipeline("zero-shot-object-detection", LOCAL_MODEL_ID, {
        device: "webgpu" as never,
      }));
    } catch {
      detector = (await pipeline("zero-shot-object-detection", LOCAL_MODEL_ID, {
        device: "wasm" as never,
      }));
    }
    return detector;
  })();
  return pipelinePromise;
}

const SHARK_LABEL_RE = /shark|dorsal fin/i;

function isSharkLabel(label: string): boolean {
  return SHARK_LABEL_RE.test(label);
}

function boxToBBox(
  box: OwlVitRawDetection["box"],
  imgW: number,
  imgH: number,
): CvBBox {
  const xmin = Math.max(0, box.xmin);
  const ymin = Math.max(0, box.ymin);
  const xmax = Math.min(imgW, box.xmax);
  const ymax = Math.min(imgH, box.ymax);
  return {
    x: imgW > 0 ? xmin / imgW : 0,
    y: imgH > 0 ? ymin / imgH : 0,
    width: imgW > 0 ? (xmax - xmin) / imgW : 0,
    height: imgH > 0 ? (ymax - ymin) / imgH : 0,
  };
}

/**
 * Load an image source into a HTMLImageElement to measure natural dimensions.
 * OWL-ViT box coordinates are in input-pixel space; we normalize against the
 * image's natural size.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for CV"));
    img.src = src;
  });
}

export async function runOnDeviceCv(
  imageSrc: string,
  opts: { threshold?: number; topK?: number } = {},
): Promise<CvAnalysisResult> {
  const start = performance.now();
  const threshold = opts.threshold ?? 0.1;
  const topK = opts.topK ?? 12;

  const detector = await getDetector();
  const img = await loadImage(imageSrc);
  const imgW = img.naturalWidth || img.width || 1;
  const imgH = img.naturalHeight || img.height || 1;

  const raw = await detector(imageSrc, [...SHARK_QUERY_LABELS], {
    threshold,
    top_k: topK,
  });

  const detections: CvDetection[] = (raw ?? [])
    .filter((d) => d?.box)
    .map((d) => ({
      label: d.label,
      score: d.score,
      bbox: boxToBBox(d.box, imgW, imgH),
    }))
    .sort((a, b) => b.score - a.score);

  const sharkDetections = detections.filter((d) => isSharkLabel(d.label));
  const topShark = sharkDetections[0];
  const sharkDetected = Boolean(topShark && topShark.score >= threshold);

  const confidence = sharkDetected
    ? topShark!.score
    : detections.length > 0
      ? Math.max(0, 1 - detections[0]!.score)
      : 0.5;
  const summary = sharkDetected
    ? `On-device OWL-ViT: ${sharkDetections.length} shark detection(s), top confidence ${(topShark!.score * 100).toFixed(0)}% across ${detections.length} objects.`
    : detections.length > 0
      ? `On-device OWL-ViT: no shark. ${detections.length} object(s) found (top: "${detections[0]!.label}" @ ${(detections[0]!.score * 100).toFixed(0)}%).`
      : "On-device OWL-ViT: no objects above threshold.";

  return {
    sharkDetected,
    confidence,
    summary,
    bbox: topShark?.bbox,
    detections,
    model: "owlvit-base-patch32",
    datasetRef: "owlvit-zero-shot-marine",
    latencyMs: Math.round(performance.now() - start),
  };
}

export type OnDeviceCvProgress = {
  stage: "loading-model" | "inferring" | "done";
  message: string;
};

/** Pre-warm the model so the first real scan is fast. */
export function preloadOnDeviceCv(): Promise<void> {
  return getDetector().then(() => undefined);
}
