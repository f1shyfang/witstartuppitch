"use client";

import { LifeguardAlert } from "../_components/LifeguardAlert";
import { useFlagdownRealtime } from "../_components/useFlagdownRealtime";
import { api } from "~/trpc/react";

export default function LifeguardPage() {
  useFlagdownRealtime();

  const { data: alert } = api.flagdown.getActiveLifeguardAlert.useQuery(
    undefined,
    { refetchInterval: 2000 },
  );

  return (
    <main className="mx-auto max-w-md p-6">
      <p className="mb-4 text-xs uppercase tracking-widest text-slate-400">
        SLS Manly · Lifeguard terminal
      </p>
      <LifeguardAlert alert={alert ?? null} />
    </main>
  );
}
