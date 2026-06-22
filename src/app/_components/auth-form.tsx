"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

type AuthFormProps = {
  onSwitchToSignup?: () => void;
};

export function AuthForm({ onSwitchToSignup }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    window.location.href = "/test";
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block font-sans text-sm font-medium text-ink"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-md border border-border bg-bg px-3 py-2.5 font-sans text-ink outline-none ring-primary/30 transition-shadow placeholder:text-muted focus:ring-2"
          placeholder="founder@startup.com"
          required
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block font-sans text-sm font-medium text-ink"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-md border border-border bg-bg px-3 py-2.5 font-sans text-ink outline-none ring-primary/30 transition-shadow placeholder:text-muted focus:ring-2"
          placeholder="••••••••"
          required
        />
      </div>
      {error ? (
        <p className="font-sans text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-primary px-4 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-center font-sans text-xs text-muted">
        No account yet?{" "}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="font-medium text-primary hover:text-primary-hover"
        >
          Sign up
        </button>
      </p>
    </form>
  );
}
