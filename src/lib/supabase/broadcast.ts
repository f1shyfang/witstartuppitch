import { createClient } from "@supabase/supabase-js";
import { env } from "~/env";

export async function broadcastFlagdownEvent(
  event: string,
  payload: Record<string, unknown>,
) {
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  const channel = supabase.channel("flagdown");
  void channel.subscribe();
  void channel.send({
    type: "broadcast",
    event,
    payload,
  });
  void supabase.removeChannel(channel);
}
