import type { RoutingInput, RoutingPlan } from "~/flagdown/types";

export function buildRoutingPlan(input: RoutingInput): RoutingPlan {
  const { beachId, patrolType, threatType, threatLevel } = input;

  if (threatType === "bom" || threatLevel >= 5) {
    return {
      threatLevel: 5,
      beachId,
      patrolType,
      reasoning:
        "BOM-level threat — full beach evacuation across all channels.",
      actions: [
        {
          channel: "lifeguard_push",
          priority: 1,
          message:
            "EVACUATE: BOM cyclone/tsunami warning for Northern Beaches.",
        },
        {
          channel: "flag_downgrade",
          priority: 2,
          message: "All flags black — beach closed.",
          newFlagStatus: "black",
        },
        {
          channel: "council_pa",
          priority: 3,
          message:
            "Emergency evacuation. Leave the beach immediately. Cyclone warning in effect.",
        },
        {
          channel: "swimmer_push",
          priority: 4,
          message: "EVACUATE NOW — BOM warning for your area.",
        },
      ],
    };
  }

  if (patrolType === "patrolled") {
    return {
      threatLevel,
      beachId,
      patrolType,
      reasoning:
        "Patrolled beach — lifeguard is first responder, then flag and public push.",
      actions: [
        {
          channel: "lifeguard_push",
          priority: 1,
          message: `Shark alert L${threatLevel}: possible shark sighting. Acknowledge and assess.`,
        },
        {
          channel: "flag_downgrade",
          priority: 2,
          message: "Downgrade flag to purple — shark sighting.",
          newFlagStatus: "purple",
        },
        {
          channel: "swimmer_push",
          priority: 3,
          message: `Shark spotted near ${beachId}. Exit water calmly.`,
        },
      ],
    };
  }

  return {
    threatLevel,
    beachId,
    patrolType,
    reasoning:
      "Unpatrolled beach — no lifeguard; council PA and direct public alert.",
    actions: [
      {
        channel: "council_pa",
        priority: 1,
        message: `Shark alert at unpatrolled beach. Do not enter water.`,
      },
      {
        channel: "swimmer_push",
        priority: 2,
        message: `Shark detected near ${beachId}. This beach is unpatrolled — leave water immediately.`,
      },
    ],
  };
}
