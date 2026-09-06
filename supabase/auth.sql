-- ============================================================
-- 1. TABLES
-- ============================================================

-- Extends Supabase auth.users with app-specific profile data
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text unique not null,
  avatar_url text,
  created_at timestamptz default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric(10,2) not null default 0,
  created_at timestamptz default now()
);

-- A course has many chapters
create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position int not null default 0,
  created_at timestamptz default now()
);

-- A chapter has many lessons
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  title text not null,
  content text,
  position int not null default 0,
  created_at timestamptz default now()
);

-- Many-to-many join table between users and courses
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz default now(),
  unique (user_id, course_id) -- prevents duplicate enrollment in the same course
);

-- Tracks per-user completion status for each lesson
create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

-- Indexes for common lookup patterns (foreign key joins)
create index idx_chapters_course_id on public.chapters(course_id);
create index idx_lessons_chapter_id on public.lessons(chapter_id);
create index idx_enrollments_user_id on public.enrollments(user_id);
create index idx_enrollments_course_id on public.enrollments(course_id);
create index idx_lesson_progress_user_id on public.lesson_progress(user_id);


-- ============================================================
-- 2. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
-- Avatar is NOT synced from OAuth providers here — avatar_url stays
-- null until the user uploads their own photo (see storage section).
-- Only name and email are copied from auth.users metadata.

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'user_name'),
    new.email
  )
  on conflict (id) do update
    set name = excluded.name;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- security definer lets this trigger bypass RLS so the profile row
-- can be created immediately on signup, before the user has a session
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================================
alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.chapters enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;


-- ============================================================
-- 4. RLS POLICIES
-- ============================================================

-- USERS: a user can only read/update their own profile row
create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id);

-- No insert policy needed here — the trigger runs as security definer
-- and bypasses RLS when creating the initial profile row.

-- COURSES / CHAPTERS / LESSONS: public read access (catalogue is public)
-- No insert/update/delete policies — content is managed via seed
-- scripts or an admin role using the service role key, which bypasses RLS.
create policy "courses_select_all"
  on public.courses for select
  using (true);

create policy "chapters_select_all"
  on public.chapters for select
  using (true);

create policy "lessons_select_all"
  on public.lessons for select
  using (true);

-- ENROLLMENTS: users can only see, create, and remove their own enrollments
create policy "enrollments_select_own"
  on public.enrollments for select
  using (auth.uid() = user_id);

create policy "enrollments_insert_own"
  on public.enrollments for insert
  with check (auth.uid() = user_id);

create policy "enrollments_delete_own"
  on public.enrollments for delete
  using (auth.uid() = user_id);

-- LESSON PROGRESS: users can only see and update their own progress
create policy "lesson_progress_select_own"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

create policy "lesson_progress_insert_own"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "lesson_progress_update_own"
  on public.lesson_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ============================================================
-- 5. AVATAR STORAGE (manual upload only, no OAuth sync)
-- ============================================================

-- Public bucket so avatar images can be displayed without signed URLs
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Anyone can view avatars (needed to render other users' avatars, if ever shown)
create policy "avatar_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Users can only upload into a folder matching their own user id
-- Expected path format: avatars/{user_id}/filename.ext
create policy "avatar_upload_own"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatar_update_own"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatar_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );