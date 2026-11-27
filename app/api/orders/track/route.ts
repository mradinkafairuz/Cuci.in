import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isValidOrderCode } from "@/lib/utils/order-code";
import { checkTrackingRateLimit } from "@/lib/utils/tracking-rate-limit";
import type { OrderStatus, OrderTracking, PriceQuoteStatus } from "@/types";
import type { Database } from "@/types/database.types";

export const dynamic = "force-dynamic";

const publicStatus: Record<Database["public"]["Enums"]["process_status"], OrderStatus> = {
  MENUNGGU: "menunggu",
  DITERIMA: "diterima",
  DIPROSES: "diproses",
  DICUCI: "dicuci",
  DISETRIKA: "disetrika",
  SIAP_DIAMBIL: "siap_diambil",
  SELESAI: "selesai",
  DIBATALKAN: "dibatalkan",
};

const publicQuoteStatus: Record<Database["public"]["Tables"]["orders"]["Row"]["price_quote_status"], PriceQuoteStatus> = {
  MENUNGGU_TIMBANG: "menunggu_timbang",
  MENUNGGU_PERSETUJUAN: "menunggu_persetujuan",
  DISETUJUI: "disetujui",
  DITOLAK: "ditolak",
};

function formatEstimatedDone(date: string | null): string {
  return date
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(date))
    : "Menunggu konfirmasi";
}

function getLastFourPhoneDigits(phone: string) {
  return phone.replace(/\D/g, "").slice(-4);
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
  const phoneLast4 = new URL(request.url).searchParams.get("phoneLast4")?.trim() ?? "";
  if (!isValidOrderCode(code)) {
    return NextResponse.json({ error: "Format kode pesanan tidak valid." }, { status: 400 });
  }
  if (!/^\d{4}$/.test(phoneLast4)) {
    return NextResponse.json({ error: "Masukkan 4 digit terakhir nomor WhatsApp yang digunakan saat memesan." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: currentRow, error } = await supabase
      .from("orders")
      .select("id, order_code, contact_phone, process_status, order_type, service_id, estimated_done_at, customer_message, weight_kg, total_price, payment_status, capacity_approval_status, pickup_at, price_quote_status, services(name, price_per_kg)")
      .eq("order_code", code)
      .maybeSingle();
    let row = currentRow;
    if (error && isMissingPriceQuoteSchema(error)) {
      const { data: legacyRow, error: legacyError } = await supabase
        .from("orders")
        .select("id, order_code, contact_phone, process_status, service_id, weight_kg, total_price, estimated_done_at, payment_status, capacity_approval_status, pickup_at")
        .eq("order_code", code)
        .maybeSingle();
      if (legacyError) throw legacyError;
      row = legacyRow
        ? {
            id: legacyRow.id,
            order_code: legacyRow.order_code,
            contact_phone: legacyRow.contact_phone,
            process_status: legacyRow.process_status,
            service_id: legacyRow.service_id,
            weight_kg: legacyRow.weight_kg,
            total_price: legacyRow.total_price,
            payment_status: legacyRow.payment_status,
            capacity_approval_status: legacyRow.capacity_approval_status,
            pickup_at: legacyRow.pickup_at,
            estimated_done_at: legacyRow.estimated_done_at,
            order_type: "KILOAN",
            price_quote_status: "DISETUJUI",
            customer_message: null,
            services: null,
          }
        : null;
    } else if (error) {
      throw error;
    }
    if (!row) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }
    if (getLastFourPhoneDigits(row.contact_phone) !== phoneLast4) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    let serviceName = "Cuci Satuan";
    let pricePerKg: number | null = null;
    let processingMethod: string | null = null;
    if (row.order_type === "KILOAN" && row.service_id) {
      const service = Array.isArray(row.services) ? row.services[0] : row.services;
      serviceName = service?.name ?? "Layanan laundry";
      pricePerKg = service ? Number(service.price_per_kg) : null;
    } else if (row.order_type === "SATUAN") {
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("item_name, quantity")
        .eq("order_id", row.id);
      if (itemsError && itemsError.code !== "42P01" && itemsError.code !== "PGRST205") throw itemsError;
      if (itemsError) {
        serviceName = "Cuci Satuan";
      } else {
        serviceName = items.map((item) => `${item.item_name} (${item.quantity} item)`).join(", ") || "Cuci Satuan";
        processingMethod = items.length ? "Pencucian sesuai jenis kain" : null;
      }
    }

    const order: OrderTracking = {
      code: row.order_code,
      serviceName,
      status: publicStatus[row.process_status],
      estimatedDone: formatEstimatedDone(row.estimated_done_at),
      customerMessage: row.customer_message,
      pickupAt: row.pickup_at,
      paymentStatus: row.payment_status === "PAID" ? "lunas" : "belum_bayar",
      weightKg: row.weight_kg === null ? null : Number(row.weight_kg),
      total: row.total_price === null ? null : Number(row.total_price),
      pricePerKg,
      capacityApprovalStatus: row.capacity_approval_status === "PENDING" ? "pending" : "not_required",
      priceQuoteStatus: publicQuoteStatus[row.price_quote_status],
      processingMethod,
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
