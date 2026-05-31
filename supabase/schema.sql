create table if not exists public.projects (
  id text primary key,
  title text not null,
  prompt text not null,
  preview jsonb not null,
  generations jsonb not null,
  current_generation_id text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index if not exists projects_updated_at_idx
  on public.projects (updated_at desc);
