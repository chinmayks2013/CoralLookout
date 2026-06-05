-- Run in Supabase → SQL Editor (entire file), then wait ~1 min or restart API.

alter table public.gallery_posts
  add column if not exists view_count integer not null default 0 check (view_count >= 0);

alter table public.gallery_posts
  add column if not exists image_rights_confirmed boolean not null default false;

-- Refresh PostgREST schema cache (fixes "Could not find column in schema cache")
notify pgrst, 'reload schema';

create table if not exists public.gallery_post_views (
  post_id uuid not null references public.gallery_posts (id) on delete cascade,
  viewer_id text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, viewer_id)
);

create table if not exists public.gallery_creator_profiles (
  user_id text primary key,
  display_name text not null,
  school text,
  region text,
  bio text check (bio is null or char_length(bio) <= 500),
  tagline text check (tagline is null or char_length(tagline) <= 120),
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gallery_post_views_post_id_idx
  on public.gallery_post_views (post_id);

create index if not exists gallery_posts_author_id_idx
  on public.gallery_posts (author_id);

alter table public.gallery_post_views enable row level security;
alter table public.gallery_creator_profiles enable row level security;

create policy "gallery_post_views_select" on public.gallery_post_views
  for select using (true);
create policy "gallery_post_views_insert" on public.gallery_post_views
  for insert with check (true);

create policy "gallery_creator_profiles_select" on public.gallery_creator_profiles
  for select using (true);
create policy "gallery_creator_profiles_insert" on public.gallery_creator_profiles
  for insert with check (true);
create policy "gallery_creator_profiles_update" on public.gallery_creator_profiles
  for update using (true);
