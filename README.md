# Tattvera Course Platform

A course platform built for the Tattvera Technologies Full Stack Developer Intern take-home assessment. Users can browse courses, log in with GitHub, enroll, and track lesson progress from a personal dashboard.

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling/UI:** Tailwind CSS + shadcn/ui
- **Backend:** Next.js API routes (Node.js) — all database access goes through these, never directly from UI components
- **Database & Auth:** Supabase (Postgres, Row Level Security, GitHub OAuth)
- **Validation:** Zod
- **Deployment:** Vercel

## Features

- GitHub OAuth login (`/login`), with session handled via cookies (`@supabase/ssr`)
- Middleware-protected routes: `/dashboard` and `/courses/[id]/lessons/[lessonId]`
- Server-rendered public course catalogue (`/courses`)
- Course detail page (`/courses/[id]`) with Enroll / Continue learning / Log in to enroll states
- Student dashboard (`/dashboard`) showing enrolled courses with a lessons-complete progress bar
- Lesson viewer with a "Mark as complete" toggle, enforced server-side against actual enrollment (not just login status)
- Row Level Security on every table — a user can only read/write their own enrollments and progress

## Project Structure

```
app/
  api/
    courses/route.ts              GET all courses
    courses/[id]/route.ts         GET one course + enrollment status
    enroll/route.ts               POST enroll in a course
    lessons/[lessonId]/route.ts   GET one lesson (enrollment-gated)
    lessons/complete/route.ts     POST toggle lesson completion
  courses/
    page.tsx                      Public course catalogue
    [id]/page.tsx                 Course detail page
    [id]/lessons/[lessonId]/page.tsx   Lesson viewer
  dashboard/page.tsx               Enrolled courses + progress
  login/page.tsx                   GitHub login
  api/auth/callback/route.ts       OAuth code exchange
components/
  enroll-button.tsx                Enroll / Continue / Log-in-to-enroll
  mark-complete-button.tsx         Lesson completion toggle
lib/
  supabase/server.ts                Server Supabase client
  get-base-url.ts                   Absolute URL helper for server-side fetches to our own API
supabase/
  schema.sql                        Tables, RLS policies, triggers, storage bucket
  seed.sql                          Dummy courses/chapters/lessons for testing
middleware.ts                       Route protection + session refresh
```

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/tattvera-course-platform.git
cd tattvera-course-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in the values — see the table below for where each one comes from.

| Variable                                      | Where to get it                                                        |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                    | Supabase Dashboard → Project Settings → API                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`               | Supabase Dashboard → Project Settings → API                            |
| `SUPABASE_SERVICE_ROLE_KEY`                   | Supabase Dashboard → Project Settings → API (keep secret, server-only) |
| `NEXT_PUBLIC_SITE_URL`                        | Your deployed URL (optional locally)                                   |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard, test mode (bonus)                                    |
| `ARCJET_KEY`                                  | Arcjet Dashboard (bonus)                                               |

### 4. Set up the database

In the Supabase SQL editor, run in order:

1. `supabase/schema.sql` — tables, RLS policies, the profile-creation trigger, avatar storage bucket
2. `supabase/seed.sql` — dummy courses so `/courses` isn't empty

### 5. Enable GitHub OAuth

- Supabase Dashboard → Authentication → Providers → GitHub → enable it, copy the callback URL it shows you
- Create a GitHub OAuth App (GitHub → Settings → Developer settings → OAuth Apps) and paste that callback URL into "Authorization callback URL"
- Paste the GitHub Client ID and Client Secret back into the Supabase GitHub provider settings

### 6. Run the dev server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Architecture Notes

- **DAL pattern:** every page and component that needs data or auth calls one of our own `/api/...` routes rather than querying Supabase directly. Supabase access is kept in API routes and the session-refresh proxy.
- **Server-only Supabase client:** `lib/supabase/server.ts` is used by API routes, the OAuth callback, and the session-refresh proxy. UI code never imports Supabase clients.
- **Enrollment is enforced twice:** middleware blocks unauthenticated access to protected routes, and the lesson API route additionally checks for an actual `enrollments` row — being logged in isn't enough to view lesson content you haven't enrolled in.
- **RLS as a second line of defense:** even if an API route had a bug, Postgres Row Level Security policies mean a user's queries are scoped to `auth.uid()` at the database level.

## Known Limitations

- Lesson progress is a simple boolean per lesson, not partial/video-position tracking.
- Course, chapter, and lesson content is seeded manually via SQL — there's no admin UI to create/edit courses.
- [Add anything else you mocked or skipped due to time constraints.]

## Bonus: Security (Arcjet)

Given time constraints, Arcjet was not integrated in code. In production, I would add it to `/api/enroll` and the GitHub OAuth callback using `tokenBucket` for rate limiting and `shield` for bot/attack protection, configured via the `ARCJET_KEY` env var.

## Loom Walkthrough

[Link to your 5–10 minute demo video]

## Live Preview

[Link to Vercel deployment]
