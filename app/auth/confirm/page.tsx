import Link from "next/link";

export default function ConfirmPage() {
  return (
    <div className="card p-10 w-full max-w-md text-center">
      <div className="text-4xl mb-4">✅</div>
      <h2 className="font-display text-2xl mb-3" style={{ color: "var(--ink-900)" }}>
        Email confirmed!
      </h2>
      <p className="mb-6 text-sm" style={{ color: "var(--ink-500)", lineHeight: 1.7 }}>
        Your account is active. Head to your dashboard to start saving bookmarks.
      </p>
      <Link href="/dashboard" className="btn-primary justify-center">
        Go to dashboard →
      </Link>
    </div>
  );
}
