# FlagDown — Beach Safety Coordination Layer

**Date:** 2026-06-23  
**Status:** Implemented (hackathon-ready demo)  
**Last updated:** 2026-06-26  
**Competition:** The Coordination Problem (Startup Pitch / Hackathon)

---

## Summary

**FlagDown** is a council-first coordination layer for Australian beach safety. It routes heterogeneous threat signals (CV detection, acoustic shark tags, BOM weather alerts) to the right actors through the right channels in under 60 seconds — based on beach context (patrolled vs unpatrolled) and escalating threat level.

**One-liner:** *"Green flag. Tagged shark 400m out. Three agencies. Zero coordinated response. FlagDown owns the 60-second handoff."*

**Pilot customer:** Northern Beaches Council (Sydney).  
**Hero beaches:** Manly South Steyne (patrolled) + Collins Flat (unpatrolled).

---

## Problem — The Coordination Failure

Australian beach safety fails at the **handoff**, not the sensor:

| Symptom | Root cause |
|---------|------------|
| Shark sighting takes 8–15 minutes to change flag state | Data exists (human spot, drone, tag ping) but no cross-org routing layer |
| Unpatrolled beaches have no actor in the loop | SLS patrol model doesn't cover coves like Collins Flat; council infra sits idle |
| BOM warnings and local shark alerts use separate channels | No unified escalation when threats layer (shark L2 → cyclone L5) |

**Coordination failure definition (brief-aligned):**

- Critical information exists but never reaches the right actor at the right time
- Systems cannot communicate across organisational boundaries (Council, SLS, BOM, DPI/SharkSmart)
- Rational individually (each agency has its own protocol), irrational collectively (swimmers see green flag while tag ping is live)

**Cost hooks for pitch:**

- Typical shark-to-flag latency: **8–15 minutes** (reactive human chain)
- Northern Beaches Council: **20+** patrolled beaches + dozens of unpatrolled stretches in one LGA
- Shark incidents are rare; **uncoordinated alerts** erode trust in flags and cost tourism/reputation

---

## Solution — Threat Router, Not Shark Detector

FlagDown's AI is **load-bearing on the coordination decision**: given a threat signal and beach context, determine threat level, actor list, channel sequence, and escalation path.

Detection (CV, acoustic tags) is an **input**. Council dashboard, lifeguard PWA, flags, PA, and push notifications are **outputs**.

### Unified wedges (A + B + C)

| Wedge | Failure | FlagDown action |
|-------|---------|-----------------|
| **A** — Patrolled shark handoff | Tag/drone data → minutes → lifeguard | CV detect → lifeguard ack → flag → push in <60s |
| **B** — Unpatrolled blind spot | No SLS; tag pings go nowhere | Same router; skip lifeguard → council PA + push |
| **C** — Multi-threat evacuation | BOM + shark hit different channels | Layered escalation: all channels orchestrated |

---

## Business Model

**Buyer:** Council (Northern Beaches Council pilot).

**Integrations (not customers):**

- Surf Life Saving NSW — lifeguard PWA module
- Bureau of Meteorology — weather/tsunami webhooks
- DPI/SharkSmart — acoustic tag feed (mocked for hackathon)

