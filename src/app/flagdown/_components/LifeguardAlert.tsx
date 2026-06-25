"use client";

import { api } from "~/trpc/react";

type Alert = {
  id: string;
  message: string;
  createdAt: Date;
  threatEvent: {
    id: string;
    beach: { name: string } | null;
  } | null;
};

export function LifeguardAlert({ alert }: { alert: Alert | null }) {
  const utils = api.useUtils();
  const ackMutation = api.flagdown.ackLifeguard.useMutation({
    onSuccess: () => {
      void utils.flagdown.getActiveLifeguardAlert.invalidate();
      void utils.flagdown.getTimeline.invalidate();
    },
  });

  if (!alert?.threatEvent) {
    return (
      <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/30 p-6 text-center ring-1 ring-emerald-900/40">
        <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-emerald-900/60 text-emerald-300">
          <CheckIcon className="h-5 w-5" />
        </div>
        <p className="font-sans text-sm font-semibold text-emerald-300">
          All clear — no active alerts
        </p>
        <p className="mt-1 text-xs text-emerald-400/70">
          Monitoring threat router for new signals.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500 bg-amber-950/40 p-5 shadow-[0_0_30px_-8px_rgba(245,158,11,0.5)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 animate-pulse bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2">
          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">
          Shark alert · action required
        </p>
      </div>
      <h2 className="mt-2 font-sans text-2xl font-bold tracking-tight text-amber-50">
        {alert.threatEvent.beach?.name ?? "Beach"}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-amber-100/90">
        {alert.message}
      </p>
      <p className="mt-2 text-[11px] tabular-nums text-amber-300/70">
        {new Date(alert.createdAt).toLocaleTimeString()}
      </p>

      <div className="mt-5 grid gap-2">
        <button
          type="button"
          disabled={ackMutation.isPending}
          onClick={() =>
            ackMutation.mutate({
              threatEventId: alert.threatEvent!.id,
              response: "acknowledged",
            })
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
        >
          <CheckIcon className="h-4 w-4" />
          Acknowledge
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={ackMutation.isPending}
            onClick={() =>
              ackMutation.mutate({
                threatEventId: alert.threatEvent!.id,
                response: "escalated",
              })
            }
            className="rounded-xl bg-amber-700 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
          >
            Escalate
          </button>
          <button
            type="button"
            disabled={ackMutation.isPending}
            onClick={() =>
              ackMutation.mutate({
                threatEventId: alert.threatEvent!.id,
                response: "false_alarm",
              })
            }
            className="rounded-xl border border-slate-600 py-2.5 font-sans text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 disabled:opacity-60"
          >
            False alarm
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
