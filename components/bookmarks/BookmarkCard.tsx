"use client";

import { useState } from "react";
import type { Bookmark } from "@/types/database";

interface Props {
  bookmark: Bookmark;
  onEdit: () => void;
  onDelete: () => void;
}

export default function BookmarkCard({ bookmark, onEdit, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onDelete();
      } else {
        console.error("Delete failed", await res.text());
      }
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  // Extract domain for display
  let domain = "";
  try {
    domain = new URL(bookmark.url).hostname.replace(/^www\./, "");
  } catch {
    domain = bookmark.url;
  }

  return (
    <div
      className="card p-4 flex items-start gap-4 group"
      style={{ transition: "box-shadow 0.15s" }}
      onMouseLeave={() => setConfirmDelete(false)}
    >
      {/* Favicon */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center mt-0.5"
        style={{ background: "var(--cream-200)", border: "1px solid var(--ink-100)" }}
      >
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
          alt=""
          width={16}
          height={16}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-sm truncate hover:underline"
            style={{ color: "var(--ink-800)", textDecoration: "none" }}
          >
            {bookmark.title}
          </a>
          <span className={`badge ${bookmark.is_public ? "badge-public" : "badge-private"}`}>
            {bookmark.is_public ? "Public" : "Private"}
          </span>
        </div>
        <p className="font-mono text-xs truncate" style={{ color: "var(--ink-400)" }}>
          {domain}
        </p>
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100"
        style={{ transition: "opacity 0.15s" }}
      >
        <button
          onClick={onEdit}
          className="btn-ghost text-xs"
          style={{ padding: "4px 8px" }}
          title="Edit"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn-ghost text-xs"
          style={{
            padding: "4px 8px",
            color: confirmDelete ? "var(--rust-500)" : undefined,
            background: confirmDelete ? "#fde8e0" : undefined,
          }}
          title={confirmDelete ? "Click again to confirm deletion" : "Delete"}
        >
          {deleting ? "…" : confirmDelete ? "Confirm?" : "Delete"}
        </button>
      </div>
    </div>
  );
}
