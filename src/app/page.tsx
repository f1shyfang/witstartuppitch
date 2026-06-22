import Link from "next/link";

import { AuthForm } from "~/app/_components/auth-form";
import { auth, signOut } from "~/server/auth";

const features = [
  {
    title: "Pitch in minutes",
    description:
      "Drop your deck, story, and traction into a clean narrative investors can scan fast.",
  },
  {
    title: "Founder-first workflow",
    description:
      "Built for early teams who need momentum, not another bloated fundraising CRM.",
  },
  {
    title: "Supabase + Drizzle",
    description:
      "Type-safe data layer on Postgres with auth wired through Supabase — no 2FA gate.",
  },
];

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#07050f] text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-lg font-semibold tracking-tight">
          WitStartup<span className="text-violet-400">Pitch</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#pricing" className="hover:text-white">
            Pricing
          </a>
          <a href="#auth" className="hover:text-white">
            Sign in
          </a>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-10 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-violet-200">
              Mock landing page
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              Ship your startup story before demo day.
            </h1>
            <p className="max-w-xl text-lg text-white/70">
              A T3 stack starter with Drizzle ORM, Supabase Postgres, and
              password auth — MFA turned off so you can iterate locally without
              friction.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#auth"
                className="rounded-full bg-violet-500 px-6 py-3 font-semibold text-white transition hover:bg-violet-400"
              >
                Get started
              </a>
              <Link
                href="https://create.t3.gg/"
                target="_blank"
                className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/90 transition hover:bg-white/5"
              >
                T3 docs
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 text-center sm:max-w-lg">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-2xl font-bold">48h</div>
                <div className="text-xs text-white/60">to first draft</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-2xl font-bold">12+</div>
                <div className="text-xs text-white/60">pitch sections</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-2xl font-bold">0</div>
                <div className="text-xs text-white/60">2FA prompts</div>
              </div>
            </div>
          </div>

          <div
            id="auth"
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950/50 to-black p-8 shadow-2xl shadow-violet-950/40"
          >
            {session?.user ? (
              <div className="space-y-4 text-center">
                <p className="text-sm uppercase tracking-[0.2em] text-violet-300">
                  Signed in
                </p>
                <p className="text-2xl font-semibold">
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
                    className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold transition hover:bg-white/5"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1 text-center">
                  <h2 className="text-2xl font-semibold">Welcome back</h2>
                  <p className="text-sm text-white/60">
                    Sign in with your Supabase user credentials.
                  </p>
                </div>
                <AuthForm />
              </div>
            )}
          </div>
        </section>

        <section id="features" className="border-t border-white/10 bg-white/[0.02]">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-20 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-black/20 p-6"
              >
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-white/65">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
          <div className="rounded-3xl border border-violet-400/20 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 p-10 text-center">
            <h2 className="text-3xl font-bold">Early access is free</h2>
            <p className="mx-auto mt-3 max-w-2xl text-white/70">
              This is a placeholder pricing block for the mock landing page.
              Swap in your real plans when you are ready to launch.
            </p>
            <a
              href="#auth"
              className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-white/90"
            >
              Join the waitlist
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-white/50">
        WitStartupPitch · T3 + Drizzle + Supabase starter
      </footer>
    </div>
  );
}
