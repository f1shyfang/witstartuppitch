"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import type { BeachPin } from "../_components/BeachMap";
import { BeachDetailPanel } from "../_components/BeachDetailPanel";
import { BeachRoster } from "../_components/BeachRoster";
import { DemoControls } from "../_components/DemoControls";
import { StatusRibbon } from "../_components/StatusRibbon";
import { TimelineFeed } from "../_components/TimelineFeed";
import { useFlagdownRealtime } from "../_components/useFlagdownRealtime";
import { api } from "~/trpc/react";

const CvScanner = dynamic(
  () => import("../_components/CvScanner").then((m) => m.CvScanner),
  { ssr: false },
);

const BeachMap = dynamic(
  () => import("../_components/BeachMap").then((m) => m.BeachMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full animate-pulse rounded-lg bg-[var(--fd-elevated)]" />
    ),
  },
);

type BottomTab = "log" | "cv";

export default function DashboardPage() {
  useFlagdownRealtime();
  const [selectedBeachId, setSelectedBeachId] = useState<string>(
    "manly-south-steyne",
  );
  const [flyToBeachId, setFlyToBeachId] = useState<string | undefined>();
  const [pitchMode, setPitchMode] = useState(false);
  const [swimmerCount, setSwimmerCount] = useState(142);
  const [bottomTab, setBottomTab] = useState<BottomTab>("log");
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

  const selectBeach = (id: string) => {
    setSelectedBeachId(id);
    setFlyToBeachId(id);
  };

  if (pitchMode) {
    return (
      <main className="fixed inset-0 z-50 flex flex-col bg-[var(--fd-bg)]">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--fd-border)] px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold text-[var(--fd-ink)]">
              Coast coordination
            </h1>
            <p className="text-sm text-[var(--fd-muted)]">
              Northern Beaches · live router
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DemoControls
              compact
              onFlyTo={(id) => setFlyToBeachId(id)}
              onPaTrigger={playPa}
            />
            <button
              type="button"
              onClick={() => setPitchMode(false)}
              className="rounded-lg border border-[var(--fd-border)] px-3 py-1.5 text-sm font-medium text-[var(--fd-ink)] transition-colors hover:bg-[var(--fd-surface)]"
            >
              Exit pitch
            </button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1">
          <BeachMap
            beaches={beachPins}
            selectedBeachId={selectedBeachId}
            flyToBeachId={flyToBeachId}
          />
          {evacuated ? (
            <div className="pointer-events-none absolute left-4 top-4 rounded-lg bg-[var(--fd-danger)]/90 px-3 py-2 text-sm font-semibold text-white shadow-lg">
              Evacuation in effect
            </div>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 max-h-[42vh] border-t border-[var(--fd-border)] bg-[var(--fd-bg)]/95 p-3 backdrop-blur-sm">
            <TimelineFeed events={timeline} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--fd-ink)] sm:text-[1.65rem]">
            Coast coordination
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--fd-muted)]">
            Live threat routing across patrolled and unpatrolled beaches — map,
            roster, and coordination log in one view.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPitchMode(true)}
          className="rounded-lg bg-[var(--fd-accent)] px-4 py-2 text-sm font-semibold text-[var(--fd-accent-ink)] transition-[filter] hover:brightness-105"
        >
          Pitch mode
        </button>
      </header>

      <StatusRibbon
        beachCount={beaches.length}
        activeAlerts={activeAlerts}
        swimmersReachable={swimmerCount + pushCount * 47}
        maxThreat={maxThreat}
        evacuated={evacuated}
      />

      <div className="grid min-h-[28rem] gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,1fr)] lg:items-stretch">
        <div className="fd-panel relative min-h-[22rem] overflow-hidden lg:min-h-[32rem]">
          <BeachMap
            beaches={beachPins}
            selectedBeachId={selectedBeachId}
            flyToBeachId={flyToBeachId}
          />
        </div>

        <aside className="flex flex-col gap-4">
          <BeachDetailPanel beach={selectedBeach} />
          <BeachRoster
            beaches={beachPins}
            selectedBeachId={selectedBeachId}
            onSelect={selectBeach}
          />
          <DemoControls
            onFlyTo={(id) => setFlyToBeachId(id)}
            onPaTrigger={playPa}
          />
        </aside>
      </div>

      <section aria-label="Operations panels">
        <div
          className="mb-3 flex gap-1 rounded-lg bg-[var(--fd-surface)] p-1 ring-1 ring-[var(--fd-border)]"
          role="tablist"
          aria-label="Bottom panels"
        >
          {(
            [
              { id: "log" as const, label: "Coordination log" },
              { id: "cv" as const, label: "Drone CV scanner" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={bottomTab === tab.id}
              onClick={() => setBottomTab(tab.id)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                bottomTab === tab.id
                  ? "bg-[var(--fd-elevated)] text-[var(--fd-ink)]"
                  : "text-[var(--fd-muted)] hover:text-[var(--fd-ink)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {bottomTab === "log" ? (
          <TimelineFeed events={timeline} />
        ) : (
          <CvScanner
            beachId="manly-south-steyne"
            onSharkDetected={() => setFlyToBeachId("manly-south-steyne")}
          />
        )}
      </section>
    </main>
  );
}
