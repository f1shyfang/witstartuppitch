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
    <div className="space-y-4">
      <div className="flex rounded-full border border-white/10 bg-black/30 p-1">
        <button
          type="button"
          onClick={() => switchMode("signin")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
            mode === "signin"
              ? "bg-violet-500 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
            mode === "signup"
              ? "bg-violet-500 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          Sign up
        </button>
      </div>

      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-semibold">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="text-sm text-white/60">
          {mode === "signin"
            ? "Sign in with your Supabase credentials."
            : "Sign up with email and password. No 2FA required."}
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
