import type { OperatingHour } from "@/types";

export const operatingHours: OperatingHour[] = [
  { day: "Senin - Jumat", open: "07.00", close: "20.00" },
  { day: "Sabtu", open: "07.00", close: "18.00" },
  { day: "Minggu", open: "-", close: "-", closed: true },
];

export const orderSteps = [
  { title: "Pilih layanan", desc: "Tentukan jenis perawatan yang Anda butuhkan." },
  { title: "Atur penjemputan", desc: "Masukkan alamat dan kontak yang bisa dihubungi." },
  { title: "Pantau Status", desc: "Lihat progres cucian dari dashboard." },
  { title: "Bayar & Ambil", desc: "Lunasi tagihan, lalu ambil cucian Anda." },
];
