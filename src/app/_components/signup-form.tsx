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
      setError("Account created, but sign-in failed. Please sign in manually.");
      return;
    }

    window.location.assign("/test");
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block font-sans text-sm font-medium text-ink"
        >
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-md border border-border bg-bg px-3 py-2.5 font-sans text-ink outline-none ring-primary/30 transition-shadow placeholder:text-muted focus:ring-2"
          placeholder="Ada Lovelace"
          autoComplete="name"
        />
      </div>
      <div>
        <label
          htmlFor="signup-email"
          className="mb-1.5 block font-sans text-sm font-medium text-ink"
        >
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-md border border-border bg-bg px-3 py-2.5 font-sans text-ink outline-none ring-primary/30 transition-shadow placeholder:text-muted focus:ring-2"
          placeholder="founder@startup.com"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <label
          htmlFor="signup-password"
          className="mb-1.5 block font-sans text-sm font-medium text-ink"
        >
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-md border border-border bg-bg px-3 py-2.5 font-sans text-ink outline-none ring-primary/30 transition-shadow placeholder:text-muted focus:ring-2"
          placeholder="••••••••"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>
      <div>
        <label
          htmlFor="confirm-password"
          className="mb-1.5 block font-sans text-sm font-medium text-ink"
        >
          Confirm password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full rounded-md border border-border bg-bg px-3 py-2.5 font-sans text-ink outline-none ring-primary/30 transition-shadow placeholder:text-muted focus:ring-2"
          placeholder="••••••••"
          autoComplete="new-password"
          minLength={6}
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
        {loading ? "Creating account..." : "Create account"}
      </button>
      <p className="text-center font-sans text-xs text-muted">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToSignin}
          className="font-medium text-primary hover:text-primary-hover"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
