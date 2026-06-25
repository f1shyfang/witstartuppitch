"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  KAGGLE_CV_DATASETS,
  RELATED_CV_DATASETS,
} from "~/flagdown/constants/cv-datasets";
import { CV_DEMO_SAMPLES } from "~/flagdown/constants/cv-samples";
import type { CvAnalysisResult, CvDetection } from "~/flagdown/types/cv";
import {
  preloadOnDeviceCv,
  runOnDeviceCv,
} from "~/flagdown/services/cv-on-device";
import { api } from "~/trpc/react";

const SHARK_LABEL_RE = /shark|dorsal fin/i;
function isSharkLabel(label: string) {
  return SHARK_LABEL_RE.test(label);
}

function boxColor(label: string, isShark: boolean) {
  if (isShark) return { stroke: "#f59e0b", chip: "bg-amber-500 text-black" };
  if (/person|swimmer|surf/i.test(label))
    return { stroke: "#38bdf8", chip: "bg-sky-500 text-black" };
  if (/boat/i.test(label))
    return { stroke: "#a78bfa", chip: "bg-violet-500 text-white" };
  return { stroke: "#94a3b8", chip: "bg-slate-600 text-white" };
}

function DetectionBox({
  det,
  animate,
}: {
  det: CvDetection;
  animate: boolean;
}) {
  const isShark = isSharkLabel(det.label);
  const c = boxColor(det.label, isShark);
  const pct = Math.round(det.score * 100);
  return (
    <div
      className={`pointer-events-none absolute rounded-sm border-2 transition-all duration-300 ${
        animate ? "opacity-100" : "opacity-0"
      }`}
      style={{
        left: `${det.bbox.x * 100}%`,
        top: `${det.bbox.y * 100}%`,
        width: `${det.bbox.width * 100}%`,
        height: `${det.bbox.height * 100}%`,
        borderColor: c.stroke,
        background: `${c.stroke}14`,
        boxShadow: isShark ? `0 0 0 1px ${c.stroke}55` : undefined,
      }}
    >
      <span
        className={`absolute -top-5 left-0 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold ${c.chip}`}
      >
        {det.label} · {pct}%
      </span>
    </div>
  );
}

function DetectionOverlay({
  detections,
  animate,
}: {
  detections: CvDetection[];
  animate: boolean;
}) {
  return (
    <>
      {detections.map((det, i) => (
        <DetectionBox key={`${det.label}-${i}`} det={det} animate={animate} />
      ))}
    </>
  );
}

