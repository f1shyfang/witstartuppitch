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
  flag_downgrade: "text-[var(--fd-caution)]",
  swimmer_push: "text-violet-300",
  council_pa: "text-rose-300",
};

function levelColor(level: number) {
  if (level >= 5) return "var(--fd-bg)";
  if (level >= 3) return "var(--fd-danger)";
  if (level >= 2) return "var(--fd-caution)";
  if (level >= 1) return "oklch(0.78 0.14 85)";
  return "var(--fd-live)";
}

const typeLabels: Record<string, string> = {
  tag: "SharkSmart tag",
  bom: "BOM weather",
  cv: "Drone CV",
};

export function TimelineFeed({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="fd-panel flex max-h-[min(28rem,50vh)] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--fd-border)] px-4 py-3">
        <div>
          <p className="fd-label">Coordination log</p>
          <p className="mt-0.5 text-sm text-[var(--fd-muted)]">
            Router decisions and channel delivery
          </p>
        </div>
        <span className="rounded-md bg-[var(--fd-elevated)] px-2 py-1 text-xs tabular-nums text-[var(--fd-muted)]">
          {events.length} event{events.length === 1 ? "" : "s"}
        </span>
      </div>
      {events.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
          <p className="text-sm text-[var(--fd-ink)]">No events yet</p>
          <p className="max-w-xs text-sm text-[var(--fd-muted)]">
            Inject a threat from demo controls or run the drone CV scanner to
            watch the router coordinate a response.
          </p>
        </div>
      ) : (
        <ul className="relative flex-1 space-y-0 overflow-y-auto p-4">
          <div
            className="absolute bottom-4 left-[1.375rem] top-4 w-px bg-[var(--fd-border)]"
            aria-hidden
          />
          {events.map((event) => {
            const c = levelColor(event.level);
            return (
              <li key={event.id} className="relative pl-8 pb-5 last:pb-0">
                <span
                  className="absolute left-3 top-1.5 z-10 h-3 w-3 rounded-full ring-4 ring-[var(--fd-surface)]"
                  style={{ background: c }}
                  aria-hidden
                />
                <div className="rounded-lg bg-[var(--fd-elevated)]/70 p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-[var(--fd-ink)]">
                      {event.beach?.name ?? "Unknown beach"}
                    </p>
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
                      style={{
                        color: c,
                        backgroundColor: `color-mix(in oklch, ${c} 18%, transparent)`,
                      }}
                    >
                      Level {event.level}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--fd-muted)]">
                    {typeLabels[event.type] ?? event.type} · {event.source} ·{" "}
                    {new Date(event.createdAt).toLocaleTimeString()}
                  </p>
                  {event.actions.length > 0 ? (
                    <ul className="mt-2.5 space-y-1.5 border-t border-[var(--fd-border)]/80 pt-2.5">
                      {event.actions.map((action) => (
                        <li
                          key={action.id}
                          className="flex gap-2 text-xs leading-relaxed text-[var(--fd-ink)]/90"
                        >
                          <span
                            className={`shrink-0 font-medium ${
                              channelStyles[action.channel] ?? "text-[var(--fd-muted)]"
                            }`}
                          >
                            {channelLabels[action.channel] ?? action.channel}
                          </span>
                          <span className="text-[var(--fd-muted)]" aria-hidden>
                            →
                          </span>
                          <span>{action.message}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
