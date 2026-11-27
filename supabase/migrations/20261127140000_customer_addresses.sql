create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  label text not null default 'Rumah',
  recipient_name text not null,
  phone text not null,
  address text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_addresses_customer_id_idx
  on public.customer_addresses (customer_id);

alter table public.customer_addresses enable row level security;
grant select, insert, update, delete on public.customer_addresses to authenticated;

drop policy if exists customer_addresses_select_own on public.customer_addresses;
create policy customer_addresses_select_own
  on public.customer_addresses for select to authenticated
  using (
    customer_id = (select auth.uid())
    and (select public.get_my_role()) = 'pelanggan'
  );

drop policy if exists customer_addresses_insert_own on public.customer_addresses;
create policy customer_addresses_insert_own
  on public.customer_addresses for insert to authenticated
  with check (
    customer_id = (select auth.uid())
    and (select public.get_my_role()) = 'pelanggan'
  );

drop policy if exists customer_addresses_update_own on public.customer_addresses;
create policy customer_addresses_update_own
  on public.customer_addresses for update to authenticated
  using (
    customer_id = (select auth.uid())
    and (select public.get_my_role()) = 'pelanggan'
  )
  with check (
    customer_id = (select auth.uid())
    and (select public.get_my_role()) = 'pelanggan'
  );

drop policy if exists customer_addresses_delete_own on public.customer_addresses;
create policy customer_addresses_delete_own
  on public.customer_addresses for delete to authenticated
  using (
    customer_id = (select auth.uid())
    and (select public.get_my_role()) = 'pelanggan'
  );

drop trigger if exists customer_addresses_set_updated_at on public.customer_addresses;
create trigger customer_addresses_set_updated_at
  before update on public.customer_addresses
  for each row execute function public.set_updated_at();
