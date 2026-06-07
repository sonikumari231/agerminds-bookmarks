"use client";

import { useState } from "react";
import type { Bookmark, Profile } from "@/types/database";
import BookmarkCard from "./BookmarkCard";
import BookmarkForm from "./BookmarkForm";

interface Props {
  initialBookmarks: Bookmark[];
  profile: Profile | null;
  userId: string;
}

export default function BookmarkList({ initialBookmarks, profile, userId }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Bookmark | null>(null);

  function handleCreated(b: Bookmark) {
    setBookmarks((prev) => [b, ...prev]);
    setShowForm(false);
  }

  function handleUpdated(b: Bookmark) {
    setBookmarks((prev) => prev.map((x) => (x.id === b.id ? b : x)));
    setEditTarget(null);
  }

  function handleDeleted(id: string) {
    setBookmarks((prev) => prev.filter((x) => x.id !== id));
  }

  const publicCount = bookmarks.filter((b) => b.is_public).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl mb-1" style={{ color: "var(--ink-900)" }}>
            My shelf
          </h1>
          <p className="text-sm" style={{ color: "var(--ink-400)" }}>
            {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""} ·{" "}
            {publicCount} public
            {profile?.handle && (
              <>
                {" "}· public profile{" "}
                <a
                  href={`/${profile.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono"
                  style={{ color: "var(--moss-600)", textDecoration: "none" }}
                >
                  @{profile.handle}
                </a>
              </>
            )}
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { setShowForm(true); setEditTarget(null); }}
        >
          + Add bookmark
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="mb-6">
          <BookmarkForm
            onSuccess={handleCreated}
            onCancel={() => setShowForm(false)}
            userId={userId}
          />
        </div>
      )}

      {/* Empty state */}
      {bookmarks.length === 0 && !showForm && (
        <div
          className="card p-12 text-center"
          style={{ borderStyle: "dashed", borderColor: "var(--ink-200)" }}
        >
          <p className="text-3xl mb-3">📎</p>
          <p className="font-display text-lg mb-2" style={{ color: "var(--ink-700)" }}>
            Your shelf is empty
          </p>
          <p className="text-sm mb-5" style={{ color: "var(--ink-400)" }}>
            Save your first bookmark to get started.
          </p>
          <button className="btn-secondary" onClick={() => setShowForm(true)}>
            Add your first bookmark
          </button>
        </div>
      )}

      {/* Bookmark cards */}
      <div className="flex flex-col gap-3">
        {bookmarks.map((bookmark, i) =>
          editTarget?.id === bookmark.id ? (
            <div key={bookmark.id}>
              <BookmarkForm
                bookmark={bookmark}
                onSuccess={handleUpdated}
                onCancel={() => setEditTarget(null)}
                userId={userId}
              />
            </div>
          ) : (
            <div
              key={bookmark.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 30}ms`, animationFillMode: "both" }}
            >
              <BookmarkCard
                bookmark={bookmark}
                onEdit={() => { setEditTarget(bookmark); setShowForm(false); }}
                onDelete={() => handleDeleted(bookmark.id)}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}
