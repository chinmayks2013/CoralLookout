-- 60-day sales sprint: cohorts, provenance, assignments, moderation, leads

-- Chapter cohort / region tagging (Puerto Rico pilot)
alter table public.school_chapters
  add column if not exists cohort text,
  add column if not exists region text;

create index if not exists school_chapters_cohort_idx
  on public.school_chapters (cohort)
  where cohort is not null;

create index if not exists school_chapters_region_idx
  on public.school_chapters (region)
  where region is not null;

-- Co-teachers / TAs
create table if not exists public.school_chapter_teachers (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.school_chapters (id) on delete cascade,
  user_id text not null,
  display_name text not null,
  email text,
  role text not null default 'co_teacher'
    check (role in ('owner', 'co_teacher', 'ta')),
  created_at timestamptz not null default now(),
  unique (chapter_id, user_id)
);

create index if not exists school_chapter_teachers_user_idx
  on public.school_chapter_teachers (user_id);

-- Assignments
create table if not exists public.school_assignments (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.school_chapters (id) on delete cascade,
  title text not null,
  description text,
  requires_scan boolean not null default true,
  requires_pin boolean not null default true,
  due_at timestamptz,
  created_by text not null,
  created_at timestamptz not null default now()
);

create index if not exists school_assignments_chapter_idx
  on public.school_assignments (chapter_id);

create table if not exists public.school_assignment_completions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.school_assignments (id) on delete cascade,
  user_id text not null,
  scan_id text,
  completed_at timestamptz not null default now(),
  unique (assignment_id, user_id)
);

-- Scan provenance + notes + verification
alter table public.user_scans
  add column if not exists chapter_id uuid references public.school_chapters (id) on delete set null,
  add column if not exists cohort text,
  add column if not exists region text,
  add column if not exists contributor_name text,
  add column if not exists model_version text,
  add column if not exists validation_score double precision,
  add column if not exists notes text,
  add column if not exists species_tags text[] default '{}',
  add column if not exists review_status text default 'none'
    check (review_status in ('none', 'needs_review', 'educator_verified')),
  add column if not exists observed_at timestamptz;

create index if not exists user_scans_chapter_idx on public.user_scans (chapter_id);
create index if not exists user_scans_cohort_idx on public.user_scans (cohort) where cohort is not null;
create index if not exists user_scans_region_idx on public.user_scans (region) where region is not null;

-- Gallery report / flag queue
create table if not exists public.gallery_flags (
  id uuid primary key default gen_random_uuid(),
  post_id text not null,
  reporter_user_id text,
  reporter_name text,
  reason text not null,
  status text not null default 'open'
    check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists gallery_flags_status_idx on public.gallery_flags (status);
create index if not exists gallery_flags_post_idx on public.gallery_flags (post_id);

-- Partner inquiry leads (CRM-lite)
create table if not exists public.partner_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  organization text,
  role text,
  interest text,
  message text,
  source text default 'community',
  created_at timestamptz not null default now()
);

-- RLS (API-layer auth; permissive like other school tables)
alter table public.school_chapter_teachers enable row level security;
alter table public.school_assignments enable row level security;
alter table public.school_assignment_completions enable row level security;
alter table public.gallery_flags enable row level security;
alter table public.partner_leads enable row level security;

create policy "school_chapter_teachers_all" on public.school_chapter_teachers
  for all using (true) with check (true);
create policy "school_assignments_all" on public.school_assignments
  for all using (true) with check (true);
create policy "school_assignment_completions_all" on public.school_assignment_completions
  for all using (true) with check (true);
create policy "gallery_flags_all" on public.gallery_flags
  for all using (true) with check (true);
create policy "partner_leads_all" on public.partner_leads
  for all using (true) with check (true);

notify pgrst, 'reload schema';
