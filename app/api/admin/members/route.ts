import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const access = await requireAdmin(request);
  if (!access.ok) return access.response;

  try {
    const { data, error } = await access.supabase
      .from("memberships")
      .select("id, member_code, full_name, phone, email, package_code, package_name, monthly_price, discount_percent, status, is_active, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({ members: data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to load Cuci.in memberships:", error);
    return NextResponse.json({ error: "Daftar member belum dapat dimuat." }, { status: 503 });
  }
}
