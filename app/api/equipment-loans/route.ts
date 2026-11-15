import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isValidIndonesianPhone } from "@/lib/utils/phone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getJakartaDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Permintaan tidak diizinkan." }, { status: 403 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > 10_000) {
    return NextResponse.json({ error: "Data peminjaman terlalu besar." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 });
  }
  if (!isRecord(body)) return NextResponse.json({ error: "Data peminjaman tidak valid." }, { status: 400 });

  const borrowerName = typeof body.borrowerName === "string" ? body.borrowerName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const quantity = body.quantity;
  const startDate = body.startDate;
  const returnDate = body.returnDate;
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  if (
    borrowerName.length < 2
    || borrowerName.length > 120
    || !isValidIndonesianPhone(phone)
    || !isUuid(body.equipmentId)
    || typeof quantity !== "number"
    || !Number.isInteger(quantity)
    || quantity < 1
    || quantity > 10
    || !isDate(startDate)
    || !isDate(returnDate)
    || startDate < getJakartaDate()
    || returnDate < startDate
    || notes.length > 500
  ) {
    return NextResponse.json(
      { error: "Periksa kembali nama, nomor WhatsApp, alat, jumlah, dan tanggal peminjaman." },
      { status: 400 },
    );
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: equipment, error: equipmentError } = await supabase
      .from("b2b_equipment")
      .select("id, name")
      .eq("id", body.equipmentId)
      .eq("is_active", true)
      .maybeSingle();
    if (equipmentError) throw equipmentError;
    if (!equipment) {
      return NextResponse.json({ error: "Alat ini sedang tidak tersedia untuk diajukan." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("equipment_loans")
      .insert({
        borrower_name: borrowerName,
        phone,
        equipment_slug: slugify(equipment.name),
        equipment_name: equipment.name,
        quantity,
        start_date: startDate,
        return_date: returnDate,
        notes: notes || null,
      })
      .select("id")
      .single();
    if (error) throw error;

    return NextResponse.json({
      requestId: data.id,
      message: "Permintaan terkirim. Petugas kami akan menghubungi Anda untuk konfirmasi.",
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to create equipment loan request:", error);
    return NextResponse.json({ error: "Permintaan belum dapat disimpan. Silakan coba lagi." }, { status: 503 });
  }
}
