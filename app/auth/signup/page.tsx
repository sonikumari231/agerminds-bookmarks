"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SignUpInput } from "@/lib/validations";

type FieldErrors = Partial<Record<keyof SignUpInput | "root", string[]>>;

export default function SignUpPage() {
  const router = useRouter();
  const [values, setValues] = useState({ email: "", password: "", handle: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          handle: values.handle.toLowerCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.issues) {
          setErrors(data.issues);
        } else {
          setErrors({ root: [data.error ?? "Something went wrong"] });
        }
        return;
      }

      setSuccess(true);
    } catch {
      setErrors({ root: ["Network error — please try again"] });
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="card p-10 w-full max-w-md text-center" style={{ animationFillMode: "forwards" }}>
        <div className="text-4xl mb-4">📬</div>
        <h2 className="font-display text-2xl mb-3" style={{ color: "var(--ink-900)" }}>
          Check your inbox
        </h2>
        <p style={{ color: "var(--ink-500)", fontSize: 14, lineHeight: 1.7 }}>
          We sent a confirmation link to{" "}
          <strong style={{ color: "var(--ink-700)" }}>{values.email}</strong>. Click it to
          activate your account, then come back to sign in.
        </p>
        <Link href="/auth/login" className="btn-primary mt-6" style={{ justifyContent: "center" }}>
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-10 w-full max-w-md">
      <h1 className="font-display text-3xl mb-1" style={{ color: "var(--ink-900)" }}>
        Create your shelf
      </h1>
      <p className="mb-8 text-sm" style={{ color: "var(--ink-400)" }}>
        Already have one?{" "}
        <Link
          href="/auth/login"
          style={{ color: "var(--moss-600)", textDecoration: "none" }}
        >
          Sign in
        </Link>
      </p>

      {errors.root && (
        <div
          className="mb-4 p-3 rounded-md text-sm"
          style={{ background: "#fde8e0", color: "var(--rust-600)" }}
        >
          {errors.root[0]}
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
          {errors.email && <p className="error-text">{errors.email[0]}</p>}
        </div>

        <div>
          <label
            htmlFor="handle"
            className="block text-sm font-medium mb-1"
            style={{ color: "var(--ink-700)" }}
          >
            Handle
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono"
              style={{ color: "var(--ink-400)" }}
            >
              @
            </span>
            <input
              id="handle"
              type="text"
              autoComplete="username"
              className="input-base"
              style={{ paddingLeft: 28 }}
              placeholder="yourhandle"
              value={values.handle}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  handle: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                }))
              }
              required
            />
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--ink-400)" }}>
            3–30 chars, lowercase letters, numbers and underscores only
          </p>
          {errors.handle && <p className="error-text">{errors.handle[0]}</p>}
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
            autoComplete="new-password"
            className="input-base"
            placeholder="at least 8 characters"
            value={values.password}
            onChange={set("password")}
            required
          />
          {errors.password && <p className="error-text">{errors.password[0]}</p>}
        </div>

        <button
          type="submit"
          className="btn-primary mt-2 justify-center"
          disabled={loading}
        >
          {loading ? "Creating account…" : "Create account →"}
        </button>
      </form>
    </div>
  );
}
