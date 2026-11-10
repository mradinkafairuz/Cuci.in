-- Katalog cucian satuan, detail item, dan alur penawaran harga.
-- Kiloan dihitung setelah petugas menimbang; cuci satuan memakai harga katalog.

create table if not exists public.laundry_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  description text,
  processing_method text not null default 'Pencucian khusus sesuai jenis pakaian',
  price numeric(12, 2) not null check (price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.laundry_items
  add column if not exists processing_method text not null default 'Pencucian khusus sesuai jenis pakaian';

create unique index if not exists laundry_items_slug_uidx
  on public.laundry_items (slug);

insert into public.laundry_items (slug, name, description, processing_method, price)
values
  ('kaos-katun', 'Kaos / T-Shirt Katun', 'Cuci satuan pakaian harian.', 'Cuci lembut dan setrika uap', 5000),
  ('kemeja-formal', 'Kemeja Formal / Kasual', 'Perawatan kerah dan setrika presisi.', 'Cuci khusus kerah dan setrika uap', 8000),
  ('jas-blazer', 'Jas / Blazer / Mantel Wool', 'Perawatan khusus pakaian formal dan wool.', 'Dry clean dan finishing uap', 25000),
  ('jaket-bomber', 'Jaket Bomber / Outerwear', 'Pencucian untuk jaket dan outerwear.', 'Deep clean dengan suhu aman', 18000),
  ('hoodie-fleece', 'Hoodie & Sweatshirt', 'Perawatan lembut untuk bahan fleece.', 'Cuci lembut dan pengeringan suhu rendah', 15000),
  ('handuk-mandi', 'Handuk Mandi Hotel', 'Pencucian higienis untuk handuk tebal.', 'Cuci higienis dan pengeringan menyeluruh', 7000),
  ('selimut-tebal', 'Selimut Tebal / Blanket', 'Pencucian khusus untuk selimut tebal.', 'Deep wash dan pengeringan menyeluruh', 20000),
  ('sprei-kasur', 'Sprei Kasur Set', 'Paket sprei dan sarung bantal.', 'Cuci higienis dan setrika uap', 15000),
  ('bed-cover-jumbo', 'Bed Cover Jumbo / King', 'Pencucian untuk bed cover ukuran besar.', 'Deep wash mesin kapasitas besar', 25000),
  ('bantal-tidur', 'Bantal Tidur', 'Pembersihan bantal dan isiannya.', 'Deep wash dan pengeringan 360°', 12000),
  ('gordyn-vitrase', 'Gordyn / Vitrase', 'Perawatan untuk kain tirai.', 'Cuci lembut dan setrika uap', 18000)
on conflict (slug) do nothing;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  item_id uuid not null references public.laundry_items (id) on delete restrict,
  item_name text not null,
  processing_method text not null,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity between 1 and 99),
  created_at timestamptz not null default now()
);

alter table public.order_items
  add column if not exists processing_method text not null default 'Pencucian khusus sesuai jenis pakaian';

alter table public.orders alter column service_id drop not null;
alter table public.orders
  add column if not exists order_type text not null default 'KILOAN',
  add column if not exists price_quote_status text not null default 'DISETUJUI';

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'orders_order_type_check') then
    alter table public.orders add constraint orders_order_type_check
      check (order_type in ('KILOAN', 'SATUAN'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'orders_price_quote_status_check') then
    alter table public.orders add constraint orders_price_quote_status_check
      check (price_quote_status in ('MENUNGGU_TIMBANG', 'MENUNGGU_PERSETUJUAN', 'DISETUJUI', 'DITOLAK'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'orders_type_service_check') then
    alter table public.orders add constraint orders_type_service_check
      check ((order_type = 'KILOAN' and service_id is not null) or (order_type = 'SATUAN' and service_id is null));
  end if;
end $$;

create index if not exists orders_quote_status_created_idx
  on public.orders (price_quote_status, created_at desc);
create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

alter table public.laundry_items enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "laundry_items_select_active" on public.laundry_items;
create policy "laundry_items_select_active"
  on public.laundry_items for select to anon, authenticated
  using (is_active = true);

drop policy if exists "laundry_items_admin_all" on public.laundry_items;
create policy "laundry_items_admin_all"
  on public.laundry_items for all to authenticated
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

drop policy if exists "order_items_select_own_or_staff" on public.order_items;
create policy "order_items_select_own_or_staff"
  on public.order_items for select to authenticated
  using (
    public.get_my_role() in ('admin', 'petugas')
    or exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.customer_id = (select auth.uid())
    )
  );

drop policy if exists "order_items_insert_staff" on public.order_items;
create policy "order_items_insert_staff"
  on public.order_items for insert to authenticated
  with check (public.get_my_role() in ('admin', 'petugas'));
