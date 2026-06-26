import type { BeachPin } from "./BeachMap";
import { threatLevelLabel, threatLevelToColor } from "./threat-colors";

const flagSwatch: Record<string, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-400",
  red: "bg-red-500",
  black: "bg-slate-900 ring-1 ring-red-600",
};

const patrolShort: Record<string, string> = {
  sls: "SLS",
  council: "Council",
  unpatrolled: "Unpatrolled",
};

export function BeachRoster({
  beaches,
  selectedBeachId,
  onSelect,
}: {
  beaches: BeachPin[];
  selectedBeachId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="fd-panel flex max-h-56 flex-col overflow-hidden">
      <div className="border-b border-[var(--fd-border)] px-3 py-2.5">
        <p className="fd-label">Beach roster</p>
      </div>
      <ul className="overflow-y-auto" role="listbox" aria-label="Beaches">
        {beaches.map((beach) => {
          const selected = beach.id === selectedBeachId;
          const threatColor = threatLevelToColor(beach.threatLevel);
          const swatch = flagSwatch[beach.flagStatus] ?? "bg-slate-600";

          return (
            <li key={beach.id}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => onSelect(beach.id)}
                className={`flex w-full items-center gap-3 border-b border-[var(--fd-border)]/60 px-3 py-2.5 text-left transition-colors last:border-b-0 ${
                  selected
                    ? "bg-[var(--fd-accent)]/12"
                    : "hover:bg-[var(--fd-elevated)]"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/15"
                  style={{ background: threatColor }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-[var(--fd-ink)]">
                    {beach.name}
                  </span>
                  <span className="mt-0.5 flex items-center gap-2 text-xs text-[var(--fd-muted)]">
                    <span
                      className={`inline-block h-2 w-2 rounded-sm ${swatch}`}
                      aria-hidden
                    />
                    <span className="capitalize">{beach.flagStatus}</span>
                    <span aria-hidden>·</span>
                    <span>
                      {patrolShort[beach.patrolType] ?? beach.patrolType}
                    </span>
                  </span>
                </span>
                <span
                  className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
                  style={{
                    color: threatColor,
                    background: `${threatColor}18`,
                  }}
                >
                  {beach.threatLevel > 0
                    ? threatLevelLabel(beach.threatLevel)
                    : "Clear"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
