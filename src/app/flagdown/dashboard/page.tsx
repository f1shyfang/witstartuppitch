"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import type { BeachPin } from "../_components/BeachMap";
import { BeachDetailPanel } from "../_components/BeachDetailPanel";
import { CvScanner } from "../_components/CvScanner";
import { DemoControls } from "../_components/DemoControls";
import { TimelineFeed } from "../_components/TimelineFeed";
import { useFlagdownRealtime } from "../_components/useFlagdownRealtime";
import { api } from "~/trpc/react";

const BeachMap = dynamic(
  () => import("../_components/BeachMap").then((m) => m.BeachMap),
  { ssr: false, loading: () => <div className="h-full animate-pulse rounded-xl bg-slate-800" /> },
);

export default function DashboardPage() {
  useFlagdownRealtime();
  const [selectedBeachId, setSelectedBeachId] = useState<string>("manly-south-steyne");
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
    (acc, e) => acc + e.actions.filter((a) => a.channel === "swimmer_push").length,
    0,
  );

  const playPa = () => {
    audioRef.current ??= new Audio("/flagdown/siren.mp3");
    void audioRef.current.play().catch(() => undefined);
    setSwimmerCount((c) => c + 47);
  };

  return (
    <main
      className={
        pitchMode
          ? "fixed inset-0 z-50 grid h-screen grid-rows-[auto_1fr] bg-slate-950 p-4"
          : "mx-auto max-w-7xl p-6"
      }
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Coast coordination</h2>
          <p className="text-sm text-slate-400">
            {swimmerCount + pushCount * 47} swimmers reachable · live routing
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPitchMode((p) => !p)}
          className="rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800"
        >
          {pitchMode ? "Exit pitch mode" : "Pitch mode"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-[1fr_auto]">
        <div className="h-[420px] lg:col-span-2 lg:h-auto lg:min-h-[480px]">
          <BeachMap
            beaches={beachPins}
            selectedBeachId={selectedBeachId}
            flyToBeachId={flyToBeachId}
          />
        </div>
        <div className="space-y-4">
          <BeachDetailPanel beach={selectedBeach} />
          <div className="flex flex-wrap gap-2">
            {beachPins.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setSelectedBeachId(b.id);
                  setFlyToBeachId(b.id);
                }}
                className={`rounded-full px-3 py-1 text-xs ${
                  selectedBeachId === b.id
                    ? "bg-amber-600"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                {b.name}
              </button>
            ))}
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
