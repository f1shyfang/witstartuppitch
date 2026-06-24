import type { BeachPin } from "./BeachMap";
import { threatLevelLabel, threatLevelToColor } from "./threat-colors";

export function BeachDetailPanel({ beach }: { beach: BeachPin | null }) {
  if (!beach) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-400">
        Select a beach on the map
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-xs uppercase tracking-widest text-slate-400">
        Beach detail
      </p>
      <h2 className="mt-1 text-lg font-semibold">{beach.name}</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-400">Patrol</dt>
          <dd className="capitalize">{beach.patrolType}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-400">Flag</dt>
          <dd className="capitalize">{beach.flagStatus}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-400">Threat</dt>
          <dd style={{ color: threatLevelToColor(beach.threatLevel) }}>
            {threatLevelLabel(beach.threatLevel)} (L{beach.threatLevel})
          </dd>
        </div>
      </dl>
    </div>
  );
}
