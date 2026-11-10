import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isValidOrderCode } from "@/lib/utils/order-code";
import { checkTrackingRateLimit } from "@/lib/utils/tracking-rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rateLimit = checkTrackingRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Silakan coba lagi nanti." }, {
      status: 429,
      headers: { "Cache-Control": "no-store", "Retry-After": String(rateLimit.retryAfterSeconds) },
    });
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Permintaan tidak diizinkan." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format persetujuan harga tidak valid." }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const decision = body.decision;
  if (!isValidOrderCode(code) || (decision !== "approve" && decision !== "reject")) {
    return NextResponse.json({ error: "Kode pesanan atau pilihan persetujuan tidak valid." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, price_quote_status")
      .eq("order_code", code)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    if (order.price_quote_status !== "MENUNGGU_PERSETUJUAN") {
      return NextResponse.json({ error: "Tidak ada penawaran yang menunggu persetujuan." }, { status: 409 });
    }

    const approved = decision === "approve";
    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update({
        price_quote_status: approved ? "DISETUJUI" : "DITOLAK",
        ...(approved ? { process_status: "DIPROSES" as const } : {}),
      })
      .eq("id", order.id)
      .eq("price_quote_status", "MENUNGGU_PERSETUJUAN")
      .select("order_code, price_quote_status, process_status")
      .maybeSingle();
    if (updateError) throw updateError;
    if (!updated) return NextResponse.json({ error: "Penawaran baru saja diputuskan." }, { status: 409 });

    return NextResponse.json({
      code: updated.order_code,
      priceQuoteStatus: updated.price_quote_status,
      processStatus: updated.process_status,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to save customer price quote decision:", error);
    return NextResponse.json({ error: "Persetujuan harga belum dapat disimpan. Silakan coba lagi." }, { status: 503 });
  }
}