**Revenue:** SaaS per LGA + per-beach sensor tier. Land-and-expand across NSW councils.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     THREAT INPUTS                            │
│  CV upload │ SharkSmart tag │ BOM webhook │ Demo inject     │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   FLAGDOWN CORE (Vercel)                     │
│  Ingest API → Threat Router Agent (AI SDK) → State machine  │
│                          ↓                                   │
│              Supabase Realtime broadcast                   │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     COORDINATED OUTPUTS                      │
│  Council map │ Lifeguard PWA │ Flag state │ Push │ PA UI   │
└─────────────────────────────────────────────────────────────┘
```

### Stack

| Layer | Technology |
|-------|------------|
| App | Next.js 15 App Router at `/flagdown` |
| API | tRPC + route handlers for webhooks |
| AI | Vercel AI SDK — threat classification + routing plan |
| CV | On-device YOLOv8n + OWL-ViT via `onnxruntime-web`; GPT-4o-mini vision fallback optional |
| DB | Drizzle + Postgres (Supabase) |
| Realtime | Supabase Realtime broadcast + tRPC polling fallback |
| Map | Leaflet + OpenStreetMap (no API key required for hackathon) |
| ML training | Python 3.12 + Ultralytics YOLOv8 → ONNX export (see `ml/README.md`) |
| Model hosting | YOLO ONNX in repo (`public/models/flagdown-yolo/`); OWL-ViT on Vercel Blob in prod |

### Key dependencies

- `ai`, `@ai-sdk/openai` — optional server-side vision fallback
- `leaflet`, `react-leaflet` — council map
- `onnxruntime-web`, `@huggingface/transformers` — browser CV (client-only bundle)

---

## Components

### 1. Council Command Centre (`/flagdown/dashboard`)

Primary pitch screen.

- Interactive map of NB beaches with threat-level pin colors (green / amber / red / black)
- Beach detail panel: patrol status, active threats, channel delivery log
- Live timeline feed of coordination decisions with timestamps
- Hackathon demo controls: "Inject shark tag", "Inject BOM cyclone watch"

### 2. Lifeguard PWA (`/flagdown/lifeguard`)

- Mobile-first alert card (push-style)
- Actions: Acknowledge / Escalate / False alarm
- Acknowledgement feeds back to council map via Realtime

### 3. Threat Router Agent (server)

**Input:** Threat event + beach registry lookup.

**Output (structured):**

```ts
{
  threatLevel: 1 | 2 | 3 | 4 | 5,
  beachId: string,
  patrolType: "patrolled" | "unpatrolled",
  actions: Array<{
    channel: "lifeguard_push" | "flag_downgrade" | "swimmer_push" | "council_pa",
    priority: number,
    message: string,
    newFlagStatus?: string,
  }>,
  reasoning: string,
}
```

**Deterministic routing fallback** (if AI unavailable):

| Beach type | Threat | Channel sequence |
|------------|--------|------------------|
| Patrolled | Shark L2 | Lifeguard → flag downgrade → swimmer push |
| Unpatrolled | Shark L2 | Council PA → swimmer push (no lifeguard) |
| Any | BOM L5 | All channels + evacuation message |

### 4. CV Pipeline (`CvScanner` on dashboard)

The CV scanner runs **entirely in the browser** for the primary demo path — no round-trip to a GPU server.

1. Select a demo sample (reef shark / jellyfish / clear reef) or upload a frame
2. Choose model: **FlagDown YOLO** (fine-tuned), **OWL-ViT** (zero-shot), or **Preset** (known-good sample)
3. On-device inference produces bounding boxes with a drone-POV HUD (lock-on reticles, leader lines)
4. Client sends detections to `analyzeAndIngestCv` → server summarizes → on shark detection, creates `ThreatEvent` → threat router

**Model details:**

| Model | Source | Size | Classes |
|-------|--------|------|---------|
| FlagDown YOLOv8n | Trained on [Kaggle underwater dataset](https://www.kaggle.com/datasets/cubeai/underwater-animal-detection-for-yolov8) | ~12 MB ONNX | fish, jellyfish, penguin, auk, **shark**, starfish, stingray |
| OWL-ViT base patch32 | Hugging Face / Vercel Blob | ~156 MB quantized ONNX | Open-vocabulary (text prompts: shark, dorsal fin, jellyfish, swimmer…) |

**Fallback chain:** On-device detections → preset sample scores → GPT-4o-mini vision (if `OPENAI_API_KEY` set) → deterministic demo fallback.

**Demo safety:** Preset samples and YOLO on `reef-shark.jpg` give reliable shark detections; live upload is a bonus.

---

## Data Model

### Tables

| Table | Fields (core) |
|-------|---------------|
| `beaches` | id, name, lat, lng, patrol_type, council_lga, sls_club |
| `threat_events` | id, type, source, confidence, beach_id, level, created_at |
| `coordination_actions` | id, threat_event_id, channel, status, message, scheduled_at, completed_at |
| `acks` | id, threat_event_id, actor_type, actor_id, response, created_at |

### Seed beaches

| Beach | patrol_type | Notes |
|-------|-------------|-------|
| Manly South Steyne | patrolled | SLS Manly, Act 1A hero |
| Collins Flat | unpatrolled | 800m from Manly, Act 1B hero |
| Dee Why | patrolled | Map density |
| Freshwater | patrolled | Map density |
| North Narrabeen | patrolled | Map density |

---

## Demo Script (60 seconds)

### Act 1 — Built for real (~45s)

| Time | Action | Screen |
|------|--------|--------|
| 0–5s | "Manly, green flag, Saturday arvo" | Map zoom to Manly |
| 5–20s | CV trigger on drone clip — shark detected | Detection toast → agent runs |
| 20–35s | Lifeguard PWA buzzes; lifeguard acks | Split view: PWA + map updates |
| 35–45s | Flag → purple; swimmer push count increments | Council timeline |
| 45–55s | Pan to Collins Flat — inject acoustic tag | PA fires; no lifeguard route |
| 55–60s | Pause on contrast | "Same threat. Different actors. One router." |

**Wow line (Act 1):** *"Patrolled beach: lifeguard alerted in 11 seconds. Unpatrolled beach 2km south: council siren — no lifeguard in the loop."*

### Act 2 — Simulated (~15s)

| Time | Action |
|------|--------|
| 0–5s | Active shark alert still running from Act 1 |
| 5–10s | Inject BOM cyclone watch for NB LGA |
| 10–15s | Escalation L2 → L5: all channels cascade (phones → PA → flags) |

**Wow line (Act 2):** *"Shark alert was level 2. BOM just made it level 5. Three agencies coordinated in one escalation — not three separate apps."*

---

## Build vs Simulate

| Build for real | Simulate |
|----------------|----------|
| Threat router agent + state machine | BOM webhook (scripted inject) |
| Beach registry + map | Acoustic tag feed (mock JSON) |
| Patrolled vs unpatrolled routing | Council PA hardware (UI + sound) |
| Lifeguard PWA + ack loop | Loudspeaker API |
| Council dashboard + Realtime timeline | Swimmer push (count on screen) |
| On-device CV (YOLO + OWL-ViT) on curated samples | GPT-4o-mini vision on arbitrary uploads |

---

## Hackathon Build Order (24h)

1. Beach seed data + interactive map with pins
2. Threat router agent + escalation state machine
3. Council dashboard + Realtime event feed
4. Lifeguard PWA + acknowledgement loop
5. CV upload on curated Manly clip
6. Demo inject buttons (SharkSmart tag, BOM)
7. Polish: timeline UI, threat pin colors, pitch fullscreen mode

---

## Out of Scope

- Real council PA / loudspeaker hardware integration (UI + siren audio only)
- Production BOM or SharkSmart API contracts (mock inject buttons)
- Consumer app-store swimmer application (simulated push count on dashboard)
- Rip current computer vision (roadmap mention only)
- Production-grade YOLO accuracy tuning (hackathon demo uses a quick fine-tune)

---

## 8-Slide Deck Outline

1. **Title** — FlagDown: The 60-second beach handoff
2. **Problem** — The green flag lie; coordination failure diagram
3. **Cost** — 8–15 min latency; unpatrolled blind spots; NB Council scale
4. **Wedge** — Manly + Collins Flat; one LGA pilot
5. **Demo** — Live or screenshot walkthrough
6. **AI mechanism** — Threat router agent (coordination decision at data speed)
7. **Business** — Council SaaS; per-LGA pricing; NSW rollout path
8. **Ask** — NB Council pilot; 3 beaches live in 90 days

---

## Error Handling

| Failure | Behaviour |
|---------|-----------|
| AI agent timeout/error | Fall back to deterministic routing table |
| CV low confidence | Show confidence score; require manual confirm in demo mode |
| Lifeguard no ack within 60s | Auto-escalate to council PA + flag downgrade |
| Realtime disconnect | Dashboard polls tRPC every 5s as fallback |

---

## Testing (hackathon minimum)

- Unit: routing table returns correct channel sequence for patrolled vs unpatrolled
- Integration: inject threat → actions created → Realtime event emitted
- E2E demo path: CV trigger → lifeguard ack → map pin color change (Playwright or manual checklist)

---

## Open Decisions (resolved)

| Decision | Choice |
|----------|--------|
| Geography | Northern Beaches Council |
| Demo beaches | Manly South Steyne + Collins Flat |
| Business model | Council-first SaaS |
| Map library | Leaflet + OSM |
| CV approach | On-device YOLOv8n + OWL-ViT; GPT-4o-mini vision fallback |
| Product name | FlagDown |
