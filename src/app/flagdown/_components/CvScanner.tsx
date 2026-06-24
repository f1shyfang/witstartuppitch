"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import {
  KAGGLE_CV_DATASETS,
  RELATED_CV_DATASETS,
} from "~/flagdown/constants/cv-datasets";
import { CV_DEMO_SAMPLES } from "~/flagdown/constants/cv-samples";
import type { CvAnalysisResult, CvBBox } from "~/flagdown/types/cv";
import { api } from "~/trpc/react";

function DetectionOverlay({ bbox }: { bbox: CvBBox }) {
  return (
    <div
      className="pointer-events-none absolute border-2 border-amber-400 bg-amber-400/10"
      style={{
        left: `${bbox.x * 100}%`,
        top: `${bbox.y * 100}%`,
        width: `${bbox.width * 100}%`,
        height: `${bbox.height * 100}%`,
      }}
    >
      <span className="absolute -top-5 left-0 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-black">
        shark
      </span>
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

  const selectedSample =
    CV_DEMO_SAMPLES.find((s) => s.id === selectedSampleId) ?? CV_DEMO_SAMPLES[0]!;

  const displayImage = previewUrl ?? selectedSample.imagePath;

  const analyzeMutation = api.flagdown.analyzeAndIngestCv.useMutation({
    onSuccess: (data) => {
      setLastAnalysis(data.analysis);
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
  }, []);

  const onFileChange = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      setUploadBase64(result);
      setLastAnalysis(null);
    };
    reader.readAsDataURL(file);
  };

  const runAnalysis = () => {
    analyzeMutation.mutate({
      beachId,
      sampleId: uploadBase64 ? undefined : selectedSampleId,
      imageBase64: uploadBase64 ?? undefined,
    });
  };

  const analysis = analyzeMutation.data?.analysis ?? lastAnalysis;
  const bbox =
    analysis?.sharkDetected && analysis.bbox ? analysis.bbox : undefined;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Drone CV — edge inference
          </p>
          <p className="mt-1 text-sm text-slate-300">
            Trained on Kaggle marine datasets · routes to threat coordinator
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-800 px-2 py-1 text-[10px] text-slate-400">
          {analyzeMutation.isPending ? "Scanning…" : "Ready"}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-slate-950">
            <Image
              src={displayImage}
              alt="CV frame"
              fill
              className="object-cover"
              unoptimized
            />
            {bbox ? <DetectionOverlay bbox={bbox} /> : null}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {CV_DEMO_SAMPLES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => selectSample(sample.id)}
                className={`rounded-lg px-2 py-1 text-xs ${
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
              <p className="font-medium">
                {analysis.sharkDetected ? "Shark detected" : "All clear"}
                {" · "}
                {(analysis.confidence * 100).toFixed(0)}%
              </p>
              <p className="mt-1 text-xs text-slate-300">{analysis.summary}</p>
              <p className="mt-2 text-[10px] text-slate-500">
                Model: {analysis.model}
                {analysis.datasetRef ? ` · ${analysis.datasetRef}` : ""}
              </p>
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
              Select a Kaggle-aligned sample or upload a drone frame, then run CV
              scan.
            </p>
          )}

          <button
            type="button"
            disabled={analyzeMutation.isPending}
            onClick={runAnalysis}
            className="w-full rounded-lg bg-amber-600 py-2.5 text-sm font-semibold hover:bg-amber-500 disabled:opacity-50"
          >
            {analyzeMutation.isPending ? "Running CV…" : "Run CV scan"}
          </button>

          <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">
              Kaggle training data
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
    </div>
  );
}
