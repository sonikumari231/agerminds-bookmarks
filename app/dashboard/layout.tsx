import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/auth/SignOutButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Fetch the user's profile for the handle
  const { data: profile } = await supabase
    .from("profiles")
    .select("handle, display_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen" style={{ background: "var(--cream-100)" }}>
      {/* Top nav */}
      <nav
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
        style={{
          background: "var(--cream-50)",
          borderColor: "var(--ink-100)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Link
          href="/dashboard"
          className="font-display text-xl"
          style={{ color: "var(--ink-900)", textDecoration: "none" }}
        >
          Linkt
        </Link>

        <div className="flex items-center gap-3">
          {profile?.handle && (
           <Link
              href={`/${profile.handle}`}
              className="font-mono text-xs px-3 py-1.5 rounded-full"
              style={{
                background: "var(--cream-200)",
                color: "var(--ink-600)",
                textDecoration: "none",
                border: "1px solid var(--ink-100)",
              }}
            >
              @{profile.handle} ↗
            </Link>
          )}
          <SignOutButton />
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-3xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
