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
  status text not null default 'MENUNGGU'
    check (status in ('MENUNGGU', 'DISETUJUI', 'DIKEMBALIKAN', 'DITOLAK')),
  created_at timestamptz not null default now(),
  check (return_date >= start_date)
);

create index if not exists equipment_loans_status_created_idx
  on public.equipment_loans (status, created_at desc);

alter table public.equipment_loans enable row level security;

drop policy if exists "equipment_loans_staff_read" on public.equipment_loans;
drop policy if exists "equipment_loans_admin_update" on public.equipment_loans;
drop policy if exists "equipment_loans_admin_read" on public.equipment_loans;
drop policy if exists "equipment_loans_admin_all" on public.equipment_loans;

create policy "equipment_loans_admin_read"
  on public.equipment_loans for select to authenticated
  using (public.get_my_role() = 'admin');
create policy "equipment_loans_admin_update"
  on public.equipment_loans for update to authenticated
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

insert into public.b2b_equipment (name, description, price, quantity_available, is_active)
select seed.name, seed.description, null, 0, true
from (values
  ('Mesin cuci', 'Mesin cuci untuk kebutuhan laundry harian.'),
  ('Setrika uap', 'Setrika uap untuk hasil rapi dan cepat.'),
  ('Mesin pengering', 'Pengering pakaian berkapasitas besar.'),
  ('Timbangan digital', 'Menimbang cucian dengan presisi.'),
  ('Keranjang laundry', 'Keranjang untuk mengangkut cucian.'),
  ('Vacuum cleaner', 'Pembersih debu untuk area kerja laundry.')
) as seed(name, description)
where not exists (
  select 1
  from public.b2b_equipment equipment
  where lower(equipment.name) = lower(seed.name)
);

create or replace function public.admin_dashboard_metrics(p_start timestamptz, p_end timestamptz)
returns table (paid_revenue numeric, total_orders bigint, used_today_kg numeric, pending_approval_count bigint)
language sql
stable
set search_path = ''
as $$
  select
    coalesce(sum(orders.total_price) filter (where orders.payment_status = 'PAID'), 0),
    count(*),
    coalesce(sum(orders.weight_kg) filter (
      where orders.order_type = 'KILOAN'
        and orders.process_status <> 'DIBATALKAN'
        and orders.archived_at is null
        and orders.created_at >= p_start
        and orders.created_at < p_end
    ), 0),
    count(*) filter (
      where orders.archived_at is null
        and orders.capacity_approval_status = 'PENDING'
    )
  from public.orders
$$;

revoke all on function public.admin_dashboard_metrics(timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function public.admin_dashboard_metrics(timestamptz, timestamptz)
  to service_role;

create index if not exists orders_active_created_at_idx
  on public.orders (created_at desc)
  where archived_at is null;
create index if not exists orders_pending_capacity_idx
  on public.orders (created_at desc)
  where archived_at is null and capacity_approval_status = 'PENDING';

revoke update on table public.orders from authenticated;
grant update (process_status, payment_status, weight_kg, total_price, paid_at)
  on table public.orders to authenticated;
