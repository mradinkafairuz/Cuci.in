-- ---------------------------------------------------------------------
-- 1. customer_id boleh kosong
--    Pesanan tamu (tanpa akun) tidak punya customer_id.
--    Pesanan pengguna yang login tetap mengisi customer_id seperti biasa.
-- ---------------------------------------------------------------------
alter table public.orders
  alter column customer_id drop not null;


-- ---------------------------------------------------------------------
-- 2. Pengaman
--    Setiap pesanan wajib punya salah satu:
--      - customer_id (pengguna login), atau
--      - customer_name (nama yang diisi tamu di form)
--    Nomor WhatsApp dan alamat sudah wajib dari awal (NOT NULL).
-- ---------------------------------------------------------------------
alter table public.orders
  add constraint orders_customer_or_guest_check
  check (
    customer_id is not null
    or nullif(btrim(customer_name), '') is not null
  );
