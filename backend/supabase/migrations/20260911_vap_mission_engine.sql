create table if not exists public.vertex_pa_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  source_device_id uuid,
  title text not null,
  goal text not null,
  status text not null default 'planning' check (status in ('planning','ready','running','awaiting_confirmation','completed','failed','cancelled')),
  mode text not null default 'execute',
  current_step integer not null default 0,
  progress numeric(5,2) not null default 0,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists vertex_pa_missions_user_status_idx on public.vertex_pa_missions(user_id,status,updated_at desc);

create table if not exists public.vertex_pa_mission_steps (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.vertex_pa_missions(id) on delete cascade,
  step_index integer not null,
  title text not null,
  action_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','running','awaiting_confirmation','completed','failed','skipped')),
  action_id uuid,
  result jsonb not null default '{}'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(mission_id,step_index)
);
create index if not exists vertex_pa_mission_steps_status_idx on public.vertex_pa_mission_steps(mission_id,status,step_index);

alter table public.vertex_pa_missions enable row level security;
alter table public.vertex_pa_mission_steps enable row level security;
