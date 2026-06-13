-- User reef scans — persisted per authenticated account
create table if not exists public.user_scans (
  id uuid primary key default gen_random_uuid(),
  scan_id text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  location_name text not null,
  lat double precision not null,
  lng double precision not null,
  health text not null,
  label text not null,
  confidence double precision not null,
  analysis jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists user_scans_user_id_idx on public.user_scans (user_id);
create index if not exists user_scans_created_at_idx on public.user_scans (created_at desc);

alter table public.user_scans enable row level security;

create policy "Users read own scans"
  on public.user_scans for select
  using (auth.uid() = user_id);

create policy "Users insert own scans"
  on public.user_scans for insert
  with check (auth.uid() = user_id);

create policy "Users delete own scans"
  on public.user_scans for delete
  using (auth.uid() = user_id);
