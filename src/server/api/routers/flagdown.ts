import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { analyzeSharkImage } from "~/flagdown/services/cv-analyze";
import { ingestThreat } from "~/flagdown/services/threat-ingest";
import { cvDetectionSchema } from "~/flagdown/types/cv";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import {
  acks,
  beaches,
  coordinationActions,
  threatEvents,
} from "~/server/db/schema";

export const flagdownRouter = createTRPCRouter({
  listBeaches: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.beaches.findMany();
  }),

  getBeach: publicProcedure
    .input(z.object({ beachId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.beaches.findFirst({
        where: eq(beaches.id, input.beachId),
      });
    }),

  getTimeline: publicProcedure.query(async ({ ctx }) => {
    const events = await ctx.db.query.threatEvents.findMany({
      orderBy: [desc(threatEvents.createdAt)],
      limit: 20,
      with: {
        beach: true,
        actions: true,
      },
    });
    return events.map((event) => ({
      ...event,
      actions: [...event.actions].sort((a, b) => a.priority - b.priority),
    }));
  }),

  getActiveLifeguardAlert: publicProcedure.query(async ({ ctx }) => {
    const actions = await ctx.db.query.coordinationActions.findMany({
      where: eq(coordinationActions.channel, "lifeguard_push"),
      orderBy: [desc(coordinationActions.createdAt)],
      limit: 1,
      with: {
        threatEvent: { with: { beach: true } },
      },
    });
    return actions[0] ?? null;
  }),

  injectSharkTag: publicProcedure
    .input(z.object({ beachId: z.string().default("collins-flat") }))
    .mutation(async ({ input }) => {
      return ingestThreat({
        beachId: input.beachId,
        threatType: "tag",
        threatLevel: 2,
        source: "sharksmart-mock",
        confidence: 0.92,
      });
    }),

  injectBom: publicProcedure.mutation(async ({ ctx }) => {
    const result = await ingestThreat({
      beachId: "manly-south-steyne",
      threatType: "bom",
      threatLevel: 5,
      source: "bom-mock",
    });
    await ctx.db
      .update(beaches)
      .set({ threatLevel: 5, flagStatus: "black" })
      .where(sql`true`);
    return result;
  }),

  triggerCvShark: publicProcedure
    .input(z.object({ beachId: z.string().default("manly-south-steyne") }))
    .mutation(async ({ input }) => {
      return ingestThreat({
        beachId: input.beachId,
        threatType: "cv",
        threatLevel: 2,
        source: "drone-cv",
        confidence: 0.87,
      });
    }),

  analyzeAndIngestCv: publicProcedure
    .input(
      z.object({
        beachId: z.string().default("manly-south-steyne"),
        imageBase64: z.string().optional(),
        sampleId: z.string().optional(),
        clientDetections: z.array(cvDetectionSchema).optional(),
        clientModel: z
          .enum(["flagdown-yolov8n", "owlvit-base-patch32"])
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const analysis = await analyzeSharkImage({
        imageBase64: input.imageBase64,
        sampleId: input.sampleId,
        clientDetections: input.clientDetections,
        clientModel: input.clientModel,
      });
      if (!analysis.sharkDetected) {
        return { ingested: false as const, analysis };
      }
      const result = await ingestThreat({
        beachId: input.beachId,
        threatType: "cv",
        threatLevel: 2,
        source: `drone-cv-${analysis.model}`,
        confidence: analysis.confidence,
      });
      return { ingested: true as const, analysis, result };
    }),

  ackLifeguard: publicProcedure
    .input(
      z.object({
        threatEventId: z.string(),
        response: z.enum(["acknowledged", "escalated", "false_alarm"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(acks).values({
        threatEventId: input.threatEventId,
        actorType: "lifeguard",
        actorId: "sls-manly",
        response: input.response,
      });
      return { ok: true };
    }),

  resetDemo: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.db.delete(coordinationActions).where(sql`true`);
    await ctx.db.delete(acks).where(sql`true`);
    await ctx.db.delete(threatEvents).where(sql`true`);
    await ctx.db
      .update(beaches)
      .set({ flagStatus: "green", threatLevel: 0 })
      .where(sql`true`);
    return { ok: true };
  }),
});
