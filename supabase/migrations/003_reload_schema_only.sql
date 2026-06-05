-- If you already added columns but still see "schema cache" errors, run this:

alter table public.gallery_posts
  add column if not exists view_count integer not null default 0 check (view_count >= 0);

alter table public.gallery_posts
  add column if not exists image_rights_confirmed boolean not null default false;

notify pgrst, 'reload schema';
