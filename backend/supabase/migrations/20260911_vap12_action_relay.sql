-- VAP 1.2 central action relay + Vault tables.
-- Run through the Supabase SQL editor after reviewing RLS against your existing auth model.

create table if not exists public.vertex_pa_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  source_device_id uuid,
  target_device_id uuid,
  action_type text not null,
  payload jsonb not null default '{}'::jsonb,
  requires_confirmation boolean not null default true,
  status text not null default 'queued' check (status in ('queued','running','completed','failed','cancelled','awaiting_confirmation')),
  result jsonb not null default '{}'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  claimed_at timestamptz,
  completed_at timestamptz
);

create index if not exists vertex_pa_actions_user_status_idx on public.vertex_pa_actions(user_id,status,created_at desc);
create index if not exists vertex_pa_actions_target_status_idx on public.vertex_pa_actions(target_device_id,status,created_at);

create table if not exists public.vertex_pa_vault_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  category text not null default 'random ideas',
  title text not null,
  url text,
  source_type text,
  note text,
  page_text text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists vertex_pa_vault_items_user_created_idx on public.vertex_pa_vault_items(user_id,created_at desc);

alter table public.vertex_pa_actions enable row level security;
alter table public.vertex_pa_vault_items enable row level security;

-- The VAP device edge function uses the server-side service role and therefore does not rely on these policies.
-- Add authenticated-owner policies if these tables are exposed directly to a browser admin panel.
