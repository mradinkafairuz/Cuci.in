import type { LaundryItem, LaundryService, OperatingHour } from "@/types";

export const FALLBACK_LAUNDRY_SERVICES: LaundryService[] = [
  { id: "cuci-kering", slug: "cuci-kering", name: "Cuci Kering", description: "Cuci bersih dan dikeringkan, siap disetrika sendiri.", pricePerKg: 5000, estimateDays: 2, icon: "wash" },
  { id: "setrika-saja", slug: "setrika-saja", name: "Setrika Saja", description: "Pakaian bersih dirapikan dengan setrika uap.", pricePerKg: 4000, estimateDays: 1, icon: "iron" },
  { id: "cuci-setrika", slug: "cuci-setrika", name: "Cuci + Setrika", description: "Paket lengkap: dicuci, dikeringkan, disetrika, dan dilipat.", pricePerKg: 7000, estimateDays: 3, icon: "full" },
  { id: "kilat-express", slug: "kilat-express", name: "Kilat (Express)", description: "Layanan prioritas dengan estimasi selesai satu hari.", pricePerKg: 12000, estimateDays: 1, icon: "express" },
];

export const FALLBACK_LAUNDRY_ITEMS: LaundryItem[] = [
  { id: "kaos-katun", slug: "kaos-katun", name: "Kaos / T-Shirt Katun", processingMethod: "Cuci lembut dan setrika uap", price: 5000 },
  { id: "kemeja-formal", slug: "kemeja-formal", name: "Kemeja Formal / Kasual", processingMethod: "Cuci khusus kerah dan setrika uap", price: 8000 },
  { id: "jas-blazer", slug: "jas-blazer", name: "Jas / Blazer / Mantel Wool", processingMethod: "Dry clean dan finishing uap", price: 25000 },
  { id: "jaket-bomber", slug: "jaket-bomber", name: "Jaket Bomber / Outerwear", processingMethod: "Deep clean dengan suhu aman", price: 18000 },
  { id: "hoodie-fleece", slug: "hoodie-fleece", name: "Hoodie & Sweatshirt", processingMethod: "Cuci lembut dan pengeringan suhu rendah", price: 15000 },
  { id: "handuk-mandi", slug: "handuk-mandi", name: "Handuk Mandi Hotel", processingMethod: "Cuci higienis dan pengeringan menyeluruh", price: 7000 },
  { id: "selimut-tebal", slug: "selimut-tebal", name: "Selimut Tebal / Blanket", processingMethod: "Deep wash dan pengeringan menyeluruh", price: 20000 },
  { id: "sprei-kasur", slug: "sprei-kasur", name: "Sprei Kasur Set", processingMethod: "Cuci higienis dan setrika uap", price: 15000 },
  { id: "bed-cover-jumbo", slug: "bed-cover-jumbo", name: "Bed Cover Jumbo / King", processingMethod: "Deep wash mesin kapasitas besar", price: 25000 },
  { id: "bantal-tidur", slug: "bantal-tidur", name: "Bantal Tidur / Pillow", processingMethod: "Deep wash dan pengeringan menyeluruh", price: 12000 },
  { id: "gordyn-vitrase", slug: "gordyn-vitrase", name: "Gordyn / Vitrase / Curtain", processingMethod: "Cuci lembut dan setrika uap", price: 18000 },
];

export const FALLBACK_OPERATING_HOURS: OperatingHour[] = [
  { day: "Senin - Jumat", open: "07.00", close: "20.00" },
  { day: "Sabtu", open: "07.00", close: "18.00" },
  { day: "Minggu", open: "-", close: "-", closed: true },
];
