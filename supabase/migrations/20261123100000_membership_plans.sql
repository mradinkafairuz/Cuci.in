create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code in ('hemat', 'prioritas')),
  name text not null check (char_length(trim(name)) between 2 and 60),
  description text not null check (char_length(trim(description)) between 2 and 350),
  monthly_price integer not null check (monthly_price between 1 and 100000000),
  discount_percent integer not null default 0 check (discount_percent between 0 and 100),
  priority_queue boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.membership_plans (code, name, description, monthly_price, discount_percent, priority_queue)
values
  ('hemat', 'Hemat', 'Pilihan praktis untuk mendapatkan potongan harga setiap bulan.', 15000, 5, false),
  ('prioritas', 'Prioritas', 'Diskon lebih besar dan antrean layanan yang diprioritaskan.', 30000, 10, true)
on conflict (code) do nothing;

alter table public.membership_plans enable row level security;

drop policy if exists "membership_plans_admin_read" on public.membership_plans;
create policy "membership_plans_admin_read"
  on public.membership_plans for select to authenticated
  using (public.get_my_role() = 'admin');

revoke all on public.membership_plans from anon, authenticated;
