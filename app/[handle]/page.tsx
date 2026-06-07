import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Bookmark, Profile } from "@/types/database";

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, handle")
    .eq("handle", handle.toLowerCase())
    .maybeSingle();
  if (!profile) return { title: "Profile not found" };
  return {
    title: "@" + profile.handle + " - Linkt",
    description: (profile.display_name ?? profile.handle) + "s public bookmarks",
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { handle } = await params;
  const supabase = createAdminClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("handle", handle.toLowerCase())
    .maybeSingle();
  if (profileError || !profile) notFound();
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("id, title, url, is_public, created_at")
    .eq("user_id", (profile as Profile).id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });
  const safeBookmarks = (bookmarks as Pick<Bookmark, "id" | "title" | "url" | "is_public" | "created_at">[]) ?? [];
  return (
    <div className="min-h-screen" style={{ background: "var(--cream-100)" }}>
      <nav className="flex items-center justify-between px-8 py-5 max-w-3xl mx-auto">
        <a href="/" className="font-display text-xl" style={{ color: "var(--ink-900)", textDecoration: "none" }}>Linkt</a>
      </nav>
      <main className="max-w-3xl mx-auto px-8 pb-16">
        <div className="mb-10">
          <p className="font-mono text-xs mb-3 tracking-widest" style={{ color: "var(--ink-400)" }}>PUBLIC PROFILE</p>
          <h1 className="font-display text-5xl mb-2" style={{ color: "var(--ink-900)" }}>
            {(profile as Profile).display_name || "@" + (profile as Profile).handle}
          </h1>
          <p className="font-mono text-sm" style={{ color: "var(--moss-600)" }}>@{(profile as Profile).handle}</p>
        </div>
        {safeBookmarks.length === 0 ? (
          <div className="card p-10 text-center" style={{ borderStyle: "dashed", borderColor: "var(--ink-200)" }}>
            <p className="font-display text-lg" style={{ color: "var(--ink-600)" }}>No public bookmarks yet</p>
          </div>
        ) : (
          <>
            <p className="text-xs mb-5 font-mono" style={{ color: "var(--ink-400)" }}>
              {safeBookmarks.length} link{safeBookmarks.length !== 1 ? "s" : ""}
            </p>
            <div className="flex flex-col gap-3">
              {safeBookmarks.map((b) => {
                let domain = "";
                try { domain = new URL(b.url).hostname.replace(/^www\./, ""); } catch { domain = b.url; }
                return (
                  <a key={b.id} href={b.url} target="_blank" rel="noopener noreferrer" className="card p-4 flex items-start gap-4 group" style={{ textDecoration: "none" }}>
                    <div className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center mt-0.5" style={{ background: "var(--cream-200)", border: "1px solid var(--ink-100)" }}>
                      <img src={"https://www.google.com/s2/favicons?domain=" + domain + "&sz=32"} alt="" width={16} height={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm mb-0.5 group-hover:underline" style={{ color: "var(--ink-800)" }}>{b.title}</p>
                      <p className="font-mono text-xs truncate" style={{ color: "var(--ink-400)" }}>{domain}</p>
                    </div>
                    <span className="flex-shrink-0 text-sm mt-0.5" style={{ color: "var(--ink-300)" }}>-&gt;</span>
                  </a>
                );
              })}
            </div>
          </>
        )}
      </main>
      <footer className="border-t py-6 text-center text-xs font-mono" style={{ borderColor: "var(--ink-100)", color: "var(--ink-400)" }}>
        <a href="/" style={{ color: "inherit", textDecoration: "none" }}>Linkt</a> - Save your own links
      </footer>
    </div>
  );
}