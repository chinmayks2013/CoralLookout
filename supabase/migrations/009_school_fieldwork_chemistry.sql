create table if not exists public.school_fieldwork (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.school_chapters (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  location text not null check (char_length(location) between 1 and 160),
  visit_at timestamptz not null,
  transportation text not null default '',
  group_size integer not null check (group_size between 1 and 1000),
  equipment text[] not null default '{}',
  safety_notes text not null default '',
  sample_label text not null default '',
  sampled_at timestamptz,
  water_temp_c numeric(5, 2) check (water_temp_c between -5 and 50),
  ph numeric(4, 2) check (ph between 0 and 14),
  salinity_ppt numeric(6, 2) check (salinity_ppt between 0 and 70),
  dissolved_oxygen_mg_l numeric(6, 2) check (dissolved_oxygen_mg_l between 0 and 50),
  nitrate_mg_l numeric(8, 3) check (nitrate_mg_l between 0 and 1000),
  phosphate_mg_l numeric(8, 3) check (phosphate_mg_l between 0 and 1000),
  alkalinity_mg_l_caco3 numeric(8, 2) check (alkalinity_mg_l_caco3 between 0 and 2000),
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists school_fieldwork_chapter_visit_idx
  on public.school_fieldwork (chapter_id, visit_at desc);

alter table public.school_fieldwork enable row level security;

create policy "school_fieldwork_all" on public.school_fieldwork
  for all using (true) with check (true);

notify pgrst, 'reload schema';