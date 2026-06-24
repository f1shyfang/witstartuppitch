import { z } from "zod";

export const patrolTypeSchema = z.enum(["patrolled", "unpatrolled"]);
export type PatrolType = z.infer<typeof patrolTypeSchema>;

export const threatTypeSchema = z.enum(["shark", "tag", "bom", "cv"]);
export type ThreatType = z.infer<typeof threatTypeSchema>;

export const channelSchema = z.enum([
  "lifeguard_push",
  "flag_downgrade",
  "swimmer_push",
  "council_pa",
]);
export type Channel = z.infer<typeof channelSchema>;

export const routingActionSchema = z.object({
  channel: channelSchema,
  priority: z.number(),
  message: z.string(),
  newFlagStatus: z.string().optional(),
});

export const routingPlanSchema = z.object({
  threatLevel: z.number().min(1).max(5),
  beachId: z.string(),
  patrolType: patrolTypeSchema,
  actions: z.array(routingActionSchema),
  reasoning: z.string(),
});

export type RoutingAction = z.infer<typeof routingActionSchema>;
export type RoutingPlan = z.infer<typeof routingPlanSchema>;

export const routingInputSchema = z.object({
  beachId: z.string(),
  patrolType: patrolTypeSchema,
  threatType: threatTypeSchema,
  threatLevel: z.number().min(1).max(5),
});

export type RoutingInput = z.infer<typeof routingInputSchema>;
