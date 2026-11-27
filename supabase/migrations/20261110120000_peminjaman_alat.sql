create table if not exists public.equipment_loans (
  id uuid primary key default gen_random_uuid(),
  borrower_name text not null check (char_length(btrim(borrower_name)) between 2 and 120),
  phone text not null,
  equipment_slug text not null,
  equipment_name text not null,
  quantity integer not null default 1 check (quantity between 1 and 10),
  start_date date not null,
  return_date date not null,
  notes text,
  status text not null default 'MENUNGGU' check (status in ('MENUNGGU', 'DISETUJUI', 'DIKEMBALIKAN', 'DITOLAK')),
  created_at timestamptz not null default now(),
  check (return_date >= start_date)
);

create index if not exists equipment_loans_status_created_idx
  on public.equipment_loans (status, created_at desc);

alter table public.equipment_loans enable row level security;
-- Public requests go through the server-only API using the Supabase secret key.
-- Staff policies allow authenticated dashboard access if direct access is added later.
create policy "equipment_loans_staff_read"
  on public.equipment_loans for select to authenticated
  using (public.get_my_role() in ('admin', 'petugas'));
create policy "equipment_loans_admin_update"
  on public.equipment_loans for update to authenticated
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');
