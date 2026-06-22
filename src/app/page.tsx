import Image from "next/image";
import Link from "next/link";

import { AuthPanel } from "~/app/_components/auth-panel";
import { auth, signOut } from "~/server/auth";

const workflow = [
  {
    step: "1",
    title: "Drop in your draft",
    description:
      "Paste notes, deck bullets, or traction stats. No rigid template — start messy.",
  },
  {
    step: "2",
    title: "Shape the narrative",
    description:
      "Reorder sections until the story scans: problem, insight, momentum, ask.",
  },
  {
    step: "3",
    title: "Walk into the room ready",
    description:
      "Export a clean outline you can rehearse aloud before demo day.",
  },
];

const strengths = [
  {
    title: "Pitch in minutes, not weeks",
    description:
      "Investors skim fast. WitStartupPitch keeps every section tight enough to read between meetings.",
  },
  {
    title: "Founder-first, not CRM-first",
    description:
      "Built for teams who need momentum — not another bloated fundraising pipeline.",
  },
  {
    title: "Postgres under the hood",
    description:
      "Supabase auth and Drizzle ORM wired in. Password sign-in, no 2FA gate while you iterate locally.",
  },
];

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/"
            className="font-sans text-lg font-semibold tracking-tight text-ink"
          >
            WitStartup
            <span className="text-primary">Pitch</span>
          </Link>
          <nav className="flex items-center gap-5 font-sans text-sm">
            <a
              href="#workflow"
              className="hidden text-muted transition-colors hover:text-ink sm:inline"
            >
              How it works
            </a>
            <a
              href="#features"
              className="hidden text-muted transition-colors hover:text-ink sm:inline"
            >
              Why founders use it
            </a>
            <a
              href="#auth"
              className="text-muted transition-colors hover:text-ink"
            >
              Sign in
            </a>
            <Link
              href="/#signup"
              className="rounded-full bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute -right-32 -top-24 h-[28rem] w-[28rem] rounded-full bg-primary-soft blur-3xl"
            aria-hidden
          />
          <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16 lg:pb-24 lg:pt-20">
            <div className="space-y-8">
              <p className="animate-rise font-sans text-sm font-medium text-accent-ink">
                For founders rehearsing before demo day
              </p>
              <h1 className="animate-rise-delay-1 max-w-[14ch] font-sans text-[clamp(2.5rem,5.5vw,4.25rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
                Tell your story so investors lean in.
              </h1>
              <p className="animate-rise-delay-2 max-w-[42ch] text-lg leading-relaxed text-muted">
                Shape a clear startup narrative — deck, traction, team — without
                drowning in fundraising software. Built on T3, Drizzle, and
                Supabase so you can ship the product next.
              </p>
              <div className="flex flex-wrap items-center gap-3 font-sans">
                <Link
                  href="/#signup"
                  className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                >
                  Start your pitch
                </Link>
                <a
                  href="#workflow"
                  className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface"
                >
                  See the workflow
                </a>
              </div>
              <p className="max-w-md font-sans text-sm text-muted">
                Postgres · Password auth · No 2FA friction while you build
              </p>
            </div>

            <div
              id="auth"
              className="animate-rise-delay-2 scroll-mt-24 rounded-[1.25rem] border border-border bg-bg p-6 shadow-[0_24px_48px_oklch(0.22_0.04_290/0.08)] sm:p-8"
            >
              {session?.user ? (
                <div className="space-y-5 text-center">
                  <p className="font-sans text-sm font-medium text-primary">
                    Signed in as
                  </p>
                  <p className="font-sans text-2xl font-semibold">
                    {session.user.name ?? session.user.email}
                  </p>
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/" });
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-full border border-border px-6 py-2.5 font-sans text-sm font-semibold transition-colors hover:bg-surface"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              ) : (
                <AuthPanel />
              )}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-surface">
          <div className="relative mx-auto max-w-6xl px-6 py-4">
            <div className="relative aspect-[21/9] min-h-[12rem] overflow-hidden rounded-xl sm:min-h-[16rem]">
              <Image
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80"
                alt="Founders gathered around a table, rehearsing a pitch before a presentation"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1152px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/35 to-transparent" />
              <blockquote className="absolute bottom-0 left-0 max-w-xl p-6 text-white sm:p-10">
                <p className="font-sans text-xl font-medium leading-snug sm:text-2xl">
                  &ldquo;The best pitches sound like a conversation you already
                  had — just tighter.&rdquo;
                </p>
                <footer className="mt-3 font-sans text-sm text-white/75">
                  Rehearse aloud. Cut everything that doesn&apos;t earn the next
                  slide.
                </footer>
              </blockquote>
            </div>
          </div>
        </section>

        <section id="workflow" className="scroll-mt-24">
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
            <div className="mb-14 max-w-2xl">
              <h2 className="font-sans text-3xl font-semibold tracking-tight sm:text-4xl">
                Three passes to a pitch you can deliver
              </h2>
              <p className="mt-4 text-lg text-muted">
                Order matters here — each step builds on the last.
              </p>
            </div>
            <ol className="grid gap-10 lg:grid-cols-3 lg:gap-8">
              {workflow.map((item) => (
                <li key={item.step} className="group">
                  <span className="font-sans text-5xl font-semibold leading-none text-primary/25 transition-colors group-hover:text-primary/40">
                    {item.step}
                  </span>
                  <h3 className="mt-4 font-sans text-xl font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-muted">{item.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-24 border-t border-border bg-surface"
        >
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
            <h2 className="mb-12 max-w-xl font-sans text-3xl font-semibold tracking-tight sm:text-4xl">
              Why founders reach for it the night before
            </h2>
            <ul className="divide-y divide-border">
              {strengths.map((item, index) => (
                <li
                  key={item.title}
                  className="grid gap-4 py-8 sm:grid-cols-[7rem_1fr] sm:items-start sm:gap-10"
                >
                  <span className="font-sans text-sm font-medium tabular-nums text-accent-ink">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-sans text-xl font-semibold">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-muted">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-24">
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
            <div className="grid gap-10 rounded-[1.25rem] border border-border bg-accent-soft px-8 py-12 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16 lg:px-14 lg:py-14">
              <div>
                <h2 className="font-sans text-3xl font-semibold tracking-tight sm:text-4xl">
                  Early access is free
                </h2>
                <p className="mt-4 max-w-xl text-lg text-accent-ink/80">
                  This starter ships with auth and a landing page. Swap in real
                  plans when you&apos;re ready to charge — the narrative work
                  stays the same.
                </p>
              </div>
              <Link
                href="/#signup"
                className="inline-flex shrink-0 justify-center rounded-full bg-ink px-8 py-3.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-ink/90"
              >
                Create an account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-10 text-center font-sans text-sm text-muted">
        WitStartupPitch · T3 + Drizzle + Supabase
      </footer>
    </div>
  );
}
