import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BookmarkList from "@/components/bookmarks/BookmarkList";
import type { Bookmark, Profile } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // Fetch bookmarks — RLS ensures only this user's rows come back
  const { data: bookmarks, error: bookmarksError } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (bookmarksError) {
    console.error("[dashboard] fetch bookmarks:", bookmarksError);
  }

  return (
    <BookmarkList
      initialBookmarks={(bookmarks as Bookmark[]) ?? []}
      profile={profile as Profile}
      userId={user.id}
    />
  );
}
