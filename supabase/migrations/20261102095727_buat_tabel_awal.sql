-- =====================================================================
-- CUCI.IN - MIGRASI AWAL (MINGGU 1)
-- Isi: Enum, Tabel, Fungsi bantu, Trigger, RLS awal, Index
-- Tempel isi file ini ke: supabase/migrations/<timestamp>_init_schema.sql
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. ENUM (daftar pilihan tetap)
--    Kolom bertipe enum hanya boleh berisi nilai yang terdaftar di sini.
-- ---------------------------------------------------------------------
create type public.user_role as enum ('admin', 'petugas', 'pelanggan');

-- Status pengerjaan cucian
create type public.process_status as enum ('DITERIMA', 'DIPROSES', 'SIAP_DIAMBIL', 'SELESAI');

-- Status pembayaran (sengaja dipisah dari status pengerjaan)
create type public.payment_status as enum ('UNPAID', 'PAID');


-- ---------------------------------------------------------------------
-- 2. TABEL
-- ---------------------------------------------------------------------

-- 2a. profiles: data tambahan tiap pengguna (termasuk ROLE).
--     auth.users milik Supabase menyimpan email & password,
--     profiles menyimpan sisanya. Keduanya dihubungkan lewat id yang sama.
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  phone       text,
  role        public.user_role not null default 'pelanggan',
  created_at  timestamptz not null default now()
);

-- 2b. services: daftar layanan laundry (Cuci Kering, Setrika, dst.)
create table public.services (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  description     text,
  price_per_kg    numeric(12, 2) not null check (price_per_kg >= 0),
  estimated_days  integer not null check (estimated_days > 0),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- 2c. orders: pesanan laundry
create table public.orders (
  id                 uuid primary key default gen_random_uuid(),
  order_code         text not null unique,            -- kode unik untuk cek status publik
  customer_id        uuid not null references public.profiles (id) on delete restrict,
  service_id         uuid not null references public.services (id) on delete restrict,
  pickup_address     text not null,
  contact_phone      text not null,
  notes              text,
  weight_kg          numeric(8, 2) check (weight_kg is null or weight_kg > 0),   -- diisi petugas setelah menimbang
  total_price        numeric(12, 2) check (total_price is null or total_price >= 0),
  process_status     public.process_status not null default 'DITERIMA',
  payment_status     public.payment_status not null default 'UNPAID',
  estimated_done_at  timestamptz,
  handled_by         uuid references public.profiles (id) on delete set null,    -- petugas yang menangani
  paid_at            timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- 2d. order_logs: riwayat perubahan status pesanan
create table public.order_logs (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders (id) on delete cascade,
  changed_by  uuid references public.profiles (id) on delete set null,
  old_status  public.process_status,
  new_status  public.process_status not null,
  note        text,
  created_at  timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- 3. FUNGSI BANTU
-- ---------------------------------------------------------------------

-- 3a. get_my_role(): mengembalikan role user yang sedang login.
--     SECURITY DEFINER dipakai agar bisa membaca profiles tanpa
--     terjebak aturan RLS (menghindari "loop tak berujung" di policy).
create or replace function public.get_my_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

-- 3b. set_updated_at(): mengisi kolom updated_at otomatis saat baris diubah
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- 4. TRIGGER AUTO-PROFILE
--    Setiap ada akun baru di auth.users, otomatis dibuatkan baris di profiles
--    dengan role 'pelanggan'. Role SENGAJA tidak diambil dari input pengguna
--    (metadata bisa dipalsukan), jadi selalu memakai default.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) AWAL
--    Setelah RLS diaktifkan, SEMUA akses ditolak kecuali ada policy
--    yang mengizinkan.
-- ---------------------------------------------------------------------
alter table public.profiles   enable row level security;
alter table public.services   enable row level security;
alter table public.orders     enable row level security;
alter table public.order_logs enable row level security;

-- ===== profiles =====
-- Lihat: profil sendiri, atau semua profil jika admin/petugas
create policy "profiles_select_own_or_staff"
  on public.profiles for select to authenticated
  using (
    id = (select auth.uid())
    or public.get_my_role() in ('admin', 'petugas')
  );

-- Ubah profil sendiri, TAPI role tidak boleh berubah
-- (with check: role baru harus sama dengan role saat ini)
create policy "profiles_update_own_no_role_change"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid())
    and role = public.get_my_role()
  );

-- Admin boleh melakukan apa saja (termasuk mengganti role)
create policy "profiles_admin_all"
  on public.profiles for all to authenticated
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

-- ===== services =====
-- Siapa pun (termasuk pengunjung belum login) boleh melihat layanan aktif
create policy "services_select_active"
  on public.services for select to anon, authenticated
  using (is_active = true);

-- Hanya admin yang boleh kelola layanan (tambah/ubah/hapus/lihat yang nonaktif)
create policy "services_admin_all"
  on public.services for all to authenticated
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

-- ===== orders =====
-- Pelanggan hanya melihat pesanannya sendiri; admin/petugas melihat semua
create policy "orders_select_own_or_staff"
  on public.orders for select to authenticated
  using (
    customer_id = (select auth.uid())
    or public.get_my_role() in ('admin', 'petugas')
  );

-- Pelanggan membuat pesanan atas namanya sendiri, dengan kondisi awal yang wajar
-- (tidak boleh langsung menandai PAID atau mengisi berat/harga sendiri)
create policy "orders_insert_own"
  on public.orders for insert to authenticated
  with check (
    customer_id = (select auth.uid())
    and process_status = 'DITERIMA'
    and payment_status = 'UNPAID'
    and weight_kg is null
    and total_price is null
    and handled_by is null
  );

-- Hanya admin/petugas yang boleh mengubah pesanan
create policy "orders_update_staff"
  on public.orders for update to authenticated
  using (public.get_my_role() in ('admin', 'petugas'))
  with check (public.get_my_role() in ('admin', 'petugas'));

-- Hanya admin yang boleh menghapus pesanan
create policy "orders_delete_admin"
  on public.orders for delete to authenticated
  using (public.get_my_role() = 'admin');

-- ===== order_logs =====
-- Pelanggan boleh melihat log pesanannya sendiri; staff melihat semua
create policy "order_logs_select_own_or_staff"
  on public.order_logs for select to authenticated
  using (
    public.get_my_role() in ('admin', 'petugas')
    or exists (
      select 1 from public.orders o
      where o.id = order_logs.order_id
        and o.customer_id = (select auth.uid())
    )
  );

-- Hanya admin/petugas yang boleh mencatat log
create policy "order_logs_insert_staff"
  on public.order_logs for insert to authenticated
  with check (
    public.get_my_role() in ('admin', 'petugas')
    and changed_by = (select auth.uid())
  );


-- ---------------------------------------------------------------------
-- 6. INDEX (agar pencarian/filter cepat)
--    order_code sudah otomatis ber-index karena UNIQUE.
-- ---------------------------------------------------------------------
create index orders_customer_id_idx    on public.orders (customer_id);
create index orders_service_id_idx     on public.orders (service_id);
create index orders_process_status_idx on public.orders (process_status);
create index orders_payment_status_idx on public.orders (payment_status);
create index orders_created_at_idx     on public.orders (created_at desc);
create index order_logs_order_id_idx   on public.order_logs (order_id);
create index profiles_role_idx         on public.profiles (role);