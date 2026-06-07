import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase redirects here after the user clicks the email confirmation link.
 * The URL contains a `code` query param which we exchange for a session.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("[/auth/callback] exchangeCodeForSession error:", error);
  }

  // Something went wrong — send to login with an error flag
  return NextResponse.redirect(`${origin}/auth/login?error=confirmation_failed`);
}
