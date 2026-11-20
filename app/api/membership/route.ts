import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getMembershipPlan } from "@/lib/membership";
import { isValidIndonesianPhone } from "@/lib/utils/phone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Permintaan tidak diizinkan." }, { status: 403 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > 8_000) {
    return NextResponse.json({ error: "Data pendaftaran terlalu besar." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format pendaftaran tidak valid." }, { status: 400 });
  }
  if (!isRecord(body)) return NextResponse.json({ error: "Data pendaftaran tidak valid." }, { status: 400 });

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const submittedPhone = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const plan = getMembershipPlan(body.planCode);
  const consent = body.consent === true;
  if (fullName.length < 2 || fullName.length > 120 || !isValidIndonesianPhone(submittedPhone) || !consent || !plan) {
    return NextResponse.json({ error: "Periksa paket, nama, nomor WhatsApp, dan persetujuan pendaftaran." }, { status: 400 });
  }
  if (email.length > 254 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
  }

  const digits = submittedPhone.replace(/\D/g, "");
  const phone = digits.startsWith("62") ? `+${digits}` : `+62${digits.slice(1)}`;
  const memberCode = `CUCI-${randomBytes(5).toString("hex").toUpperCase()}`;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("memberships")
      .insert({
        member_code: memberCode,
        full_name: fullName,
        phone,
        email: email || null,
        consent_at: new Date().toISOString(),
        package_code: plan.code,
        package_name: plan.name,
        monthly_price: plan.monthlyPrice,
        discount_percent: plan.discountPercent,
        status: "pending_payment",
        is_active: false,
      })
      .select("member_code")
      .single();

    if (error?.code === "23505") {
      return NextResponse.json({ error: "Nomor WhatsApp ini sudah terdaftar sebagai member." }, { status: 409 });
    }
    if (error) throw error;

    return NextResponse.json({ memberCode: data.member_code }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to create Cuci.in membership:", error);
    return NextResponse.json({ error: "Pendaftaran member belum dapat disimpan. Coba lagi sebentar." }, { status: 503 });
  }
}
