export type OrderStatus =
  | "menunggu"
  | "diterima"
  | "dicuci"
  | "disetrika"
  | "siap_diambil"
  | "selesai";

export type PaymentStatus = "belum_bayar" | "lunas";

export interface LaundryService {
  id: string;
  slug?: string | null;
  name: string;
  description: string | null;
  pricePerKg: number;
  estimateDays: number;
  icon: "wash" | "iron" | "full" | "express";
}

export interface LaundryItem {
  id: string;
  slug: string;
  name: string;
  price: number;
}

export interface OperatingHour {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export interface OrderTracking {
  code: string;
  customerName?: string;
  phone?: string;
  pickupAddress?: string;
  serviceName: string;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  weightKg?: number | null;
  total?: number | null;
  estimatedDone: string;
}
