import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await createSupabaseAdminClient()
      .from("membership_plans")
      .select("id, code, name, description, monthly_price, discount_percent, priority_queue, is_active, created_at, updated_at")
      .eq("is_active", true)
      .order("monthly_price", { ascending: true });
    if (error) throw error;

    return NextResponse.json({ plans: data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to load membership plans:", error);
    return NextResponse.json({ error: "Paket membership belum dapat dimuat." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
