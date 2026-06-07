import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { bookmarkSchema } from "@/lib/validations";
import type { BookmarkUpdate } from "@/types/database";

// PATCH /api/bookmarks/[id] — update a bookmark (owner only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const parsed = bookmarkSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const updates = Object.fromEntries(
    Object.entries(parsed.data).filter(([, value]) => value !== undefined)
  ) as Partial<BookmarkUpdate>;

  const bookmarksTable = supabase.from("bookmarks") as any;
  const { data, error } = await bookmarksTable
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id) // explicit ownership guard
    .select()
    .single();

  if (error) {
    console.error("[PATCH /api/bookmarks/:id]", error);
    // PGRST116 = no rows matched (either not found or not owned by user)
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update bookmark" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/bookmarks/[id] — delete a bookmark (owner only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // RLS policy + explicit user_id guard — neither alone is sufficient if the
  // other is misconfigured, so we keep both.
  const { error, count } = await supabase
    .from("bookmarks")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[DELETE /api/bookmarks/:id]", error);
    return NextResponse.json({ error: "Failed to delete bookmark" }, { status: 500 });
  }

  if (count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
