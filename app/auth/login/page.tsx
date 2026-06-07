"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  const [values, setValues] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword(values);

    if (signInError) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    // Redirect after successful login
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="card p-10 w-full max-w-md">
      <h1 className="font-display text-3xl mb-1" style={{ color: "var(--ink-900)" }}>
        Welcome back
      </h1>
      <p className="mb-8 text-sm" style={{ color: "var(--ink-400)" }}>
        No account yet?{" "}
        <Link
          href="/auth/signup"
          style={{ color: "var(--moss-600)", textDecoration: "none" }}
        >
          Create one
        </Link>
      </p>

      {error && (
        <div
          className="mb-4 p-3 rounded-md text-sm"
          style={{ background: "#fde8e0", color: "var(--rust-600)" }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-1"
            style={{ color: "var(--ink-700)" }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="input-base"
            placeholder="you@example.com"
            value={values.email}
            onChange={set("email")}
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium mb-1"
            style={{ color: "var(--ink-700)" }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="input-base"
            placeholder="your password"
            value={values.password}
            onChange={set("password")}
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary mt-2 justify-center"
          disabled={loading}
        >
          {loading ? "Signing in…" : "Sign in →"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="card p-10 w-full max-w-md" style={{ minHeight: 300 }} />}>
      <LoginForm />
    </Suspense>
  );
}
