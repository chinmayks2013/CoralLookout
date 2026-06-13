-- Reef Academy video guide progress & certificates

create table if not exists public.academy_learners (
  user_id text primary key,
  display_name text not null,
  email text,
  school text,
  certificate_code text unique,
  certificate_issued_at timestamptz,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academy_module_progress (
  user_id text not null references public.academy_learners (user_id) on delete cascade,
  module_id text not null,
  video_watched boolean not null default false,
  video_watched_at timestamptz,
  quiz_score numeric(4, 3) check (quiz_score is null or (quiz_score >= 0 and quiz_score <= 1)),
  quiz_passed boolean not null default false,
  quiz_attempted_at timestamptz,
  completed_at timestamptz,
  primary key (user_id, module_id)
);

create index if not exists academy_module_progress_user_id_idx
  on public.academy_module_progress (user_id);

create index if not exists academy_learners_last_activity_idx
  on public.academy_learners (last_activity_at desc);

alter table public.academy_learners enable row level security;
alter table public.academy_module_progress enable row level security;

drop policy if exists academy_learners_service_all on public.academy_learners;
drop policy if exists academy_module_progress_service_all on public.academy_module_progress;

create policy academy_learners_service_all
  on public.academy_learners for all
  using (true)
  with check (true);

create policy academy_module_progress_service_all
  on public.academy_module_progress for all
  using (true)
  with check (true);

notify pgrst, 'reload schema';
