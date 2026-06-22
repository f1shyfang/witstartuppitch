---
name: WitStartupPitch
description: Demo-day rehearsal room — focused spotlight, honest urgency, pages that earn trust.
colors:
  bg: "#ffffff"
  surface: "#f6f4fa"
  ink: "#1c1528"
  muted: "#5c5470"
  primary: "#5b3fd4"
  primary-hover: "#4a32b8"
  accent: "#d4920a"
  accent-ink: "#3d2800"
  border: "#e8e4f0"
typography:
  display:
    fontFamily: "Geologica, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5.5vw, 4.25rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Lusitana, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "12px"
  lg: "20px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "32px"
  xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "14px 28px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
---

## Overview

WitStartupPitch uses a restrained white surface with a committed violet primary and warm amber accent. Display type is geometric and confident; body copy is serif for narrative warmth. Layout favors asymmetric hero composition, editorial feature lists, and one decisive photograph — not card grids.

## Colors

Canonical values in OKLCH:

- `--color-bg`: oklch(1 0 0) — pure white
- `--color-surface`: oklch(0.97 0.008 290)
- `--color-ink`: oklch(0.22 0.025 290)
- `--color-muted`: oklch(0.48 0.02 290)
- `--color-primary`: oklch(0.52 0.18 290)
- `--color-primary-hover`: oklch(0.46 0.19 290)
- `--color-accent`: oklch(0.68 0.15 55)
- `--color-border`: oklch(0.91 0.012 290)

## Typography

Geologica for headings (balance on h1–h3). Lusitana for body and long prose (pretty wrap). Max prose width ~68ch.

## Elevation

Subtle borders over shadows. One soft shadow on the auth panel only: `0 24px 48px oklch(0.22 0.04 290 / 0.08)`.

## Components

Primary buttons: filled violet, white text. Secondary: ink border on white. Accent highlights (badges, links): amber on light tint, not gradient text.

## Do's and Don'ts

**Do:** asymmetric hero, verified photography, numbered workflow steps, single kicker in hero only.

**Don't:** hero metrics, gradient pricing bands, glassmorphism defaults, side-stripe borders, monospace as "startup" costume.
