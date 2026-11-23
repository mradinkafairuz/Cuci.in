export type MembershipPlanCode = "hemat" | "prioritas";

export type MembershipPlan = {
  id: string;
  code: MembershipPlanCode;
  name: string;
  description: string;
  monthly_price: number;
  discount_percent: number;
  priority_queue: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export const DEFAULT_MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: "default-hemat",
    code: "hemat",
    name: "Hemat",
    description: "Pilihan praktis untuk mendapatkan potongan harga setiap bulan.",
    monthly_price: 15000,
    discount_percent: 5,
    priority_queue: false,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "default-prioritas",
    code: "prioritas",
    name: "Prioritas",
    description: "Diskon lebih besar dan antrean layanan yang diprioritaskan.",
    monthly_price: 30000,
    discount_percent: 10,
    priority_queue: true,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

export function formatMembershipPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}
