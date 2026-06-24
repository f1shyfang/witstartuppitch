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

export function TimelineFeed({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-400">
        No coordination events yet
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="mb-3 text-xs uppercase tracking-widest text-slate-400">
        Coordination timeline
      </p>
      <ul className="space-y-3">
        {events.map((event) => (
          <li key={event.id} className="border-l-2 border-amber-500 pl-3">
            <p className="text-sm font-medium">
              {event.beach?.name ?? "Unknown"} · L{event.level} · {event.type}
            </p>
            <p className="text-xs text-slate-400">
              {new Date(event.createdAt).toLocaleTimeString()} · {event.source}
            </p>
            <ul className="mt-2 space-y-1">
              {event.actions.map((action) => (
                <li key={action.id} className="text-xs text-slate-300">
                  <span className="text-amber-400">
                    {channelLabels[action.channel] ?? action.channel}
                  </span>
                  : {action.message}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
