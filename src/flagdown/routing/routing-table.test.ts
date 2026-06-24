import { describe, expect, it } from "vitest";
import { buildRoutingPlan } from "./routing-table";

describe("buildRoutingPlan", () => {
  it("routes patrolled beach shark L2 to lifeguard first", () => {
    const plan = buildRoutingPlan({
      beachId: "manly-south-steyne",
      patrolType: "patrolled",
      threatType: "shark",
      threatLevel: 2,
    });

    expect(plan.actions.map((a) => a.channel)).toEqual([
      "lifeguard_push",
      "flag_downgrade",
      "swimmer_push",
    ]);
    expect(plan.actions[0]!.message).toMatch(/shark/i);
  });

  it("routes unpatrolled beach shark L2 to council PA without lifeguard", () => {
    const plan = buildRoutingPlan({
      beachId: "collins-flat",
      patrolType: "unpatrolled",
      threatType: "shark",
      threatLevel: 2,
    });

    expect(plan.actions.map((a) => a.channel)).toEqual([
      "council_pa",
      "swimmer_push",
    ]);
    expect(plan.actions.some((a) => a.channel === "lifeguard_push")).toBe(
      false,
    );
  });

  it("escalates BOM L5 to all channels on any beach", () => {
    const plan = buildRoutingPlan({
      beachId: "manly-south-steyne",
      patrolType: "patrolled",
      threatType: "bom",
      threatLevel: 5,
    });

    const channels = plan.actions.map((a) => a.channel);
    expect(channels).toContain("lifeguard_push");
    expect(channels).toContain("council_pa");
    expect(channels).toContain("flag_downgrade");
    expect(channels).toContain("swimmer_push");
    expect(plan.threatLevel).toBe(5);
  });
});
