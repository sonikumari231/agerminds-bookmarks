# Linkt — Personal Bookmarks App

A small "linktree meets pocket" app built for the agerMinds take-home task.
Save bookmarks (public or private), share a public profile at `/@yourhandle`.

**Live URL:** _(add after deploying to Vercel)_  
**GitHub:** _(add your repo URL)_

---

## Stack

- **Next.js 14** (App Router, Server Components, Route Handlers)
- **Supabase** — Postgres database + Row-Level Security + Auth
- **Resend** — transactional email (welcome + confirmation)
- **Vercel** — deployment
- **TypeScript** throughout

---

## Running locally

### 1. Clone and install

```bash
git clone <your-repo>
cd agerminds-bookmarks
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL Editor, paste and run the contents of `supabase/schema.sql`.
3. In **Authentication → Email Templates**, optionally disable the built-in
   confirmation email (we send our own via Resend).
4. In **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback`
   to the **Redirect URLs** list.

### 3. Set up Resend

1. Create a free account at [resend.com](https://resend.com).
2. Verify a sending domain (or use `onboarding@resend.dev` for testing).
3. Create an API key.

### 4. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=you@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

1. Push to GitHub.
2. Import the repo in [Vercel](https://vercel.com).
3. Add all the environment variables from `.env.local.example` to Vercel's
   **Environment Variables** settings, updating `NEXT_PUBLIC_APP_URL` to your
   production URL.
4. In Supabase **Authentication → URL Configuration**, add your Vercel URL +
   `/auth/callback` to the Redirect URLs list.

---

## Where the AI agent got it wrong (and how I caught it)

The agent initially generated the Supabase delete mutation without verifying
ownership server-side — it relied solely on RLS policies and used the anon key in
the route handler. The problem: if RLS was ever misconfigured or accidentally
disabled for a migration, **any authenticated user could delete any bookmark** by
guessing a UUID. I caught this during a manual code review pass, noticing the
absence of `.eq("user_id", user.id)` on the delete query. I added the explicit
ownership check (belt-and-suspenders: RLS + application-level guard) and added a
comment explaining the defence-in-depth rationale so future contributors understand
why both checks are intentional.

---

## Security model

- **Row-Level Security** is enabled on both `profiles` and `bookmarks` tables.
  Even if application code were bypassed, the DB rejects cross-user reads/writes.
- Every mutating API route calls `supabase.auth.getUser()` with the **server
  client** (reads the session from the cookie, never trusts a user-supplied JWT).
- Delete and update routes additionally assert `.eq("user_id", user.id)` for
  defence-in-depth.
- The public `/<handle>` page uses the admin (service role) client but **explicitly
  filters `is_public = true`** — private bookmarks are never returned, even if RLS
  were bypassed.
- Handles are validated server-side with Zod (`^[a-z0-9_]{3,30}$`) and enforced
  by a DB CHECK constraint and UNIQUE index.

---

## One thing I'd improve with more time

**Handle changing / profile settings page.** Right now the handle is set at
sign-up and can't be changed via the UI. I'd add a `/dashboard/settings` page
letting users update their handle and display name, with a proper DB transaction
to check uniqueness atomically before committing. I'd also add a redirect from
old handles (stored in a `handle_history` table) so existing shared links don't
break.

---

## Project structure

```
.
├── app/
│   ├── [handle]/          # Public profile page (no auth required)
│   ├── api/
│   │   ├── auth/signup/   # Sign-up endpoint (creates user + sends email)
│   │   └── bookmarks/     # CRUD endpoints (auth required)
│   │       └── [id]/
│   ├── auth/              # Login, signup, callback pages
│   ├── dashboard/         # Protected dashboard
│   └── globals.css
├── components/
│   ├── auth/              # SignOutButton
│   └── bookmarks/         # BookmarkList, BookmarkCard, BookmarkForm
├── lib/
│   ├── email.ts           # Resend integration
│   ├── supabase/          # Server + browser Supabase clients
│   └── validations.ts     # Zod schemas
├── middleware.ts           # Auth session refresh + route protection
├── supabase/
│   └── schema.sql         # Full DB schema + RLS policies
└── types/
    └── database.ts        # Generated TypeScript types
```
