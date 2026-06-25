import type { BeachPin } from "./BeachMap";
import { threatLevelLabel, threatLevelToColor } from "./threat-colors";

const flagSwatch: Record<string, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-400",
  red: "bg-red-500",
  black: "bg-slate-900 ring-1 ring-red-700",
};

const patrolLabel: Record<string, string> = {
  sls: "SLS patrolled",
  council: "Council patrolled",
  unpatrolled: "Unpatrolled — blind spot",
};

export function BeachDetailPanel({ beach }: { beach: BeachPin | null }) {
  if (!beach) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-500">
        Select a beach on the map to inspect its status.
      </div>
    );
  }

  const threatColor = threatLevelToColor(beach.threatLevel);
  const swatch = flagSwatch[beach.flagStatus] ?? "bg-slate-600";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
      <div className="border-b border-slate-800 p-4">
        <p className="text-[11px] uppercase tracking-widest text-slate-500">
          Beach detail
        </p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <h2 className="font-sans text-lg font-semibold tracking-tight">
            {beach.name}
          </h2>
          <span
            className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
            style={{
              color: threatColor,
              background: `${threatColor}1a`,
              boxShadow: `inset 0 0 0 1px ${threatColor}40`,
            }}
          >
            {threatLevelLabel(beach.threatLevel)} · L{beach.threatLevel}
          </span>
        </div>
      </div>
      <dl className="grid grid-cols-2 divide-x divide-slate-800">
        <div className="p-4">
          <dt className="text-[11px] uppercase tracking-widest text-slate-500">
            Flag
          </dt>
          <dd className="mt-2 flex items-center gap-2">
            <span
              className={`inline-block h-3.5 w-3.5 rounded-sm ${swatch}`}
              aria-hidden
            />
            <span className="capitalize text-slate-200">{beach.flagStatus}</span>
          </dd>
        </div>
        <div className="p-4">
          <dt className="text-[11px] uppercase tracking-widest text-slate-500">
            Patrol
          </dt>
          <dd className="mt-2 text-slate-200">
            {patrolLabel[beach.patrolType] ?? beach.patrolType}
          </dd>
        </div>
      </dl>
    </div>
  );
}
