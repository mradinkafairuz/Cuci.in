export const MEMBERSHIP_PLANS = [
  {
    code: "hemat",
    name: "Hemat",
    monthlyPrice: 15000,
    discountPercent: 5,
    description: "Pilihan praktis untuk mendapatkan potongan harga setiap bulan.",
  },
  {
    code: "prioritas",
    name: "Prioritas",
    monthlyPrice: 30000,
    discountPercent: 10,
    description: "Diskon lebih besar dan antrean layanan yang diprioritaskan.",
  },
] as const;

export type MembershipPlanCode = (typeof MEMBERSHIP_PLANS)[number]["code"];

export function getMembershipPlan(code: unknown) {
  return MEMBERSHIP_PLANS.find((plan) => plan.code === code) ?? null;
}

export function formatMembershipPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}
