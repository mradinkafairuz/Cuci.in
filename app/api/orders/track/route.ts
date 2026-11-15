import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isValidOrderCode } from "@/lib/utils/order-code";
import { checkTrackingRateLimit } from "@/lib/utils/tracking-rate-limit";
import type { OrderStatus, OrderTracking } from "@/types";
import type { Database } from "@/types/database.types";

export const dynamic = "force-dynamic";

const publicStatus: Record<Database["public"]["Enums"]["process_status"], OrderStatus> = {
  DITERIMA: "diterima",
  DIPROSES: "diproses",
  DICUCI: "dicuci",
  DISETRIKA: "disetrika",
  SIAP_DIAMBIL: "siap_diambil",
  SELESAI: "selesai",
  DIBATALKAN: "dibatalkan",
};

const publicQuoteStatus = {
  MENUNGGU_TIMBANG: "menunggu_timbang",
  MENUNGGU_PERSETUJUAN: "menunggu_persetujuan",
  DISETUJUI: "disetujui",
  DITOLAK: "ditolak",
} as const;

function formatEstimatedDone(date: string | null): string {
  return date
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(date))
    : "Menunggu konfirmasi";
}

function isMissingPriceQuoteSchema(error: { code?: string; message?: string }) {
  return error.code === "42703"
    || error.code === "PGRST204"
    || Boolean(error.message && /order_type|price_quote_status/i.test(error.message));
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
    const { data: currentRow, error } = await supabase
      .from("orders")
      .select("id, order_code, process_status, order_type, service_id, estimated_done_at, customer_message, services(name)")
      .eq("order_code", code)
      .maybeSingle();
    let row = currentRow;
    if (error && isMissingPriceQuoteSchema(error)) {
      const { data: legacyRow, error: legacyError } = await supabase
        .from("orders")
        .select("id, order_code, process_status, service_id, weight_kg, total_price, estimated_done_at")
        .eq("order_code", code)
        .maybeSingle();
      if (legacyError) throw legacyError;
      row = legacyRow
        ? { ...legacyRow, order_type: "KILOAN" as const, price_quote_status: "DISETUJUI" as const }
        : null;
    } else if (error) {
      throw error;
    }
    if (!row) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    let serviceName = "Cuci Satuan";
    let processingMethod: string | null = null;
    if (row.order_type === "KILOAN" && row.service_id) {
      serviceName = row.services?.name ?? "Layanan laundry";
    } else if (row.order_type === "SATUAN") {
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("item_name, processing_method, quantity")
        .eq("order_id", row.id);
      if (itemsError && itemsError.code !== "42P01" && itemsError.code !== "PGRST205") throw itemsError;
      if (itemsError) {
        serviceName = "Cuci Satuan";
      } else {
        serviceName = items.map((item) => `${item.item_name} (${item.quantity} item)`).join(", ") || "Cuci Satuan";
        processingMethod = [...new Set(items.map((item) => item.processing_method))].join(", ") || null;
      }
    }

    const order: OrderTracking = {
      code: row.order_code,
      serviceName,
      status: publicStatus[row.process_status],
      estimatedDone: formatEstimatedDone(row.estimated_done_at),
      customerMessage: row.customer_message,
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
