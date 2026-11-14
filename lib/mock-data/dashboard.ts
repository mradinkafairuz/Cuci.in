import type { OrderStatus } from "@/types";

export type DashboardOrder = {
  code: string;
  customer: string;
  service: string;
  status: OrderStatus;
  weight: number | null;
  total: number | null;
  createdAt: string;
};

// Daftar pesanan tetap kosong sampai data Supabase dihubungkan.
export const dashboardOrders: DashboardOrder[] = [];

export const statusLabels: Record<OrderStatus, string> = {
  menunggu: "Menunggu",
  diterima: "Diterima",
  diproses: "Diproses",
  dicuci: "Sedang dicuci",
  disetrika: "Disetrika",
  siap_diambil: "Siap diambil",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};
