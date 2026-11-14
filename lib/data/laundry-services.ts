import type { LaundryService } from "@/types";

export const LOCAL_LAUNDRY_SERVICES: LaundryService[] = [
  {
    id: "cuci-kering",
    slug: "cuci-kering",
    name: "Cuci Kering",
    description: "Cuci bersih dan dikeringkan, siap disetrika sendiri.",
    pricePerKg: 5000,
    estimateDays: 2,
    icon: "wash",
  },
  {
    id: "setrika-saja",
    slug: "setrika-saja",
    name: "Setrika Saja",
    description: "Pakaian bersih dirapikan dengan setrika uap.",
    pricePerKg: 4000,
    estimateDays: 1,
    icon: "iron",
  },
  {
    id: "cuci-setrika",
    slug: "cuci-setrika",
    name: "Cuci + Setrika",
    description: "Paket lengkap: dicuci, dikeringkan, disetrika, dan dilipat.",
    pricePerKg: 7000,
    estimateDays: 3,
    icon: "full",
  },
  {
    id: "kilat-express",
    slug: "kilat-express",
    name: "Kilat (Express)",
    description: "Layanan prioritas dengan estimasi selesai satu hari.",
    pricePerKg: 12000,
    estimateDays: 1,
    icon: "express",
  },
];
