import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const loanStatuses = ["MENUNGGU", "DISETUJUI", "DIKEMBALIKAN", "DITOLAK"] as const;
type LoanStatus = (typeof loanStatuses)[number];

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function GET(request: Request) {
  const access = await requireAdmin(request);
  if (!access.ok) return access.response;

  const url = new URL(request.url);
  const page = Math.max(1, Math.min(100_000, Number(url.searchParams.get("page") ?? 1)));
  if (!Number.isInteger(page)) return NextResponse.json({ error: "Nomor halaman tidak valid." }, { status: 400 });
  const pageSize = 30;

  try {
    const { data, error } = await access.supabase
      .from("equipment_loans")
      .select("id, borrower_name, phone, equipment_name, quantity, start_date, return_date, notes, status, created_at")
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize);
    if (error) throw error;
    const hasMore = data.length > pageSize;
    return NextResponse.json({
      requests: data.slice(0, pageSize),
      page,
      pageSize,
      hasMore,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to load equipment loan requests:", error);
    return NextResponse.json({ error: "Daftar peminjaman belum dapat dimuat." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const access = await requireAdmin(request);
  if (!access.ok) return access.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 });
  }
  if (!isRecord(body) || !isUuid(body.id) || !loanStatuses.includes(body.status as LoanStatus)) {
    return NextResponse.json({ error: "Status atau ID permintaan tidak valid." }, { status: 400 });
  }

  try {
    const { data, error } = await access.supabase
      .from("equipment_loans")
      .update({ status: body.status as LoanStatus })
      .eq("id", body.id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Permintaan peminjaman tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update equipment loan request:", error);
    return NextResponse.json({ error: "Status peminjaman belum dapat diperbarui." }, { status: 503 });
  }
}
