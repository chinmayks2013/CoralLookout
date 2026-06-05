-- Coral Lookout — shared Reef Gallery (run in Supabase SQL Editor)

create extension if not exists "pgcrypto";

create table if not exists public.gallery_posts (
  id uuid primary key default gen_random_uuid(),
  scan_id text not null,
  post_type text not null default 'scan' check (post_type in ('scan', 'discussion')),
  author_id text not null,
  author_name text not null,
  author_school text,
  image_url text,
  analysis jsonb,
  discussion_body text,
  location_name text not null,
  lat double precision,
  lng double precision,
  view_count integer not null default 0 check (view_count >= 0),
  image_rights_confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

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

create table if not exists public.gallery_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.gallery_posts (id) on delete cascade,
  author_id text not null,
  author_name text not null,
  body text not null check (char_length(body) <= 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.gallery_donations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.gallery_posts (id) on delete cascade,
  from_id text not null,
  from_name text not null,
  amount integer not null check (amount > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.gallery_upvotes (
  post_id uuid not null references public.gallery_posts (id) on delete cascade,
  user_id text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists gallery_posts_created_at_idx
  on public.gallery_posts (created_at desc);

create index if not exists gallery_comments_post_id_idx
  on public.gallery_comments (post_id);

create index if not exists gallery_post_views_post_id_idx
  on public.gallery_post_views (post_id);

create index if not exists gallery_posts_author_id_idx
  on public.gallery_posts (author_id);

alter table public.gallery_posts enable row level security;
alter table public.gallery_post_views enable row level security;
alter table public.gallery_creator_profiles enable row level security;
alter table public.gallery_comments enable row level security;
alter table public.gallery_donations enable row level security;
alter table public.gallery_upvotes enable row level security;

create policy "gallery_posts_select" on public.gallery_posts
  for select using (true);
create policy "gallery_posts_insert" on public.gallery_posts
  for insert with check (true);

create policy "gallery_comments_select" on public.gallery_comments
  for select using (true);
create policy "gallery_comments_insert" on public.gallery_comments
  for insert with check (true);
create policy "gallery_comments_delete" on public.gallery_comments
  for delete using (true);

create policy "gallery_donations_select" on public.gallery_donations
  for select using (true);
create policy "gallery_donations_insert" on public.gallery_donations
  for insert with check (true);

create policy "gallery_upvotes_select" on public.gallery_upvotes
  for select using (true);
create policy "gallery_upvotes_insert" on public.gallery_upvotes
  for insert with check (true);

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

-- Public bucket for reef scan images
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do update set public = true;

create policy "gallery_images_public_read"
  on storage.objects for select
  using (bucket_id = 'gallery');

create policy "gallery_images_insert"
  on storage.objects for insert
  with check (bucket_id = 'gallery');
