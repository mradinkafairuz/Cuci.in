-- ---------------------------------------------------------------------
-- 1. services: tambah slug
--    Website memakai link ?layanan=svc-1. ID database berupa UUID panjang,
--    jadi kita pakai slug yang mudah dibaca, contoh: ?layanan=cuci-kering
-- ---------------------------------------------------------------------
alter table public.services
  add column slug text unique;


-- ---------------------------------------------------------------------
-- 2. orders: tambah nama pemesan dan jadwal penjemputan
--    - customer_name : form /pesan meminta "Nama lengkap"
--    - pickup_at     : beranda menyebut "pilih waktu yang paling nyaman"
--    Dibuat boleh kosong (nullable) agar tidak merusak data yang sudah ada.
-- ---------------------------------------------------------------------
alter table public.orders
  add column customer_name text,
  add column pickup_at timestamptz;


-- ---------------------------------------------------------------------
-- 3. Data awal 4 layanan (sama persis dengan yang tampil di website)
--    Jika dijalankan dua kali, baris yang sudah ada dilewati.
-- ---------------------------------------------------------------------
insert into public.services (slug, name, description, price_per_kg, estimated_days)
values
  ('cuci-kering',   'Cuci Kering',    'Cuci bersih dan dikeringkan, siap disetrika sendiri.',          5000, 2),
  ('setrika-saja',  'Setrika Saja',   'Pakaian bersih Anda dirapikan dengan setrika uap.',             4000, 1),
  ('cuci-setrika',  'Cuci + Setrika', 'Paket lengkap: dicuci, dikeringkan, disetrika, dan dilipat.',   7000, 3),
  ('kilat-express', 'Kilat (Express)', 'Layanan prioritas, selesai di hari yang sama.',               12000, 1)
on conflict (slug) do nothing;