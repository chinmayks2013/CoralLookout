-- School Chapter subscriptions (teacher dashboard)

create table if not exists public.school_chapters (
  id uuid primary key default gen_random_uuid(),
  teacher_user_id text not null unique,
  teacher_name text not null,
  teacher_email text not null,
  school_name text not null,
  join_code text not null unique,
  branding_tagline text,
  branding_accent text not null default 'cyan',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text not null default 'inactive'
    check (subscription_status in ('inactive', 'active', 'past_due', 'canceled', 'trialing')),
  subscription_current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.school_roster (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.school_chapters (id) on delete cascade,
  user_id text,
  display_name text not null,
  email text,
  status text not null default 'pending'
    check (status in ('pending', 'active')),
  joined_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists school_roster_chapter_user_idx
  on public.school_roster (chapter_id, user_id)
  where user_id is not null;

create index if not exists school_roster_chapter_id_idx
  on public.school_roster (chapter_id);

create index if not exists school_roster_user_id_idx
  on public.school_roster (user_id);

create index if not exists school_chapters_join_code_idx
  on public.school_chapters (join_code);

alter table public.school_chapters enable row level security;
alter table public.school_roster enable row level security;

create policy "school_chapters_select" on public.school_chapters
  for select using (true);
create policy "school_chapters_insert" on public.school_chapters
  for insert with check (true);
create policy "school_chapters_update" on public.school_chapters
  for update using (true);

create policy "school_roster_select" on public.school_roster
  for select using (true);
create policy "school_roster_insert" on public.school_roster
  for insert with check (true);
create policy "school_roster_update" on public.school_roster
  for update using (true);
create policy "school_roster_delete" on public.school_roster
  for delete using (true);

notify pgrst, 'reload schema';
