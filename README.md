# WitStartupPitch

T3 stack starter with **Next.js**, **tRPC**, **Tailwind**, **Drizzle ORM**, and **Supabase** (Postgres + Auth). Includes a mock landing page and password-only auth with MFA / 2FA disabled.

## Stack

- [Next.js App Router](https://nextjs.org)
- [tRPC](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team) on Supabase Postgres
- [NextAuth.js](https://next-auth.js.org) (Credentials → Supabase Auth)
- [@supabase/ssr](https://supabase.com/docs/guides/auth/server-side/nextjs) session handling

## Setup

1. Copy env template and fill in values from your [Supabase project](https://supabase.com/dashboard):

   ```bash
   cp .env.example .env
   ```

2. Generate an auth secret:

   ```bash
   npx auth secret
   ```

3. Push the Drizzle schema to Supabase:

   ```bash
   npm run db:push
   ```

4. Create a test user in Supabase (Auth → Users → Add user) with email + password.

5. Start the dev server:

   ```bash
   npm run dev
   ```

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
| `npm run db:studio` | Open Drizzle Studio |
| `npm run check` | Lint + typecheck |

## Auth notes

- Sign-in uses email + password via Supabase Auth (no 2FA prompts).
- Sessions are managed by NextAuth (JWT) with Supabase validating credentials.
- For hosted Supabase projects, disable MFA under **Authentication → Providers → MFA** if you want parity with local config.
