# Frontend Laundry — Minggu 1 (Landing Page)

Berisi frontend Next.js dan integrasi pemesanan/tracking melalui API server Supabase.
Tidak ada inisialisasi ulang proyek.

## 1. Cek versi Tailwind
Buka `package.json` proyek Anda, lihat `"tailwindcss"`:
- `^4.x` -> pakai `styles/theme-tailwind-v4.css`
- `^3.x` -> pakai `styles/theme-tailwind-v3.ts`

## 2. Pasang dependensi
```bash
npm install
```

## 3. Salin file
Salin folder berikut ke proyek (jika ada file dengan nama sama, bandingkan dulu, jangan langsung timpa):
- `app/layout.tsx` dan `app/page.tsx`
- `components/` (ui, layout, landing)
- `lib/` (utils, services, integrations)
- `types/index.ts`

## 4. Pasang tema warna
- Tailwind v4: tempel isi `styles/theme-tailwind-v4.css` ke `app/globals.css`, di bawah `@import "tailwindcss";`
- Tailwind v3: gabungkan bagian `theme.extend.colors` dari `styles/theme-tailwind-v3.ts` ke `tailwind.config.ts`, dan tambahkan style `body` seperti di komentar file tersebut.

## 5. Cek alias `@/`
Di `tsconfig.json` harus ada:
```json
"paths": { "@/*": ["./*"] }
```
(Jika proyek memakai folder `src/`, ubah menjadi `["./src/*"]` dan salin semua folder ke dalam `src/`.)

## 6. Jalankan
```bash
npm run dev
```
Buka http://localhost:3000

## 7. Halaman interaktif
- Pilih kartu layanan atau tombol pesan untuk membuka `/pesan`.
- Halaman pemesanan membaca katalog aktif, meminta alamat lengkap dan slot jemput satu jam (08.00–20.00 WIB, maksimal H+7, minimal satu jam sebelumnya), lalu menyimpan jadwal permintaan ke Supabase melalui API server. Jadwal tetap dikonfirmasi petugas/kurir.
- Halaman `/cek-status` mencari pesanan Supabase dengan kode tracking dan 4 digit terakhir nomor WhatsApp, menampilkan jadwal jemput, progres dan rincian harga, serta menyediakan persetujuan atau penolakan setelah penawaran final tersedia.
- Pelanggan dapat tetap memesan sebagai tamu, atau mendaftar/masuk dengan email dan kata sandi melalui `/akun/daftar` dan `/akun/masuk`. Pesanan yang dibuat saat masuk akan tertaut ke akun dan tampil bersama profil, alamat tersimpan, serta riwayatnya di `/dashboard`.
- Pencarian laundry sekitar memakai izin lokasi browser dan data OpenStreetMap.

## Supabase
1. Salin `.env.example` menjadi `.env.local`. Isi `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dari pengaturan API proyek. Secret key hanya boleh berada di server; jangan pernah menaruhnya pada variabel `NEXT_PUBLIC_*`.
2. Tinjau perubahan migrasi sebelum menerapkannya. Migrasi fitur peminjaman membatasi kolom `orders` yang dapat di-update oleh role `authenticated`; aplikasi ini mengelola perubahan lewat API server, tetapi aplikasi lain yang memakai database bersama mungkin perlu menyesuaikan query update-nya. Migrasi pesan pelanggan hanya menambahkan kolom pesan dengan batas 500 karakter. Setelah kompatibilitas dipastikan, terapkan migrasi:
   ```bash
   npx supabase login
   npx supabase link --project-ref <project-ref>
   npx supabase db push
   ```
3. Buat akun admin melalui Supabase Dashboard → Authentication → Users. Setelah akun dibuat, tetapkan role-nya melalui SQL Editor:
   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'admin@contoh.com');
   ```
   Ganti email contoh dengan email admin. Akun pelanggan biasa tidak mendapat akses admin.
