import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen" style={{ background: "var(--cream-100)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-5xl mx-auto">
        <span className="font-display text-2xl" style={{ color: "var(--ink-900)" }}>
          Linkt
        </span>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="btn-ghost">Sign in</Link>
          <Link href="/auth/signup" className="btn-primary">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-8 pt-24 pb-16 text-center">
        <p
          className="font-mono text-xs mb-6 tracking-widest uppercase"
          style={{ color: "var(--moss-500)" }}
        >
          Personal · Private · Public
        </p>
        <h1
          className="font-display text-6xl leading-none mb-6"
          style={{ color: "var(--ink-900)" }}
        >
          Your links,{" "}
          <em style={{ color: "var(--moss-500)" }}>organised.</em>
        </h1>
        <p
          className="text-lg max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ color: "var(--ink-500)" }}
        >
          A quiet place to save what matters. Keep some bookmarks private, share others
          publicly under your own{" "}
          <span className="font-mono" style={{ color: "var(--ink-700)" }}>@handle</span>.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/auth/signup" className="btn-primary" style={{ fontSize: 15, padding: "12px 28px" }}>
            Create your shelf →
          </Link>
          <Link href="/auth/login" className="btn-secondary">
            Sign in
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-4xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: "🔒",
              title: "Truly private",
              body: "Private bookmarks are yours alone. Protected server-side — not just hidden in the UI.",
            },
            {
              icon: "🌐",
              title: "Public profile",
              body: "Curate a shareable page of your best links under your own @handle.",
            },
            {
              icon: "📚",
              title: "Your shelf",
              body: "Add, edit, and delete bookmarks with a title, URL, and a public/private toggle.",
            },
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3
                className="font-display text-lg mb-2"
                style={{ color: "var(--ink-800)" }}
              >
                {f.title}
              </h3>
              <p className="text-sm" style={{ color: "var(--ink-500)", lineHeight: 1.6 }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t py-6 text-center text-xs font-mono"
        style={{ borderColor: "var(--ink-100)", color: "var(--ink-400)" }}
      >
        Linkt · Built for agerMinds take-home task
      </footer>
    </main>
  );
}
