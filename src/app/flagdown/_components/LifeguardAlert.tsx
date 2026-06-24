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
      <div className="rounded-2xl border border-emerald-800 bg-emerald-950/40 p-6 text-center">
        <p className="text-emerald-400">All clear — no active alerts</p>
      </div>
    );
  }

  return (
    <div className="animate-pulse rounded-2xl border-2 border-amber-500 bg-amber-950/40 p-6">
      <p className="text-xs uppercase tracking-widest text-amber-300">
        Shark alert
      </p>
      <h2 className="mt-2 text-xl font-bold">
        {alert.threatEvent.beach?.name ?? "Beach"}
      </h2>
      <p className="mt-3 text-sm text-amber-100">{alert.message}</p>
      <p className="mt-2 text-xs text-amber-300/70">
        {new Date(alert.createdAt).toLocaleTimeString()}
      </p>
      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          disabled={ackMutation.isPending}
          onClick={() =>
            ackMutation.mutate({
              threatEventId: alert.threatEvent!.id,
              response: "acknowledged",
            })
          }
          className="rounded-xl bg-emerald-600 py-3 font-semibold hover:bg-emerald-500"
        >
          Acknowledge
        </button>
        <button
          type="button"
          disabled={ackMutation.isPending}
          onClick={() =>
            ackMutation.mutate({
              threatEventId: alert.threatEvent!.id,
              response: "escalated",
            })
          }
          className="rounded-xl bg-amber-700 py-3 font-semibold hover:bg-amber-600"
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
          className="rounded-xl border border-slate-600 py-3 hover:bg-slate-800"
        >
          False alarm
        </button>
      </div>
    </div>
  );
}