4. Untuk petugas, buat akun di Supabase Auth lalu tetapkan role `petugas`:
   ```sql
   update public.profiles
   set role = 'petugas'
   where id = (select id from auth.users where email = 'petugas@contoh.com');
   ```
5. Jalankan `npm run dev`. Semua akun operasional masuk melalui `/login`; setelah role diverifikasi, admin diarahkan ke `/admin` dan petugas ke `/petugas`. Jika belum login, membuka salah satu panel akan mengarahkan pengguna ke `/login`.
6. Untuk akun pelanggan, aktifkan Email/Password di Supabase Authentication. Jika konfirmasi email diwajibkan oleh pengaturan proyek Supabase, pelanggan harus mengonfirmasi email sebelum masuk. Terapkan migrasi `20261127140000_customer_addresses.sql` untuk membuat tabel alamat tersimpan beserta kebijakan RLS pemilik. Pelanggan tetap dapat checkout tanpa akun; pesanan akun hanya tertaut ke `customer_id` setelah API memverifikasi sesi dan role `pelanggan`.

Panel `/admin` mengelola seluruh pesanan, layanan, harga, peminjaman alat, kuota, jam operasional, dan data bisnis. Petugas dapat menimbang dan mengirim penawaran harga, mengubah status, mencatat pembayaran, serta mengirim pesan singkat kepada pelanggan; pesan itu tampil pada halaman `/cek-status`. Pembuatan/pengarsipan pesanan serta persetujuan kuota hanya untuk admin. Perubahan pengaturan diterapkan setelah admin menekan **Simpan perubahan**. Halaman `/peminjaman-alat` menerima permintaan tanpa login pelanggan; harga alat yang belum diatur ditampilkan sebagai “Tanya ke admin”. Enam jenis alat awal dimasukkan oleh migrasi Supabase.

Daftar pesanan di panel dimuat 30 item per halaman, sedangkan statistik pendapatan dan kuota dihitung di database untuk menghindari pengiriman seluruh riwayat pesanan ke browser. Terapkan semua migrasi sebelum memakai fitur baru.

Kode pesanan baru memakai format `LDR-XXXX-XXXX`; kode panjang lama tetap dapat dilacak. Endpoint tracking membatasi data yang ditampilkan dan menerapkan batas 20 percobaan per 15 menit per IP pada tiap instance aplikasi. Karena limiter ini tidak berbagi state antar-instance dan dapat direset saat server restart, production multi-instance tetap perlu rate limit terpusat di WAF/platform atau shared store.

## Penjelasan file
| File | Fungsi |
|---|---|
| `components/ui/*` | Button, Card, Badge, SectionHeading yang dipakai ulang |
| `components/layout/Navbar.tsx` | Navbar responsif + menu mobile |
| `components/layout/Footer.tsx` | Footer |
| `components/landing/*` | Section Landing Page |
| `components/booking/*` | Form pemesanan dan pencarian laundry sekitar |
| `components/auth/CustomerAuthForm.tsx` | Form daftar/masuk pelanggan via Supabase Auth |
| `components/dashboard/CustomerDashboard.tsx` | Profil, alamat tersimpan, pesanan aktif, dan riwayat pelanggan |
| `app/api/*` | API server untuk katalog, pembuatan pesanan, dan pelacakan Supabase |
| `lib/supabase/admin.ts` | Klien Supabase server-only |
| `lib/supabase/browser.ts` | Klien Supabase browser dengan public anon/publishable key |
| `lib/auth/customer-session.ts` | Verifikasi opsional sesi pelanggan untuk API pesanan |
| `lib/auth/customer-browser.ts` | Pembacaan sesi pelanggan di browser |
| `types/database.types.ts` | Tipe tabel dan enum Supabase yang digunakan aplikasi |
| `lib/services/orders.ts` | Klien API pelacakan pesanan |
| `types/index.ts` | Tipe frontend |

## Catatan
- Hasil laundry terdekat mengikuti kelengkapan data OpenStreetMap di sekitar lokasi.
