"use client";

import * as ort from "onnxruntime-web";

import type {
  CvAnalysisResult,
  CvBBox,
  CvDetection,
  DangerLevel,
} from "~/flagdown/types/cv";

/**
 * FlagDown's OWN on-device detector: a custom YOLOv8n we fine-tuned on marine
 * imagery (Kaggle underwater set; shark + stingray + jellyfish = "danger"),
 * exported to ONNX (~12MB) and run in-browser with onnxruntime-web.
 *
 * Unlike the generic OWL-ViT zero-shot model it sits beside, this is trained for
 * the task, ships in the repo (public/models/flagdown-yolo), and is tiny enough
 * to deploy on Vercel without Blob.
 *
 * Pipeline: letterbox → CHW float32 (/255) → ORT run → decode [1, 4+nc, 8400]
 * → per-class NMS → normalized boxes + danger mapping.
 */

const MODEL_URL = "/models/flagdown-yolo/model.onnx";
const METADATA_URL = "/models/flagdown-yolo/metadata.json";
const INPUT_SIZE = 640;

// Fallbacks if metadata.json can't be fetched. MUST match ml/train_flagdown_yolo.py.
const FALLBACK_NAMES = [
  "fish",
  "jellyfish",
  "penguin",
  "auk",
  "shark",
  "starfish",
  "stingray",
];
const FALLBACK_DANGER: Record<string, DangerLevel> = {
  shark: "high",
  stingray: "moderate",
  jellyfish: "moderate",
  fish: "none",
  penguin: "none",
  auk: "none",
  starfish: "none",
};

// Serve the ORT wasm runtime from a CDN so Next.js doesn't have to bundle the
// .wasm binaries. Pin to the installed onnxruntime-web version.
ort.env.wasm.wasmPaths =
  "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.27.0/dist/";

type ModelMeta = {
  names: string[];
  danger: Record<string, DangerLevel>;
};

type LoadedModel = {
  session: ort.InferenceSession;
  meta: ModelMeta;
};

let modelPromise: Promise<LoadedModel> | null = null;

async function fetchMeta(): Promise<ModelMeta> {
  try {
    const res = await fetch(METADATA_URL, { cache: "force-cache" });
    if (res.ok) {
      const json = (await res.json()) as Partial<ModelMeta>;
      if (Array.isArray(json.names) && json.names.length > 0) {
        return {
          names: json.names,
          danger: json.danger ?? FALLBACK_DANGER,
        };
      }
    }
  } catch {
    // fall through to defaults
  }
  return { names: FALLBACK_NAMES, danger: FALLBACK_DANGER };
}

async function getModel(): Promise<LoadedModel> {
  modelPromise ??= (async () => {
    const meta = await fetchMeta();
    const session = await ort.InferenceSession.create(MODEL_URL, {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    });
    return { session, meta };
  })();
  return modelPromise;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for CV"));
    img.src = src;
  });
}

type Letterbox = {
  data: Float32Array;
  scale: number;
  padX: number;
  padY: number;
  imgW: number;
  imgH: number;
};

/** Resize keeping aspect ratio into a 640×640 canvas with gray padding, then
 *  emit a planar RGB (CHW) Float32Array normalized to 0..1. */
function letterbox(img: HTMLImageElement): Letterbox {
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;
  const scale = Math.min(INPUT_SIZE / imgW, INPUT_SIZE / imgH);
  const newW = Math.round(imgW * scale);
  const newH = Math.round(imgH * scale);
  const padX = Math.floor((INPUT_SIZE - newW) / 2);
  const padY = Math.floor((INPUT_SIZE - newH) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = INPUT_SIZE;
  canvas.height = INPUT_SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "rgb(114,114,114)";
  ctx.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE);
  ctx.drawImage(img, padX, padY, newW, newH);

  const { data: px } = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
  const area = INPUT_SIZE * INPUT_SIZE;
  const out = new Float32Array(area * 3);
  for (let i = 0; i < area; i++) {
    out[i] = px[i * 4]! / 255; // R plane
    out[area + i] = px[i * 4 + 1]! / 255; // G plane
    out[area * 2 + i] = px[i * 4 + 2]! / 255; // B plane
  }
  return { data: out, scale, padX, padY, imgW, imgH };
}

type RawBox = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  score: number;
  cls: number;
};

function iou(a: RawBox, b: RawBox): number {
  const ix1 = Math.max(a.x1, b.x1);
  const iy1 = Math.max(a.y1, b.y1);
  const ix2 = Math.min(a.x2, b.x2);
  const iy2 = Math.min(a.y2, b.y2);
  const iw = Math.max(0, ix2 - ix1);
  const ih = Math.max(0, iy2 - iy1);
  const inter = iw * ih;
  const areaA = (a.x2 - a.x1) * (a.y2 - a.y1);
  const areaB = (b.x2 - b.x1) * (b.y2 - b.y1);
  const union = areaA + areaB - inter;
  return union > 0 ? inter / union : 0;
}

/** Per-class greedy non-max suppression. */
function nms(boxes: RawBox[], iouThresh: number): RawBox[] {
  const byClass = new Map<number, RawBox[]>();
  for (const b of boxes) {
    const arr = byClass.get(b.cls) ?? [];
    arr.push(b);
    byClass.set(b.cls, arr);
  }
  const kept: RawBox[] = [];
  for (const arr of byClass.values()) {
    arr.sort((a, b) => b.score - a.score);
    const taken: RawBox[] = [];
    for (const cand of arr) {
      if (taken.every((t) => iou(t, cand) < iouThresh)) taken.push(cand);
    }
    kept.push(...taken);
  }
  return kept;
}

