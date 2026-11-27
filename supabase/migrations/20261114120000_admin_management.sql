alter type public.process_status add value if not exists 'MENUNGGU';
alter type public.process_status add value if not exists 'DICUCI';
alter type public.process_status add value if not exists 'DISETRIKA';
alter type public.process_status add value if not exists 'DIBATALKAN';

alter table public.orders
  alter column service_id drop not null,
  add column if not exists order_type text not null default 'KILOAN',
  add column if not exists service_price_per_kg numeric(12, 2),
  add column if not exists capacity_approval_status text not null default 'NOT_REQUIRED',
  add column if not exists archived_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_order_type_check'
  ) then
    alter table public.orders
      add constraint orders_order_type_check check (order_type in ('KILOAN', 'SATUAN'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'orders_capacity_approval_status_check'
  ) then
    alter table public.orders
      add constraint orders_capacity_approval_status_check
      check (capacity_approval_status in ('NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED'));
  end if;
end;
$$;

create table if not exists public.laundry_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  price numeric(12, 2) not null check (price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  item_id uuid references public.laundry_items (id) on delete set null,
  item_name text not null,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.business_settings (
  id integer primary key check (id = 1),
  daily_capacity_kg numeric(10, 2) not null default 100 check (daily_capacity_kg > 0),
  is_accepting_orders boolean not null default true,
  business_hours jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.business_settings (id, daily_capacity_kg, is_accepting_orders, business_hours)
values (
  1,
  100,
  true,
  '{
    "monday": {"open": "07:00", "close": "20:00", "closed": false},
    "tuesday": {"open": "07:00", "close": "20:00", "closed": false},
    "wednesday": {"open": "07:00", "close": "20:00", "closed": false},
    "thursday": {"open": "07:00", "close": "20:00", "closed": false},
    "friday": {"open": "07:00", "close": "20:00", "closed": false},
    "saturday": {"open": "07:00", "close": "18:00", "closed": false},
    "sunday": {"open": "07:00", "close": "18:00", "closed": true}
  }'::jsonb
)
on conflict (id) do nothing;

create table if not exists public.b2b_equipment (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12, 2) check (price is null or price >= 0),
  price_unit text check (price_unit is null or price_unit in ('hari', 'minggu', 'bulan')),
  quantity_available integer not null default 0 check (quantity_available >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists business_settings_set_updated_at on public.business_settings;
create trigger business_settings_set_updated_at
  before update on public.business_settings
  for each row execute function public.set_updated_at();

drop trigger if exists b2b_equipment_set_updated_at on public.b2b_equipment;
create trigger b2b_equipment_set_updated_at
  before update on public.b2b_equipment
  for each row execute function public.set_updated_at();

alter table public.laundry_items enable row level security;
alter table public.order_items enable row level security;
alter table public.business_settings enable row level security;
alter table public.b2b_equipment enable row level security;

drop policy if exists "laundry_items_select_active" on public.laundry_items;
drop policy if exists "laundry_items_admin_all" on public.laundry_items;
drop policy if exists "order_items_admin_all" on public.order_items;
drop policy if exists "business_settings_admin_all" on public.business_settings;
drop policy if exists "b2b_equipment_select_active" on public.b2b_equipment;
drop policy if exists "b2b_equipment_admin_all" on public.b2b_equipment;

create policy "laundry_items_select_active"
  on public.laundry_items for select to anon, authenticated
  using (is_active = true);
create policy "laundry_items_admin_all"
  on public.laundry_items for all to authenticated
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

create policy "order_items_admin_all"
  on public.order_items for all to authenticated
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

create policy "business_settings_admin_all"
  on public.business_settings for all to authenticated
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

create policy "b2b_equipment_select_active"
  on public.b2b_equipment for select to anon, authenticated
  using (is_active = true);
create policy "b2b_equipment_admin_all"
  on public.b2b_equipment for all to authenticated
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

create index if not exists orders_created_at_capacity_idx
  on public.orders (created_at, order_type, archived_at);
create index if not exists order_items_order_id_idx
  on public.order_items (order_id);
