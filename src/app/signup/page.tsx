import Link from "next/link";
import { redirect } from "next/navigation";

import { SignupForm } from "~/app/_components/signup-form";
import { auth } from "~/server/auth";

export default async function SignupPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/test");
  }

  return (
    <div className="min-h-screen bg-[#07050f] text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight transition hover:text-violet-200"
        >
          WitStartup<span className="text-violet-400">Pitch</span>
        </Link>
        <Link
          href="/#auth"
          className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
        >
          Sign in
        </Link>
      </header>

      <main className="mx-auto grid max-w-5xl gap-10 px-6 pb-20 pt-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
        <div className="hidden space-y-6 lg:block">
          <p className="text-sm uppercase tracking-[0.2em] text-violet-300">
            Get started
          </p>
          <h1 className="font-sans text-4xl font-semibold leading-[1.1] tracking-tight">
            Ship the demo. Earn the pitch.
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-white/60">
            Create an account to access the protected workspace, manage your
            demo data, and rehearse your startup pitch with live tooling.
          </p>
          <ul className="space-y-3 text-sm text-white/70">
            {[
              "Live FlagDown coordination demo",
              "Protected database playground",
              "No 2FA while you iterate",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-violet-500/20 text-violet-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3"
                    aria-hidden
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full space-y-6 rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950/50 to-black p-8 shadow-2xl shadow-violet-950/40">
          <div className="space-y-1 text-center lg:text-left">
            <p className="text-sm uppercase tracking-[0.2em] text-violet-300 lg:hidden">
              Get started
            </p>
            <h2 className="text-3xl font-semibold">Create your account</h2>
            <p className="text-sm text-white/60">
              Sign up with email and password. No 2FA required.
            </p>
          </div>
          <SignupForm />
        </div>
      </main>
    </div>
  );
}
