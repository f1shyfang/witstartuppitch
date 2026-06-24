"use client";

import { useEffect } from "react";
import { createClient } from "~/lib/supabase/client";
import { api } from "~/trpc/react";

export function useFlagdownRealtime() {
  const utils = api.useUtils();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("flagdown")
      .on("broadcast", { event: "threat.ingested" }, () => {
        void utils.flagdown.listBeaches.invalidate();
        void utils.flagdown.getTimeline.invalidate();
        void utils.flagdown.getActiveLifeguardAlert.invalidate();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [utils]);
}
