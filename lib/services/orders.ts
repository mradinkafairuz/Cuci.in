import type { OrderTracking } from "@/types";

export async function getOrderByCode(
  code: string,
  phoneLast4: string,
): Promise<OrderTracking | null> {
  const params = new URLSearchParams({ code: code.trim(), phoneLast4: phoneLast4.trim() });
  const response = await fetch(`/api/orders/track?${params}`, {
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Status pesanan tidak dapat dimuat.");

  const result: { order: OrderTracking } = await response.json();
  return result.order;
}
