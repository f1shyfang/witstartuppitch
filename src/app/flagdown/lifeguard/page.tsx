"use client";

import Image from "next/image";

import { LifeguardAlert } from "../_components/LifeguardAlert";
import { useFlagdownRealtime } from "../_components/useFlagdownRealtime";
import { api } from "~/trpc/react";

export default function LifeguardPage() {
  useFlagdownRealtime();

  const { data: alert } = api.flagdown.getActiveLifeguardAlert.useQuery(
    undefined,
    { refetchInterval: 2000 },
  );

  const beachName = alert?.threatEvent?.beach?.name ?? "Manly South Steyne";

  return (
    <main className="mx-auto max-w-md px-5 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-amber-400/90">
            SLS Manly · Lifeguard terminal
          </p>
          <h1 className="mt-0.5 font-sans text-xl font-semibold tracking-tight">
            Beach patrol PWA
          </h1>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-950/60 px-2.5 py-1 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-800/60">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Live
        </span>
      </div>

      <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-2xl border border-slate-800">
        <Image
          src="/flagdown/beaches/manly-hero.jpg"
          alt={`${beachName} patrol view`}
          fill
          className="object-cover"
          sizes="(max-width: 448px) 100vw, 448px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/70">
              Active beach
            </p>
            <p className="font-sans text-sm font-semibold text-white">
              {beachName}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-red-950/70 px-2 py-1 text-[10px] font-medium text-red-200 ring-1 ring-red-800/60">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            Red &amp; yellow patrolled
          </div>
        </div>
      </div>

      <LifeguardAlert alert={alert ?? null} />
    </main>
  );
}
