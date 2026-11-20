create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  member_code text not null unique,
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  phone text not null unique,
  email text,
  is_active boolean not null default true,
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists memberships_created_at_idx
  on public.memberships (created_at desc);

alter table public.memberships enable row level security;

drop policy if exists "memberships_admin_read" on public.memberships;
create policy "memberships_admin_read"
  on public.memberships for select to authenticated
  using (public.get_my_role() = 'admin');

revoke all on public.memberships from anon, authenticated;
