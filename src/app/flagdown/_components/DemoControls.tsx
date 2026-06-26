"use client";

import type { ReactNode } from "react";
import { api } from "~/trpc/react";

export function DemoControls({
  onFlyTo,
  onPaTrigger,
  compact = false,
}: {
  onFlyTo: (beachId: string) => void;
  onPaTrigger: () => void;
  compact?: boolean;
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

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2" role="group" aria-label="Demo controls">
        <DemoChip
          disabled={pending}
          onClick={() => tagMutation.mutate({ beachId: "collins-flat" })}
          tone="caution"
        >
          Shark tag · Collins Flat
        </DemoChip>
        <DemoChip
          disabled={pending}
          onClick={() => bomMutation.mutate()}
          tone="danger"
        >
          BOM cyclone watch
        </DemoChip>
        <DemoChip
          disabled={pending}
          onClick={() => resetMutation.mutate()}
          tone="ghost"
        >
          Reset
        </DemoChip>
      </div>
    );
  }

  return (
    <div className="fd-panel p-4">
      <p className="fd-label">Demo controls</p>
      <p className="mt-1 text-sm text-[var(--fd-muted)]">
        Inject threats to exercise the coordination router during your pitch.
      </p>
      <div className="mt-3 space-y-2">
        <DemoButton
          disabled={pending}
          onClick={() => tagMutation.mutate({ beachId: "collins-flat" })}
          tone="caution"
          title="SharkSmart tag — Collins Flat"
          subtitle="Unpatrolled · council PA + push"
        />
        <DemoButton
          disabled={pending}
          onClick={() => bomMutation.mutate()}
          tone="danger"
          title="BOM cyclone watch"
          subtitle="Multi-threat escalation · level 5"
        />
        <DemoButton
          disabled={pending}
          onClick={() => resetMutation.mutate()}
          tone="ghost"
          title="Reset demo"
          subtitle="Clear events and restore flags"
        />
      </div>
    </div>
  );
}

function DemoChip({
  disabled,
  onClick,
  tone,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  tone: "caution" | "danger" | "ghost";
  children: ReactNode;
}) {
  const tones = {
    caution:
      "bg-[var(--fd-caution)]/15 text-[var(--fd-caution)] hover:bg-[var(--fd-caution)]/25",
    danger:
      "bg-[var(--fd-danger)]/15 text-[var(--fd-danger)] hover:bg-[var(--fd-danger)]/25",
    ghost:
      "border border-[var(--fd-border)] text-[var(--fd-muted)] hover:bg-[var(--fd-elevated)] hover:text-[var(--fd-ink)]",
  } as const;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${tones[tone]}`}
    >
      {children}
    </button>
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
  tone: "caution" | "danger" | "ghost";
  title: string;
  subtitle: string;
}) {
  const tones = {
    caution: "bg-[var(--fd-caution)] text-[var(--fd-accent-ink)] hover:brightness-110",
    danger: "bg-[var(--fd-danger)] text-white hover:brightness-110",
    ghost:
      "border border-[var(--fd-border)] bg-transparent text-[var(--fd-ink)] hover:bg-[var(--fd-elevated)]",
  } as const;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-left transition-[background-color,filter] disabled:opacity-50 ${tones[tone]}`}
    >
      <span className="flex flex-col">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-[11px] opacity-80">{subtitle}</span>
      </span>
      <span aria-hidden className="text-sm opacity-60">
        →
      </span>
    </button>
  );
}
