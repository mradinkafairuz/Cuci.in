import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isValidOrderCode } from "@/lib/utils/order-code";
import { checkTrackingRateLimit } from "@/lib/utils/tracking-rate-limit";
import type { OrderStatus, OrderTracking } from "@/types";
import type { OrderProcessStatus } from "@/types/database.types";

export const dynamic = "force-dynamic";

const publicStatus: Record<OrderProcessStatus, OrderStatus> = {
  MENUNGGU: "menunggu",
  DITERIMA: "diterima",
  DICUCI: "dicuci",
  DISETRIKA: "disetrika",
  SIAP_DIAMBIL: "siap_diambil",
  SELESAI: "selesai",
};

function formatEstimatedDone(date: string | null): string {
  return date
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(date))
    : "Menunggu konfirmasi";
}

export async function GET(request: Request) {
  const rateLimit = checkTrackingRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Silakan coba lagi nanti." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  const code = new URL(request.url).searchParams.get("code")?.trim().toUpperCase() ?? "";
  if (!isValidOrderCode(code)) {
    return NextResponse.json({ error: "Format kode pesanan tidak valid." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: row, error } = await supabase
      .from("orders")
      .select("id, order_code, process_status, order_type, service_id, estimated_done_at")
      .eq("order_code", code)
      .maybeSingle();
    if (error) throw error;
    if (!row) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    let serviceName = "Cuci Satuan";
    if (row.order_type === "KILOAN" && row.service_id) {
      const { data: service, error: serviceError } = await supabase
        .from("services")
        .select("name")
        .eq("id", row.service_id)
        .maybeSingle();
      if (serviceError) throw serviceError;
      serviceName = service?.name ?? "Layanan laundry";
    } else if (row.order_type === "SATUAN") {
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("item_name, quantity")
        .eq("order_id", row.id);
      if (itemsError) throw itemsError;
      serviceName = items.map((item) => `${item.item_name} (${item.quantity} item)`).join(", ") || "Cuci Satuan";
    }

    const order: OrderTracking = {
      code: row.order_code,
      serviceName,
      status: publicStatus[row.process_status],
      estimatedDone: formatEstimatedDone(row.estimated_done_at),
    };
    return NextResponse.json({ order }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to track Supabase laundry order:", error);
    return NextResponse.json(
      { error: "Status pesanan belum dapat dimuat. Silakan coba lagi." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
