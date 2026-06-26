import type { BeachPin } from "./BeachMap";
import { threatLevelLabel, threatLevelToColor } from "./threat-colors";

const flagSwatch: Record<string, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-400",
  red: "bg-red-500",
  black: "bg-slate-900 ring-1 ring-red-600",
};

const patrolLabel: Record<string, string> = {
  sls: "Surf Life Saving patrol",
  council: "Council patrol",
  unpatrolled: "Unpatrolled — no lifeguard in loop",
};

export function BeachDetailPanel({ beach }: { beach: BeachPin | null }) {
  if (!beach) {
    return (
      <div className="fd-panel flex min-h-[10rem] items-center justify-center p-6 text-center">
        <p className="text-sm text-[var(--fd-muted)]">
          Select a beach from the roster or map to inspect status.
        </p>
      </div>
    );
  }

  const threatColor = threatLevelToColor(beach.threatLevel);
  const swatch = flagSwatch[beach.flagStatus] ?? "bg-slate-600";

  return (
    <div className="fd-panel overflow-hidden">
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="fd-label">Selected beach</p>
          <h2 className="mt-1 truncate text-xl font-semibold tracking-tight text-[var(--fd-ink)]">
            {beach.name}
          </h2>
          <p className="mt-1 text-sm text-[var(--fd-muted)]">
            {patrolLabel[beach.patrolType] ?? beach.patrolType}
          </p>
        </div>
        <div
          className="flex shrink-0 flex-col items-center gap-1.5 rounded-lg bg-[var(--fd-elevated)] px-3 py-2"
          aria-label={`Flag status: ${beach.flagStatus}`}
        >
          <span
            className={`block h-10 w-7 rounded-sm shadow-sm ${swatch}`}
            aria-hidden
          />
          <span className="text-xs capitalize text-[var(--fd-muted)]">
            {beach.flagStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-[var(--fd-border)]">
        <div className="bg-[var(--fd-surface)] p-4">
          <p className="fd-label">Threat level</p>
          <p
            className="mt-1 text-2xl font-semibold tabular-nums"
            style={{ color: threatColor }}
          >
            {beach.threatLevel > 0 ? `L${beach.threatLevel}` : "—"}
          </p>
          <p className="mt-0.5 text-sm text-[var(--fd-muted)]">
            {threatLevelLabel(beach.threatLevel)}
          </p>
        </div>
        <div className="bg-[var(--fd-surface)] p-4">
          <p className="fd-label">Coordinates</p>
          <p className="mt-1 font-mono text-sm tabular-nums text-[var(--fd-ink)]">
            {Math.abs(beach.lat).toFixed(4)}°S
          </p>
          <p className="font-mono text-sm tabular-nums text-[var(--fd-muted)]">
            {beach.lng.toFixed(4)}°E
          </p>
        </div>
      </div>
    </div>
  );
}
