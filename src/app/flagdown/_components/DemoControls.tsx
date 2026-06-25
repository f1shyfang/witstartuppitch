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
      <p className="text-[11px] uppercase tracking-widest text-slate-500">
        Demo controls
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Inject live threats to exercise the router.
      </p>
      <div className="mt-3 space-y-2">
        <DemoButton
          disabled={pending}
          onClick={() => tagMutation.mutate({ beachId: "collins-flat" })}
          tone="orange"
          title="SharkSmart tag — Collins Flat"
          subtitle="Unpatrolled · council PA + push"
        />
        <DemoButton
          disabled={pending}
          onClick={() => bomMutation.mutate()}
          tone="red"
          title="BOM cyclone watch"
          subtitle="Multi-threat escalation · L5"
        />
        <DemoButton
          disabled={pending}
          onClick={() => resetMutation.mutate()}
          tone="ghost"
          title="Reset demo"
          subtitle="Clear events & flags"
        />
      </div>
    </div>
  );
}

function DemoButton({
  disabled,
  onClick,
  tone,
  title,
  subtitle,
}: {
  disabled: boolean;
  onClick: () => void;
  tone: "orange" | "red" | "ghost";
  title: string;
  subtitle: string;
}) {
  const tones = {
    orange: "bg-orange-600/90 hover:bg-orange-500 text-white",
    red: "bg-red-600/90 hover:bg-red-500 text-white",
    ghost: "border border-slate-700 hover:bg-slate-800 text-slate-200",
  } as const;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-left transition-colors disabled:opacity-50 ${tones[tone]}`}
    >
      <span className="flex flex-col">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-[11px] opacity-80">{subtitle}</span>
      </span>
      <span aria-hidden className="text-sm opacity-70">
        →
      </span>
    </button>
  );
}
