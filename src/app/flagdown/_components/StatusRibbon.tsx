import { threatLevelLabel } from "./threat-colors";

type StatusRibbonProps = {
  beachCount: number;
  activeAlerts: number;
  swimmersReachable: number;
  maxThreat: number;
  evacuated: boolean;
};

export function StatusRibbon({
  beachCount,
  activeAlerts,
  swimmersReachable,
  maxThreat,
  evacuated,
}: StatusRibbonProps) {
  const items = [
    {
      id: "live",
      label: "Feed",
      value: "Live",
      tone: "live" as const,
    },
    {
      id: "beaches",
      label: "Monitored",
      value: String(beachCount),
      detail: "Northern Beaches",
    },
    {
      id: "alerts",
      label: "Active alerts",
      value: String(activeAlerts),
      tone: activeAlerts > 0 ? ("danger" as const) : ("ok" as const),
      detail: activeAlerts === 0 ? "All clear" : "Coordination required",
    },
    {
      id: "swimmers",
      label: "Swimmers reachable",
      value: swimmersReachable.toLocaleString(),
      detail: "Push + PA",
    },
    {
      id: "threat",
      label: "Peak threat",
      value: maxThreat > 0 ? `L${maxThreat}` : "—",
      tone:
        maxThreat >= 3
          ? ("danger" as const)
          : maxThreat >= 1
            ? ("caution" as const)
            : ("ok" as const),
      detail: threatLevelLabel(maxThreat),
    },
  ];

  return (
    <div
      className="fd-panel flex flex-wrap items-stretch divide-x divide-[var(--fd-border)]"
      role="status"
      aria-label="Operational status"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="flex min-w-[9rem] flex-1 items-center gap-3 px-4 py-3"
        >
          {item.tone === "live" ? (
            <span
              className="fd-live-pulse inline-block h-2 w-2 shrink-0 rounded-full bg-[var(--fd-live)]"
              aria-hidden
            />
          ) : null}
          <div className="min-w-0">
            <p className="fd-label">{item.label}</p>
            <p
              className={`mt-0.5 text-lg font-semibold tabular-nums leading-tight ${
                item.tone === "danger"
                  ? "text-[var(--fd-danger)]"
                  : item.tone === "caution"
                    ? "text-[var(--fd-caution)]"
                    : item.tone === "live"
                      ? "text-[var(--fd-live)]"
                      : "text-[var(--fd-ink)]"
              }`}
            >
              {item.value}
            </p>
            {item.detail ? (
              <p className="mt-0.5 truncate text-xs text-[var(--fd-muted)]">
                {item.detail}
              </p>
            ) : null}
          </div>
        </div>
      ))}
      {evacuated ? (
        <div className="flex flex-1 items-center justify-end bg-[var(--fd-danger)]/10 px-4 py-3">
          <p className="text-sm font-semibold text-[var(--fd-danger)]">
            Evacuation in effect
          </p>
        </div>
      ) : null}
    </div>
  );
}
