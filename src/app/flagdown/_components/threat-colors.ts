export function threatLevelToColor(level: number): string {
  if (level >= 5) return "#111827";
  if (level >= 3) return "#dc2626";
  if (level >= 2) return "#d97706";
  if (level >= 1) return "#ca8a04";
  return "#16a34a";
}

export function threatLevelLabel(level: number): string {
  if (level >= 5) return "EVACUATE";
  if (level >= 3) return "HIGH";
  if (level >= 2) return "SHARK ALERT";
  if (level >= 1) return "CAUTION";
  return "ALL CLEAR";
}
