"use client";

import { useEffect, useState } from "react";

import { AuthForm } from "~/app/_components/auth-form";
import { SignupForm } from "~/app/_components/signup-form";

type AuthMode = "signin" | "signup";

export function AuthPanel() {
  const [mode, setMode] = useState<AuthMode>("signin");

  useEffect(() => {
    const syncMode = () => {
      const hash = window.location.hash;
      if (hash === "#signup") {
        setMode("signup");
        document.getElementById("auth")?.scrollIntoView({ behavior: "smooth" });
      } else if (hash === "#auth") {
        setMode("signin");
      }
    };
    syncMode();
    window.addEventListener("hashchange", syncMode);
    return () => window.removeEventListener("hashchange", syncMode);
  }, []);

  function switchMode(next: AuthMode) {
    setMode(next);
    window.history.replaceState(
      null,
      "",
      next === "signup" ? "#signup" : "#auth",
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex rounded-full border border-border bg-surface p-1">
        <button
          type="button"
          onClick={() => switchMode("signin")}
          className={`flex-1 rounded-full px-4 py-2 font-sans text-sm font-semibold transition-colors ${
            mode === "signin"
              ? "bg-primary text-white"
              : "text-muted hover:text-ink"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={`flex-1 rounded-full px-4 py-2 font-sans text-sm font-semibold transition-colors ${
            mode === "signup"
              ? "bg-primary text-white"
              : "text-muted hover:text-ink"
          }`}
        >
          Sign up
        </button>
      </div>

      <div className="space-y-1 text-center">
        <h2 className="font-sans text-2xl font-semibold">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="font-sans text-sm text-muted">
          {mode === "signin"
            ? "Sign in with your Supabase credentials."
            : "Email and password only — no 2FA while you iterate."}
        </p>
      </div>

      {mode === "signin" ? (
        <AuthForm onSwitchToSignup={() => switchMode("signup")} />
      ) : (
        <SignupForm onSwitchToSignin={() => switchMode("signin")} />
      )}
    </div>
  );
}
