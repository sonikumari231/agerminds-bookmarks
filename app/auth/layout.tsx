import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--cream-100)" }}
    >
      {/* Simple nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <Link
          href="/"
          className="font-display text-xl"
          style={{ color: "var(--ink-900)", textDecoration: "none" }}
        >
          Linkt
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center p-8">
        {children}
      </main>
    </div>
  );
}
