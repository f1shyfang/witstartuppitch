"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import type { BeachPin } from "../_components/BeachMap";
import { BeachDetailPanel } from "../_components/BeachDetailPanel";
import { DemoControls } from "../_components/DemoControls";
import { TimelineFeed } from "../_components/TimelineFeed";
import { useFlagdownRealtime } from "../_components/useFlagdownRealtime";
import { threatLevelLabel, threatLevelToColor } from "../_components/threat-colors";
import { api } from "~/trpc/react";

// Client-only: pulls in @huggingface/transformers + onnxruntime-web, which must
// not be bundled into the server function (it would exceed Vercel's 250MB limit).
const CvScanner = dynamic(
  () => import("../_components/CvScanner").then((m) => m.CvScanner),
  { ssr: false },
);

const BeachMap = dynamic(
  () => import("../_components/BeachMap").then((m) => m.BeachMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full animate-pulse rounded-xl bg-slate-800/60" />
    ),
  },
);

export default function DashboardPage() {
  useFlagdownRealtime();
  const [selectedBeachId, setSelectedBeachId] = useState<string>(
    "manly-south-steyne",
  );
  const [flyToBeachId, setFlyToBeachId] = useState<string | undefined>();
  const [pitchMode, setPitchMode] = useState(false);
  const [swimmerCount, setSwimmerCount] = useState(142);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: beaches = [] } = api.flagdown.listBeaches.useQuery(undefined, {
    refetchInterval: 2000,
  });
  const { data: timeline = [] } = api.flagdown.getTimeline.useQuery(undefined, {
    refetchInterval: 2000,
  });

  const beachPins: BeachPin[] = useMemo(
    () =>
      beaches.map((b) => ({
        id: b.id,
        name: b.name,
        lat: b.lat,
        lng: b.lng,
        patrolType: b.patrolType,
        flagStatus: b.flagStatus,
        threatLevel: b.threatLevel,
      })),
    [beaches],
  );

  const selectedBeach =
    beachPins.find((b) => b.id === selectedBeachId) ?? beachPins[0] ?? null;

  const pushCount = timeline.reduce(
    (acc, e) =>
      acc + e.actions.filter((a) => a.channel === "swimmer_push").length,
    0,
  );

  const maxThreat = beaches.reduce((m, b) => Math.max(m, b.threatLevel), 0);
  const activeAlerts = timeline.filter((e) => e.level >= 2).length;
  const evacuated = beaches.some((b) => b.flagStatus === "black");

  const playPa = () => {
    audioRef.current ??= new Audio("/flagdown/siren.mp3");
    void audioRef.current.play().catch(() => undefined);
    setSwimmerCount((c) => c + 47);
  };

  const stats = [
    {
      label: "Beaches monitored",
      value: beaches.length,
      hint: "Northern Beaches pilot",
    },
    {
      label: "Active alerts",
      value: activeAlerts,
      hint: activeAlerts === 0 ? "All clear" : "Requires coordination",
      tone: activeAlerts > 0 ? "alert" : "ok",
    },
    {
      label: "Swimmers reachable",
      value: swimmerCount + pushCount * 47,
      hint: "Via push + PA",
    },
    {
      label: "Highest threat",
      value: maxThreat > 0 ? `L${maxThreat}` : "—",
      hint: threatLevelLabel(maxThreat),
      tone: maxThreat >= 3 ? "alert" : maxThreat >= 1 ? "caution" : "ok",
    },
  ] as const;

  return (
    <main
      className={
        pitchMode
          ? "fixed inset-0 z-50 grid h-screen grid-rows-[auto_1fr] bg-slate-950 p-4"
          : "mx-auto max-w-7xl px-6 py-6"
      }
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-amber-400/90">
            Council command centre
          </p>
          <h2 className="mt-1 font-sans text-2xl font-semibold tracking-tight sm:text-3xl">
            Coast coordination
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Live threat routing across patrolled &amp; unpatrolled beaches
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPitchMode((p) => !p)}
          className="rounded-lg border border-slate-700 px-3.5 py-2 text-sm font-medium transition-colors hover:bg-slate-800 hover:text-amber-400"
        >
          {pitchMode ? "Exit pitch mode" : "Pitch mode"}
        </button>
      </div>

      {!pitchMode ? (
        <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5"
            >
              <dt className="text-[11px] uppercase tracking-widest text-slate-500">
                {s.label}
              </dt>
              <dd
                className={`mt-1.5 font-sans text-2xl font-semibold tabular-nums ${
                  "tone" in s && s.tone === "alert"
                    ? "text-red-400"
                    : "tone" in s && s.tone === "caution"
                      ? "text-amber-400"
                      : "text-slate-100"
                }`}
              >
                {s.value}
              </dd>
              <dd className="mt-0.5 text-[11px] text-slate-500">{s.hint}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-[1fr_auto]">
        <div className="h-[420px] lg:col-span-2 lg:h-auto lg:min-h-[480px]">
          <div className="relative h-full overflow-hidden rounded-xl border border-slate-800">
            <BeachMap
              beaches={beachPins}
              selectedBeachId={selectedBeachId}
              flyToBeachId={flyToBeachId}
            />
            {evacuated ? (
              <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-red-950/80 px-2.5 py-1 text-[11px] font-semibold text-red-300 ring-1 ring-red-800">
                Evacuation in effect
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <BeachDetailPanel beach={selectedBeach} />
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-widest text-slate-500">
              Beaches
            </p>
            <div className="flex flex-wrap gap-2">
              {beachPins.map((b) => {
                const c = threatLevelToColor(b.threatLevel);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setSelectedBeachId(b.id);
                      setFlyToBeachId(b.id);
                    }}
                    className={`group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors ${
                      selectedBeachId === b.id
                        ? "bg-amber-600 text-slate-950"
                        : "bg-slate-800/70 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full ring-1 ring-white/30"
                      style={{ background: c }}
                    />
                    {b.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <CvScanner
            beachId="manly-south-steyne"
            onSharkDetected={() => setFlyToBeachId("manly-south-steyne")}
          />
        </div>
        <div className="lg:col-span-2">
          <TimelineFeed events={timeline} />
        </div>
        <div>
          <DemoControls
            onFlyTo={(id) => setFlyToBeachId(id)}
            onPaTrigger={playPa}
          />
        </div>
      </div>
    </main>
  );
}
