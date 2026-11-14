import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function PATCH(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Silakan login sebagai admin atau petugas." }, { status: 401 });

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Permintaan tidak diizinkan." }, { status: 403 });
  }

  const { orderId } = await context.params;
  if (!isUuid(orderId)) return NextResponse.json({ error: "Pesanan tidak valid." }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format data penawaran tidak valid." }, { status: 400 });
  }

  const weightKg = Number(body.weightKg);
  const serviceId = typeof body.serviceId === "string" ? body.serviceId : "";
  if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 200 || !isUuid(serviceId)) {
    return NextResponse.json({ error: "Masukkan berat dan metode pengerjaan yang valid." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const [{ data: order, error: orderError }, { data: service, error: serviceError }] = await Promise.all([
      supabase.from("orders").select("id, order_type, price_quote_status").eq("id", orderId).maybeSingle(),
      supabase.from("services").select("id, name, price_per_kg, estimated_days, is_active").eq("id", serviceId).maybeSingle(),
    ]);
    if (orderError) throw orderError;
    if (serviceError) throw serviceError;
    if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    if (order.order_type !== "KILOAN") return NextResponse.json({ error: "Penawaran berat hanya berlaku untuk pesanan kiloan." }, { status: 400 });
    if (!service || !service.is_active) return NextResponse.json({ error: "Metode pengerjaan tidak tersedia." }, { status: 400 });
    if (!["MENUNGGU_TIMBANG", "MENUNGGU_PERSETUJUAN"].includes(order.price_quote_status)) {
      return NextResponse.json({ error: "Penawaran pesanan ini sudah diputuskan." }, { status: 409 });
    }

    const roundedWeight = Math.round(weightKg * 100) / 100;
    const total = Math.round(roundedWeight * Number(service.price_per_kg));
    const estimatedDoneAt = new Date();
    estimatedDoneAt.setDate(estimatedDoneAt.getDate() + service.estimated_days);
    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update({
        weight_kg: roundedWeight,
        service_id: service.id,
        total_price: total,
        estimated_done_at: estimatedDoneAt.toISOString(),
        price_quote_status: "MENUNGGU_PERSETUJUAN",
      })
      .eq("id", order.id)
      .in("price_quote_status", ["MENUNGGU_TIMBANG", "MENUNGGU_PERSETUJUAN"])
      .select("order_code")
      .maybeSingle();
    if (updateError) throw updateError;
    if (!updated) return NextResponse.json({ error: "Penawaran baru saja diputuskan pelanggan." }, { status: 409 });

    return NextResponse.json({
      quote: {
        code: updated.order_code,
        weightKg: roundedWeight,
        methodName: service.name,
        pricePerKg: Number(service.price_per_kg),
        total,
        status: "MENUNGGU_PERSETUJUAN",
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to create laundry price quote:", error);
    return NextResponse.json({ error: "Penawaran belum dapat disimpan. Silakan coba lagi." }, { status: 503 });
  }
}
