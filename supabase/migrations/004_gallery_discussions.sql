-- Discussion / text posts in the reef forum

alter table public.gallery_posts
  add column if not exists post_type text not null default 'scan';

alter table public.gallery_posts
  add column if not exists discussion_body text;

alter table public.gallery_posts
  alter column image_url drop not null;

alter table public.gallery_posts
  alter column analysis drop not null;

alter table public.gallery_posts
  alter column lat drop not null;

alter table public.gallery_posts
  alter column lng drop not null;

alter table public.gallery_posts
  drop constraint if exists gallery_posts_post_type_check;

alter table public.gallery_posts
  add constraint gallery_posts_post_type_check
  check (post_type in ('scan', 'discussion'));

notify pgrst, 'reload schema';
