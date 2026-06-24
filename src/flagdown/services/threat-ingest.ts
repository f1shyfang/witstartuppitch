import { eq } from "drizzle-orm";
import { buildRoutingPlan } from "~/flagdown/routing/routing-table";
import type { RoutingInput, ThreatType } from "~/flagdown/types";
import { broadcastFlagdownEvent } from "~/lib/supabase/broadcast";
import { db } from "~/server/db";
import {
  beaches,
  coordinationActions,
  threatEvents,
} from "~/server/db/schema";

export async function ingestThreat(input: {
  beachId: string;
  threatType: ThreatType;
  threatLevel: number;
  source: string;
  confidence?: number;
}) {
  const beach = await db.query.beaches.findFirst({
    where: eq(beaches.id, input.beachId),
  });

  if (!beach) {
    throw new Error(`Beach not found: ${input.beachId}`);
  }

  const routingInput: RoutingInput = {
    beachId: beach.id,
    patrolType: beach.patrolType as "patrolled" | "unpatrolled",
    threatType: input.threatType,
    threatLevel: input.threatLevel,
  };

  const plan = buildRoutingPlan(routingInput);

  const [event] = await db
    .insert(threatEvents)
    .values({
      beachId: beach.id,
      type: input.threatType,
      source: input.source,
      confidence: input.confidence,
      level: plan.threatLevel,
      reasoning: plan.reasoning,
    })
    .returning();

  if (!event) throw new Error("Failed to create threat event");

  const actions = await db
    .insert(coordinationActions)
    .values(
      plan.actions.map((action) => ({
        threatEventId: event.id,
        channel: action.channel,
        status: "sent" as const,
        priority: action.priority,
        message: action.message,
        newFlagStatus: action.newFlagStatus,
        completedAt: new Date(),
      })),
    )
    .returning();

  const flagAction = plan.actions.find((a) => a.newFlagStatus);
  await db
    .update(beaches)
    .set({
      threatLevel: plan.threatLevel,
      flagStatus: flagAction?.newFlagStatus ?? beach.flagStatus,
    })
    .where(eq(beaches.id, beach.id));

  await broadcastFlagdownEvent("threat.ingested", {
    beachId: beach.id,
    threatEventId: event.id,
    threatLevel: plan.threatLevel,
  });

  return { event, actions, plan };
}
