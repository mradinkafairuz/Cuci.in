import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/session";
import { laundryEquipment } from "@/lib/data/equipment";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isValidIndonesianPhone } from "@/lib/utils/phone";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Permintaan tidak diizinkan." }, { status: 403 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Data peminjaman tidak valid." }, { status: 400 }); }
  const item = laundryEquipment.find((equipment) => equipment.slug === body.equipmentSlug);
  const quantity = Number(body.quantity);
  const startDate = typeof body.startDate === "string" ? body.startDate : "";
  const returnDate = typeof body.returnDate === "string" ? body.returnDate : "";
  const validDate = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  };
  const todayJakarta = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  if (!item || typeof body.borrowerName !== "string" || body.borrowerName.trim().length < 2 || body.borrowerName.trim().length > 120 || typeof body.phone !== "string" || !isValidIndonesianPhone(body.phone) || !Number.isInteger(quantity) || quantity < 1 || quantity > 10 || !validDate(startDate) || !validDate(returnDate) || startDate < todayJakarta || returnDate < startDate) {
    return NextResponse.json({ error: "Periksa kembali nama, nomor WhatsApp, alat, jumlah, dan tanggal peminjaman." }, { status: 400 });
  }
  const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 500) : null;
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("equipment_loans").insert({ borrower_name: body.borrowerName.trim(), phone: body.phone.trim(), equipment_slug: item.slug, equipment_name: item.name, quantity, start_date: startDate, return_date: returnDate, notes }).select("id").single();
    if (error) throw error;
    return NextResponse.json({ ok: true, requestId: data.id, message: "Permintaan peminjaman terkirim. Petugas kami akan menghubungi Anda melalui WhatsApp." }, { status: 201 });
  } catch (error) {
    console.error("Failed to create equipment loan request:", error);
    return NextResponse.json({ error: "Permintaan belum dapat disimpan. Silakan coba lagi." }, { status: 503 });
  }
}

export async function GET() {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Silakan login sebagai admin atau petugas." }, { status: 401 });
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("equipment_loans").select("id, borrower_name, phone, equipment_name, quantity, start_date, return_date, notes, status, created_at").order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    return NextResponse.json({ requests: data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to fetch equipment loan requests:", error);
    return NextResponse.json({ error: "Daftar peminjaman belum dapat dimuat." }, { status: 503 });
  }
}
