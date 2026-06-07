-- ============================================================
-- SCHEMA: agerminds bookmarks app
-- Run this in Supabase SQL Editor to set up your database.
-- ============================================================

-- ── profiles ──────────────────────────────────────────────
-- Extends auth.users with a unique @handle and display name.
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  handle      TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT handle_format CHECK (handle ~ '^[a-z0-9_]{3,30}$')
);

-- ── bookmarks ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  url         TEXT NOT NULL,
  is_public   BOOLEAN DEFAULT false NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT title_length CHECK (char_length(title) BETWEEN 1 AND 200),
  CONSTRAINT url_length   CHECK (char_length(url)   BETWEEN 1 AND 2048)
);

-- ── indexes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS bookmarks_public_idx  ON public.bookmarks(user_id) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS profiles_handle_idx   ON public.profiles(handle);

-- ── updated_at trigger ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER bookmarks_updated_at
  BEFORE UPDATE ON public.bookmarks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── auto-create profile on sign-up ────────────────────────
-- Generates a handle from the email prefix (sanitised), falling
-- back to a random suffix if the handle is already taken.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  base_handle TEXT;
  candidate   TEXT;
  counter     INT := 0;
BEGIN
  -- Derive a handle from the email local-part, keep only [a-z0-9_]
  base_handle := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9_]', '_', 'g'));
  -- Ensure minimum length
  IF char_length(base_handle) < 3 THEN
    base_handle := base_handle || '_usr';
  END IF;
  -- Truncate to 25 chars so suffix fits within 30
  base_handle := left(base_handle, 25);

  candidate := base_handle;
  LOOP
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE handle = candidate);
    counter   := counter + 1;
    candidate := base_handle || counter::TEXT;
  END LOOP;

  INSERT INTO public.profiles (id, handle, display_name)
  VALUES (NEW.id, candidate, split_part(NEW.email, '@', 1));

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Row-Level Security ────────────────────────────────────
ALTER TABLE public.profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- profiles: anyone can read (needed for public /<handle> pages)
CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT
  USING (true);

-- profiles: only the owner can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- bookmarks: owners can do everything with their own rows
CREATE POLICY "bookmarks_owner_all"
  ON public.bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- bookmarks: anonymous / other users can only read public ones
CREATE POLICY "bookmarks_public_select"
  ON public.bookmarks FOR SELECT
  USING (is_public = true);

-- ── Done ──────────────────────────────────────────────────
-- Verify with:
--   SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname = 'public';
