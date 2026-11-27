export const SITE_CONFIG = {
  brandName: "Cuci.in",
  tagline: "Laundry Antar Jemput Gunungpati, Semarang",
  whatsappNumber: "6285211981471",
  whatsappDisplay: "0852-1198-1471",
  email: "halo@cuci.in",
  address: {
    street: "Jl. Mangunsari Raya, Gunungpati",
    city: "Semarang, Jawa Tengah",
    postalCode: "50221",
    short: "Gunungpati, Semarang",
  },
  serviceArea: "Gunungpati, Sekaran (UNNES), Patemon & sekitarnya",
  operatingHours: {
    weekdays: "Senin–Jumat · 07.00–20.00 WIB",
    saturday: "Sabtu · 07.00–18.00 WIB",
    sunday: "Minggu · Tutup",
  },
  socials: {
    instagram: "https://instagram.com",
    tiktok: "https://tiktok.com",
  },
  copyrightYear: 2026,
} as const;

export function getWhatsAppUrl(message?: string): string {
  const base = `https://wa.me/${SITE_CONFIG.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
