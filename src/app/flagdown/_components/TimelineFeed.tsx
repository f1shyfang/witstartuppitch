type TimelineEvent = {
  id: string;
  type: string;
  source: string;
  level: number;
  createdAt: Date;
  beach: { name: string } | null;
  actions: Array<{
    id: string;
    channel: string;
    message: string;
    createdAt: Date;
  }>;
};

const channelLabels: Record<string, string> = {
  lifeguard_push: "Lifeguard",
  flag_downgrade: "Flag",
  swimmer_push: "Swimmer push",
  council_pa: "Council PA",
};

const channelStyles: Record<string, string> = {
  lifeguard_push: "text-sky-300",
  flag_downgrade: "text-amber-300",
  swimmer_push: "text-violet-300",
  council_pa: "text-rose-300",
};

function levelColor(level: number) {
  if (level >= 5) return "#111827";
  if (level >= 3) return "#dc2626";
  if (level >= 2) return "#d97706";
  if (level >= 1) return "#ca8a04";
  return "#16a34a";
}

const typeLabels: Record<string, string> = {
  tag: "SharkSmart tag",
  bom: "BOM weather",
  cv: "Drone CV",
};

export function TimelineFeed({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="flex max-h-80 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
      <div className="flex items-center justify-between border-b border-slate-800 p-4">
        <p className="text-[11px] uppercase tracking-widest text-slate-500">
          Coordination timeline
        </p>
        <span className="text-[11px] tabular-nums text-slate-500">
          {events.length} event{events.length === 1 ? "" : "s"}
        </span>
      </div>
      {events.length === 0 ? (
        <div className="p-6 text-center text-sm text-slate-500">
          No coordination events yet — inject a threat to begin.
        </div>
      ) : (
        <ul className="space-y-3 overflow-y-auto p-4">
          {events.map((event) => {
            const c = levelColor(event.level);
            return (
              <li
                key={event.id}
                className="rounded-lg border-l-2 bg-slate-950/40 p-3"
                style={{ borderColor: c }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-100">
                    {event.beach?.name ?? "Unknown"}
                  </p>
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
                    style={{ color: c, background: `${c}1a` }}
                  >
                    L{event.level}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {typeLabels[event.type] ?? event.type} · {event.source} ·{" "}
                  {new Date(event.createdAt).toLocaleTimeString()}
                </p>
                {event.actions.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {event.actions.map((action) => (
                      <li
                        key={action.id}
                        className="flex gap-1.5 text-xs text-slate-300"
                      >
                        <span
                          className={`shrink-0 font-medium ${
                            channelStyles[action.channel] ?? "text-slate-400"
                          }`}
                        >
                          {channelLabels[action.channel] ?? action.channel}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span>{action.message}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
