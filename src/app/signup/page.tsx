import Link from "next/link";
import { redirect } from "next/navigation";

import { SignupForm } from "~/app/_components/signup-form";
import { auth } from "~/server/auth";

export default async function SignupPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
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
          href="/"
          className="text-sm text-white/70 transition hover:text-white"
        >
          Sign in
        </Link>
      </header>

      <main className="mx-auto flex max-w-lg flex-col items-center px-6 pb-20 pt-10">
        <div className="w-full space-y-6 rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950/50 to-black p-8 shadow-2xl shadow-violet-950/40">
          <div className="space-y-1 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-violet-300">
              Get started
            </p>
            <h1 className="text-3xl font-semibold">Create your account</h1>
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
