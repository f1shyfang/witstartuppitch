"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

type SignupFormProps = {
  onSwitchToSignin?: () => void;
};

export function SignupForm({ onSwitchToSignin }: SignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name: name.trim() || undefined,
      }),
    });

    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(result.error ?? "Unable to create account.");
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInResult?.error) {
      setError("Account created. Please sign in with your credentials.");
      return;
    }

    window.location.href = "/";
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
    >
      <div>
        <label htmlFor="name" className="mb-1 block text-sm text-white/70">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none ring-violet-400 focus:ring-2"
          placeholder="Ada Lovelace"
          autoComplete="name"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm text-white/70">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none ring-violet-400 focus:ring-2"
          placeholder="founder@startup.com"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm text-white/70">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none ring-violet-400 focus:ring-2"
          placeholder="••••••••"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>
      <div>
        <label
          htmlFor="confirm-password"
          className="mb-1 block text-sm text-white/70"
        >
          Confirm password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none ring-violet-400 focus:ring-2"
          placeholder="••••••••"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-violet-500 px-4 py-2.5 font-semibold text-white transition hover:bg-violet-400 disabled:opacity-60"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
      <p className="text-center text-xs text-white/50">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToSignin}
          className="text-violet-300 hover:text-violet-200"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