function confidenceBar(shark: boolean, conf: number) {
  const pct = Math.round(conf * 100);
  const color = shark ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
      <div
        className={`h-full ${color} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function CvScanner({
  beachId = "manly-south-steyne",
  onSharkDetected,
}: {
  beachId?: string;
  onSharkDetected?: () => void;
}) {
  const utils = api.useUtils();
  const fileRef = useRef<HTMLInputElement>(null);

  const [selectedSampleId, setSelectedSampleId] = useState<string>(
    CV_DEMO_SAMPLES[0]!.id,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadBase64, setUploadBase64] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<CvAnalysisResult | null>(
    null,
  );
  const [modelState, setModelState] = useState<
    "idle" | "loading-model" | "inferring" | "ready"
  >("idle");
  const [modelStatus, setModelStatus] = useState<string>("");
  const [animateBoxes, setAnimateBoxes] = useState(false);
  const [useOnDevice, setUseOnDevice] = useState(true);

  const selectedSample =
    CV_DEMO_SAMPLES.find((s) => s.id === selectedSampleId) ?? CV_DEMO_SAMPLES[0]!;

  const displayImage = previewUrl ?? selectedSample.imagePath;

  // Pre-warm the on-device model on mount (lazy; non-blocking).
  useEffect(() => {
    if (!useOnDevice) return;
    setModelState("loading-model");
    setModelStatus("Downloading OWL-ViT ONNX model…");
    preloadOnDeviceCv()
      .then(() => {
        setModelState("ready");
        setModelStatus("On-device OWL-ViT ready");
      })
      .catch(() => {
        setModelState("idle");
        setModelStatus("On-device model unavailable — will use preset/fallback");
      });
  }, [useOnDevice]);

  const analyzeMutation = api.flagdown.analyzeAndIngestCv.useMutation({
    onSuccess: (data) => {
      setLastAnalysis(data.analysis);
      setAnimateBoxes(false);
      requestAnimationFrame(() => setAnimateBoxes(true));
      if (data.ingested) {
        void utils.flagdown.listBeaches.invalidate();
        void utils.flagdown.getTimeline.invalidate();
        void utils.flagdown.getActiveLifeguardAlert.invalidate();
        onSharkDetected?.();
      }
    },
  });

  const selectSample = useCallback((sampleId: string) => {
    setSelectedSampleId(sampleId);
    setPreviewUrl(null);
    setUploadBase64(null);
    setLastAnalysis(null);
    setAnimateBoxes(false);
  }, []);

  const onFileChange = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      setUploadBase64(result);
      setLastAnalysis(null);
      setAnimateBoxes(false);
    };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async () => {
    if (useOnDevice) {
      setModelState("inferring");
      setModelStatus("Running on-device OWL-ViT inference…");
      try {
        const result = await runOnDeviceCv(displayImage);
        setLastAnalysis(result);
        setAnimateBoxes(false);
        requestAnimationFrame(() => setAnimateBoxes(true));
        analyzeMutation.mutate({
          beachId,
          clientDetections: result.detections,
        });
        setModelState("ready");
        setModelStatus(
          `On-device · ${result.latencyMs ?? "?"}ms · ${result.detections.length} objects`,
        );
        return;
      } catch {
        setModelState("ready");
        setModelStatus("On-device failed — falling back to preset/server");
        // fall through to preset/server path
      }
    }

    analyzeMutation.mutate({
      beachId,
      sampleId: uploadBase64 ? undefined : selectedSampleId,
      imageBase64: uploadBase64 ?? undefined,
    });
  };

  const analysis = analyzeMutation.data?.analysis ?? lastAnalysis;
  const detections =
    analysis?.detections ??
    (analysis?.bbox
      ? [
          {
            label: analysis.sharkDetected ? "shark" : "object",
            score: analysis.confidence,
            bbox: analysis.bbox,
          },
        ]
      : []);
  const visibleDetections = analysis?.sharkDetected
    ? detections.filter((d) => isSharkLabel(d.label) || d.score >= 0.25)
    : detections;

  const scanning =
    analyzeMutation.isPending || modelState === "inferring";

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Drone CV — on-device edge inference
          </p>
          <p className="mt-1 text-sm text-slate-300">
            OWL-ViT zero-shot detector · runs in-browser via ONNX Runtime Web
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[10px] ${
            scanning
              ? "bg-amber-900/60 text-amber-200"
              : modelState === "ready"
                ? "bg-emerald-900/60 text-emerald-200"
                : "bg-slate-800 text-slate-400"
          }`}
        >
          {scanning ? "Scanning…" : modelState === "ready" ? "Model ready" : "Idle"}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-slate-950 ring-1 ring-slate-800">
            <Image
              src={displayImage}
              alt="CV frame"
              fill
              className="object-cover"
              unoptimized
            />
            {detections.length > 0 ? (
              <DetectionOverlay
                detections={visibleDetections}
                animate={animateBoxes}
              />
            ) : null}
            {scanning ? (
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-0 right-0 h-0.5 bg-amber-400/70 shadow-[0_0_12px_2px_rgba(251,191,36,0.7)] animate-[scan_1.4s_ease-in-out_infinite]" />
              </div>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {CV_DEMO_SAMPLES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => selectSample(sample.id)}
                className={`rounded-lg px-2 py-1 text-xs transition-colors ${
                  selectedSampleId === sample.id && !uploadBase64
                    ? "bg-amber-600"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                {sample.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-dashed border-slate-600 px-2 py-1 text-xs hover:bg-slate-800"
            >
              Upload frame
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
          </div>

          <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={useOnDevice}
              onChange={(e) => setUseOnDevice(e.target.checked)}
              className="accent-amber-500"
            />
            Run real on-device OWL-ViT model (downloads ~MB on first use)
          </label>
        </div>

        <div className="space-y-3">
          {analysis ? (
            <div
              className={`rounded-lg border p-3 text-sm ${
                analysis.sharkDetected
                  ? "border-amber-600/50 bg-amber-950/30"
                  : "border-emerald-800/50 bg-emerald-950/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {analysis.sharkDetected ? "Shark detected" : "All clear"}
                  {" · "}
                  {(analysis.confidence * 100).toFixed(0)}%
                </p>
                <span className="text-[10px] text-slate-400">
                  {analysis.latencyMs ? `${analysis.latencyMs}ms · ` : ""}
                  {analysis.model}
                </span>
              </div>
              {confidenceBar(analysis.sharkDetected, analysis.confidence)}
              <p className="mt-2 text-xs text-slate-300">{analysis.summary}</p>

              {analysis.detections.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {analysis.detections.slice(0, 6).map((d, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between text-[11px]"
                    >
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span
                          className={`inline-block h-2 w-2 rounded-sm ${isSharkLabel(d.label) ? "bg-amber-400" : "bg-sky-400"}`}
                        />
                        {d.label}
                      </span>
                      <span className="tabular-nums text-slate-400">
                        {(d.score * 100).toFixed(0)}%
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {analysis.datasetRef ? (
                <p className="mt-2 text-[10px] text-slate-500">
                  Dataset: {analysis.datasetRef}
                </p>
              ) : null}
              {analyzeMutation.data?.ingested ? (
                <p className="mt-2 text-xs font-medium text-amber-300">
                  → Threat router engaged · lifeguard channel fired
                </p>
              ) : null}
              {analyzeMutation.data && !analyzeMutation.data.ingested ? (
                <p className="mt-2 text-xs text-emerald-400">
                  No coordination — below threat threshold
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              Select a sample or upload a drone frame, then run CV scan. On-device
              OWL-ViT returns per-detection class + confidence.
            </p>
          )}

          {modelStatus ? (
            <p className="text-[11px] text-slate-500">{modelStatus}</p>
          ) : null}

          <button
            type="button"
            disabled={scanning}
            onClick={runAnalysis}
            className="w-full rounded-lg bg-amber-600 py-2.5 text-sm font-semibold hover:bg-amber-500 disabled:opacity-50"
          >
            {scanning ? "Running CV…" : "Run CV scan"}
          </button>

          <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">
              Training / model lineage
            </p>
            <ul className="mt-2 space-y-2">
              {KAGGLE_CV_DATASETS.map((ds) => (
                <li key={ds.id} className="text-xs">
                  <a
                    href={ds.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline"
                  >
                    {ds.name}
                  </a>
                  <p className="text-slate-500">{ds.pitchLine}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10px] uppercase tracking-widest text-slate-500">
              Related aerial (Roboflow)
            </p>
            <ul className="mt-1 space-y-1">
              {RELATED_CV_DATASETS.map((ds) => (
                <li key={ds.url} className="text-xs">
                  <a
                    href={ds.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-amber-400"
                  >
                    {ds.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style>{`@keyframes scan{0%{top:0%}50%{top:100%}100%{top:0%}}`}</style>
    </div>
  );
}
