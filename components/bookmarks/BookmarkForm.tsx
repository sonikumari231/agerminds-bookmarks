"use client";

import { useState, useEffect } from "react";
import type { Bookmark } from "@/types/database";

interface Props {
  bookmark?: Bookmark; // if present, we're editing
  userId: string;
  onSuccess: (b: Bookmark) => void;
  onCancel: () => void;
}

type FieldErrors = { title?: string[]; url?: string[]; root?: string[] };

export default function BookmarkForm({ bookmark, userId, onSuccess, onCancel }: Props) {
  const isEditing = !!bookmark;

  const [values, setValues] = useState({
    title: bookmark?.title ?? "",
    url: bookmark?.url ?? "",
    is_public: bookmark?.is_public ?? false,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  // Auto-fill title by fetching page title (best-effort, via a simple approach)
  async function autoFillTitle() {
    if (values.title || !values.url) return;
    try {
      const url = new URL(values.url);
      const domain = url.hostname.replace(/^www\./, "");
      setValues((v) => ({ ...v, title: domain }));
    } catch {
      // ignore invalid URL
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const method = isEditing ? "PATCH" : "POST";
      const endpoint = isEditing
        ? `/api/bookmarks/${bookmark!.id}`
        : "/api/bookmarks";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.issues) {
          setErrors(data.issues);
        } else {
          setErrors({ root: [data.error ?? "Something went wrong"] });
        }
        return;
      }

      onSuccess(data as Bookmark);
    } catch {
      setErrors({ root: ["Network error — please try again"] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="card p-5"
      style={{ borderColor: "var(--moss-400)", borderWidth: 1.5 }}
    >
      <h3 className="font-medium mb-4" style={{ color: "var(--ink-800)" }}>
        {isEditing ? "Edit bookmark" : "New bookmark"}
      </h3>

      {errors.root && (
        <div
          className="mb-3 p-2 rounded text-xs"
          style={{ background: "#fde8e0", color: "var(--rust-600)" }}
        >
          {errors.root[0]}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink-600)" }}>
            URL
          </label>
          <input
            type="url"
            className="input-base"
            placeholder="https://example.com"
            value={values.url}
            onChange={set("url")}
            onBlur={autoFillTitle}
            required
          />
          {errors.url && <p className="error-text">{errors.url[0]}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink-600)" }}>
            Title
          </label>
          <input
            type="text"
            className="input-base"
            placeholder="Bookmark title"
            value={values.title}
            onChange={set("title")}
            required
          />
          {errors.title && <p className="error-text">{errors.title[0]}</p>}
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={values.is_public}
              onChange={(e) =>
                setValues((v) => ({ ...v, is_public: e.target.checked }))
              }
            />
            <div
              className="w-9 h-5 rounded-full transition-colors"
              style={{
                background: values.is_public ? "var(--moss-500)" : "var(--ink-200)",
              }}
            />
            <div
              className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm"
              style={{
                transform: values.is_public ? "translateX(16px)" : "translateX(0)",
              }}
            />
          </div>
          <span className="text-sm" style={{ color: "var(--ink-600)" }}>
            {values.is_public ? "Public — visible on your profile" : "Private — only you can see this"}
          </span>
        </label>

        <div className="flex items-center gap-2 pt-1">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving…" : isEditing ? "Save changes" : "Add bookmark"}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