/** Decode the YOLOv8 output tensor (handles [1,4+nc,N] and [1,N,4+nc]). */
function decode(
  output: ort.Tensor,
  numClasses: number,
  scoreThresh: number,
): RawBox[] {
  const dims = output.dims as number[];
  const data = output.data as Float32Array;
  const feat = 4 + numClasses;

  let n: number;
  let channelMajor: boolean;
  if (dims[1] === feat) {
    channelMajor = true;
    n = dims[2]!;
  } else if (dims[2] === feat) {
    channelMajor = false;
    n = dims[1]!;
  } else {
    return [];
  }

  const at = (anchor: number, c: number) =>
    channelMajor ? data[c * n + anchor]! : data[anchor * feat + c]!;

  const boxes: RawBox[] = [];
  for (let i = 0; i < n; i++) {
    let best = 0;
    let bestCls = 0;
    for (let c = 0; c < numClasses; c++) {
      const s = at(i, 4 + c);
      if (s > best) {
        best = s;
        bestCls = c;
      }
    }
    if (best < scoreThresh) continue;
    const cx = at(i, 0);
    const cy = at(i, 1);
    const w = at(i, 2);
    const h = at(i, 3);
    boxes.push({
      x1: cx - w / 2,
      y1: cy - h / 2,
      x2: cx + w / 2,
      y2: cy + h / 2,
      score: best,
      cls: bestCls,
    });
  }
  return boxes;
}

/** Map a letterboxed-640 box back to normalized (0..1) original-image coords. */
function toNormBBox(b: RawBox, lb: Letterbox): CvBBox {
  const x1 = (b.x1 - lb.padX) / lb.scale;
  const y1 = (b.y1 - lb.padY) / lb.scale;
  const x2 = (b.x2 - lb.padX) / lb.scale;
  const y2 = (b.y2 - lb.padY) / lb.scale;
  const cx1 = Math.max(0, Math.min(lb.imgW, x1));
  const cy1 = Math.max(0, Math.min(lb.imgH, y1));
  const cx2 = Math.max(0, Math.min(lb.imgW, x2));
  const cy2 = Math.max(0, Math.min(lb.imgH, y2));
  return {
    x: cx1 / lb.imgW,
    y: cy1 / lb.imgH,
    width: (cx2 - cx1) / lb.imgW,
    height: (cy2 - cy1) / lb.imgH,
  };
}

const DANGER_RANK: Record<DangerLevel, number> = {
  high: 2,
  moderate: 1,
  none: 0,
};

export async function runYoloOnDeviceCv(
  imageSrc: string,
  opts: { threshold?: number; iou?: number; topK?: number } = {},
): Promise<CvAnalysisResult> {
  const start = performance.now();
  const scoreThresh = opts.threshold ?? 0.25;
  const iouThresh = opts.iou ?? 0.45;
  const topK = opts.topK ?? 50;

  const { session, meta } = await getModel();
  const img = await loadImage(imageSrc);
  const lb = letterbox(img);

  const inputName = session.inputNames[0]!;
  const outputName = session.outputNames[0]!;
  const tensor = new ort.Tensor("float32", lb.data, [1, 3, INPUT_SIZE, INPUT_SIZE]);
  const result = await session.run({ [inputName]: tensor });
  const output = result[outputName]!;

  const numClasses = meta.names.length;
  const raw = decode(output, numClasses, scoreThresh);
  const kept = nms(raw, iouThresh)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  const detections: CvDetection[] = kept.map((b) => {
    const label = meta.names[b.cls] ?? `class_${b.cls}`;
    return {
      label,
      score: b.score,
      bbox: toNormBBox(b, lb),
      danger: meta.danger[label] ?? "none",
    };
  });

  const sharkDetections = detections.filter((d) => d.danger === "high");
  const topShark = sharkDetections[0];
  const sharkDetected = sharkDetections.length > 0;

  const topDanger: DangerLevel = detections.reduce<DangerLevel>(
    (acc, d) =>
      DANGER_RANK[d.danger ?? "none"] > DANGER_RANK[acc]
        ? (d.danger ?? "none")
        : acc,
    "none",
  );

  const dangers = detections.filter((d) => (d.danger ?? "none") !== "none");
  const confidence = sharkDetected
    ? topShark!.score
    : detections.length > 0
      ? Math.max(0, 1 - detections[0]!.score)
      : 0.5;

  const summary = sharkDetected
    ? `FlagDown YOLO: SHARK detected (${(topShark!.score * 100).toFixed(0)}%) — ${detections.length} object(s), ${dangers.length} hazard(s) in frame.`
    : dangers.length > 0
      ? `FlagDown YOLO: no shark, but ${dangers.length} marine hazard(s) (top: "${dangers[0]!.label}" @ ${(dangers[0]!.score * 100).toFixed(0)}%).`
      : detections.length > 0
        ? `FlagDown YOLO: ${detections.length} object(s), none dangerous (top: "${detections[0]!.label}" @ ${(detections[0]!.score * 100).toFixed(0)}%).`
        : "FlagDown YOLO: no objects above threshold.";

  return {
    sharkDetected,
    confidence,
    summary,
    bbox: topShark?.bbox ?? dangers[0]?.bbox,
    detections,
    model: "flagdown-yolov8n",
    datasetRef: "kaggle/underwater-yolov8",
    topDanger,
    latencyMs: Math.round(performance.now() - start),
  };
}

/** Pre-warm the model + wasm runtime so the first scan is fast. */
export function preloadYoloOnDeviceCv(): Promise<void> {
  return getModel().then(() => undefined);
}
