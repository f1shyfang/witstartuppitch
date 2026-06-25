# WitStartupPitch

T3 stack starter with **Next.js**, **tRPC**, **Tailwind**, **Drizzle ORM**, and **Supabase** (Postgres + Auth). Includes a landing page with password-only auth (MFA / 2FA disabled) and **FlagDown** — a hackathon demo for beach-safety coordination.

## FlagDown (beach coordination demo)

**FlagDown** routes heterogeneous threat signals (CV detection, acoustic shark tags, BOM weather alerts) to the right actors through the right channels in under 60 seconds — based on beach context (patrolled vs unpatrolled) and escalating threat level.

| Route | Purpose |
| --- | --- |
| `/flagdown/dashboard` | Council command centre — map, timeline, CV scanner, demo injects |
| `/flagdown/lifeguard` | Lifeguard PWA — alert card + acknowledge / escalate / false alarm |

**Pilot geography:** Northern Beaches Council (Sydney). Hero beaches: Manly South Steyne (patrolled) and Collins Flat (unpatrolled).

**CV pipeline:** On-device inference in the browser via `onnxruntime-web`:

- **FlagDown YOLOv8n** — custom shark/marine-danger detector trained on underwater imagery (~12 MB ONNX, committed in repo)
- **OWL-ViT** — zero-shot open-vocabulary detection (hosted on Vercel Blob in production; Hugging Face in dev)

Detections feed the threat router → coordination actions → Supabase Realtime broadcast. See [`ml/README.md`](ml/README.md) for training/export and [`docs/superpowers/specs/2026-06-23-flagdown-design.md`](docs/superpowers/specs/2026-06-23-flagdown-design.md) for the full product spec.

## Stack

- [Next.js App Router](https://nextjs.org)
- [tRPC](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team) on Supabase Postgres
- [NextAuth.js](https://next-auth.js.org) (Credentials → Supabase Auth)
- [@supabase/ssr](https://supabase.com/docs/guides/auth/server-side/nextjs) session handling
- [Vercel AI SDK](https://sdk.vercel.ai) — optional GPT-4o-mini vision fallback for CV uploads
- [Leaflet](https://leafletjs.com) + [react-leaflet](https://react-leaflet.js.org) — council map
- [onnxruntime-web](https://onnxruntime.ai) + [@huggingface/transformers](https://huggingface.co/docs/transformers.js) — on-device CV

## Setup

1. Copy env template and fill in values from your [Supabase project](https://supabase.com/dashboard):

   ```bash
   cp .env.example .env
   ```

2. Generate an auth secret:

   ```bash
   npx auth secret
   ```

3. Push the Drizzle schema and seed FlagDown beaches:

   ```bash
   npm run db:push
   npm run seed:beaches
   ```

   Or use the combined setup script:

   ```bash
   npm run db:setup-flagdown
   ```

4. Create a test user in Supabase (Auth → Users → Add user) with email + password.

5. Start the dev server:

   ```bash
   npm run dev
   ```

6. Open FlagDown at [http://localhost:3000/flagdown/dashboard](http://localhost:3000/flagdown/dashboard).

### Optional env vars

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | GPT-4o-mini vision fallback when uploading images without on-device detections |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase Realtime broadcast |
| `NEXT_PUBLIC_OWLVIT_MODEL_BASE` | Vercel Blob URL prefix for OWL-ViT ONNX in production |

## Supabase local (optional)

```bash
supabase start
```

Local auth config in `supabase/config.toml` keeps MFA / 2FA disabled (`auth.mfa.totp.enroll_enabled = false`).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js dev server |
| `npm run db:push` | Push Drizzle schema to Postgres |
| `npm run db:setup-flagdown` | Push schema + seed NB beaches |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run seed:beaches` | Seed Northern Beaches beach registry |
| `npm run check` | Lint + typecheck |
| `npm test` | Run Vitest unit tests |
| `npm run cv:download-samples` | Download Kaggle underwater CV sample images |
| `npm run cv:download-model` | Download OWL-ViT ONNX locally (optional; prod uses Blob) |
| `npm run ml:train` | Train FlagDown YOLOv8n + export ONNX |
| `npm run ml:demo-frames` | Generate demo frame sequence from YOLO weights |

## Auth notes

- Sign-in uses email + password via Supabase Auth (no 2FA prompts).
- Sessions are managed by NextAuth (JWT) with Supabase validating credentials.
- For hosted Supabase projects, disable MFA under **Authentication → Providers → MFA** if you want parity with local config.

## Documentation

| Doc | Contents |
| --- | --- |
| [`docs/superpowers/specs/2026-06-23-flagdown-design.md`](docs/superpowers/specs/2026-06-23-flagdown-design.md) | Product spec — problem, architecture, demo script |
| [`docs/superpowers/plans/2026-06-23-flagdown.md`](docs/superpowers/plans/2026-06-23-flagdown.md) | Implementation plan + build status |
| [`ml/README.md`](ml/README.md) | YOLO training, classes, browser inference |
| [`PRODUCT.md`](PRODUCT.md) | WitStartupPitch brand principles |
| [`DESIGN.md`](DESIGN.md) | WitStartupPitch design tokens |
