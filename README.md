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
- Route-protection via `proxy.ts` (Next.js 16's renamed `middleware.ts`): unauthenticated users are redirected to `/login` when hitting `/dashboard` or `/courses/[id]/lessons/[lessonId]`
- Server-rendered public course catalogue (`/courses`) — title, description, price
- Course detail page (`/courses/[id]`) with Enroll / Continue learning / Log in to enroll states
- Student dashboard (`/dashboard`) showing enrolled courses with a lessons-complete progress indicator (e.g. "3 of 8 lessons complete")
- Lesson viewer (`/courses/[id]/lessons/[lessonId]`) with a "Mark as complete" toggle, enforced server-side against actual enrollment (not just login status)
- Profile page (`/profile`) — view/edit display name and bio, backed by a `users` row auto-created on signup via a Postgres trigger
- Row Level Security on every table — a user can only read/write their own enrollments, progress, and profile

## Project Structure

```
app/
  api/
    auth/
      callback/route.ts           OAuth code exchange
      session/route.ts            Current session lookup
      sign-in/route.ts            Start GitHub OAuth flow
      sign-out/route.ts           Clear session
    courses/route.ts              GET all courses
    courses/[id]/route.ts         GET one course + enrollment status
    dashboard/route.ts            GET enrolled courses + progress for the dashboard
    enroll/route.ts               POST enroll in a course
    lessons/[lessonId]/route.ts   GET one lesson (enrollment-gated)
    lessons/complete/route.ts     POST toggle lesson completion
    profile/route.ts              GET/PATCH the logged-in user's profile
  courses/
    page.tsx                      Public course catalogue
    [id]/page.tsx                 Course detail page
    [id]/lessons/[lessonId]/page.tsx   Lesson viewer
  dashboard/page.tsx               Enrolled courses + progress
  login/page.tsx                   GitHub login
  profile/page.tsx                 Profile view/edit
components/
  course-catalog.tsx               Course grid used by /courses
  enroll-button.tsx                Enroll / Continue / Log-in-to-enroll
  mark-complete-button.tsx         Lesson completion toggle
  profile/profile-form.tsx         Profile edit form
  auth/sign-out-button.tsx         Sign-out trigger
  layout/header.tsx, footer.tsx    Shared layout chrome
lib/
  supabase/server.ts                Server Supabase client
  get-base-url.ts                   Absolute URL helper for server-side fetches to our own API
proxy.ts                            Route protection + session refresh (Next.js 16 rename of middleware.ts)
```

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/soumydip/tattvera-course-platform
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

| Variable                        | Where to get it                                             |
| -------------------------------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase Dashboard → Project Settings → API                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API                  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase Dashboard → Project Settings → API (keep secret, server-only) |

### 4. Set up the database

Run the SQL in `supabase/auth.sql` (tables, RLS policies, the `handle_new_user` trigger, and the avatars storage bucket) followed by `supabase/course.sql` (seed courses/chapters/lessons) against your Supabase project, via the SQL editor or CLI migrations.

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
- **Enrollment is enforced twice:** `proxy.ts` blocks unauthenticated access to protected routes, and the lesson API route additionally checks for an actual `enrollments` row — being logged in isn't enough to view lesson content you haven't enrolled in.
- **RLS as a second line of defense:** even if an API route had a bug, Postgres Row Level Security policies mean a user's queries are scoped to `auth.uid()` at the database level.

## Known Limitations

- Lesson progress is a simple boolean per lesson, not partial/video-position tracking.
- Course, chapter, and lesson content is seeded manually via SQL — there's no admin UI to create/edit courses.
- **Bonus A (Stripe checkout) was not implemented** due to time constraints — enrollment is currently free/instant via `POST /api/enroll`. In production, I'd add a Stripe Checkout session on that route and a `/api/webhooks/stripe` handler listening for `checkout.session.completed` to create the `enrollments` row after payment, instead of creating it directly on click.

## Bonus B: Security (Arcjet)

Given time constraints, Arcjet was not integrated in code. In production, I would add it to `/api/enroll` and the GitHub OAuth callback using `tokenBucket` for rate limiting and `shield` for bot/attack protection, configured via an `ARCJET_KEY` env var.

## Loom Walkthrough

[link to Loom video](https://www.loom.com/share/47b5f4e64fa64f7bb3233573fe947bd3)

## Live Preview

[Link to Vercel deployment](https://tattvera-course-platform-seven.vercel.app/)