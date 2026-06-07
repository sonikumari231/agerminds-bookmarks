import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { bookmarkSchema } from "@/lib/validations";

// GET /api/bookmarks — list the current user's bookmarks
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id) // RLS also enforces this — belt + suspenders
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/bookmarks]", error);
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/bookmarks — create a new bookmark
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bookmarkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("[POST /api/bookmarks]", error);
    return NextResponse.json({ error: "Failed to create bookmark" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
