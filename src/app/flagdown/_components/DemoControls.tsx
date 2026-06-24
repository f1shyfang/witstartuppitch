"use client";

import { api } from "~/trpc/react";

export function DemoControls({
  onFlyTo,
  onPaTrigger,
}: {
  onFlyTo: (beachId: string) => void;
  onPaTrigger: () => void;
}) {
  const utils = api.useUtils();
  const tagMutation = api.flagdown.injectSharkTag.useMutation({
    onSuccess: () => {
      void utils.flagdown.listBeaches.invalidate();
      void utils.flagdown.getTimeline.invalidate();
      onFlyTo("collins-flat");
      onPaTrigger();
    },
  });
  const bomMutation = api.flagdown.injectBom.useMutation({
    onSuccess: () => {
      void utils.flagdown.listBeaches.invalidate();
      void utils.flagdown.getTimeline.invalidate();
      onPaTrigger();
    },
  });
  const resetMutation = api.flagdown.resetDemo.useMutation({
    onSuccess: () => {
      void utils.flagdown.listBeaches.invalidate();
      void utils.flagdown.getTimeline.invalidate();
      void utils.flagdown.getActiveLifeguardAlert.invalidate();
    },
  });

  const pending =
    tagMutation.isPending ||
    bomMutation.isPending ||
    resetMutation.isPending;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="mb-3 text-xs uppercase tracking-widest text-slate-400">
        Demo controls
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => tagMutation.mutate({ beachId: "collins-flat" })}
          className="rounded-lg bg-orange-700 px-3 py-2 text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
        >
          SharkSmart Tag — Collins Flat
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => bomMutation.mutate()}
          className="rounded-lg bg-red-700 px-3 py-2 text-sm font-medium hover:bg-red-600 disabled:opacity-50"
        >
          BOM Cyclone Watch
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => resetMutation.mutate()}
          className="rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800 disabled:opacity-50"
        >
          Reset demo
        </button>
      </div>
    </div>
  );
}
