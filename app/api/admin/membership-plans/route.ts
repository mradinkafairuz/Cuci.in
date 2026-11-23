import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import type { MembershipPlanCode } from "@/lib/membership";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PlanUpdate = {
  id: string;
  code: MembershipPlanCode;
  name: string;
  description: string;
  monthly_price: number;
  discount_percent: number;
  priority_queue: boolean;
  is_active: boolean;
  updated_at: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validCode(value: unknown): value is MembershipPlanCode {
  return value === "hemat" || value === "prioritas";
}

function validUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET(request: Request) {
  const access = await requireAdmin(request);
  if (!access.ok) return access.response;

  try {
    const { data, error } = await access.supabase
      .from("membership_plans")
      .select("id, code, name, description, monthly_price, discount_percent, priority_queue, is_active, created_at, updated_at")
      .order("monthly_price", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ plans: data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to load admin membership plans:", error);
    return NextResponse.json({ error: "Paket membership belum dapat dimuat." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const access = await requireAdmin(request);
  if (!access.ok) return access.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 });
  }
  if (!isRecord(body) || !Array.isArray(body.plans) || body.plans.length !== 2) {
    return NextResponse.json({ error: "Kedua paket membership harus dikirim untuk disimpan." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const codes = new Set<string>();
  const plans: PlanUpdate[] = [];
  for (const raw of body.plans) {
    if (
      !isRecord(raw)
      || !validUuid(raw.id)
      || !validCode(raw.code)
      || codes.has(raw.code)
      || typeof raw.name !== "string"
      || raw.name.trim().length < 2
      || raw.name.trim().length > 60
      || typeof raw.description !== "string"
      || raw.description.trim().length < 2
      || raw.description.trim().length > 350
      || typeof raw.monthly_price !== "number"
      || !Number.isInteger(raw.monthly_price)
      || raw.monthly_price < 1
      || raw.monthly_price > 100_000_000
      || typeof raw.discount_percent !== "number"
      || !Number.isInteger(raw.discount_percent)
      || raw.discount_percent < 0
      || raw.discount_percent > 100
      || typeof raw.priority_queue !== "boolean"
      || typeof raw.is_active !== "boolean"
    ) {
      return NextResponse.json({ error: "Periksa nama, deskripsi, harga, diskon, dan status kedua paket." }, { status: 400 });
    }

    codes.add(raw.code);
    plans.push({
      id: raw.id,
      code: raw.code,
      name: raw.name.trim(),
      description: raw.description.trim(),
      monthly_price: raw.monthly_price,
      discount_percent: raw.discount_percent,
      priority_queue: raw.priority_queue,
      is_active: raw.is_active,
      updated_at: now,
    });
  }

  if (!codes.has("hemat") || !codes.has("prioritas")) {
    return NextResponse.json({ error: "Pastikan paket Hemat dan Prioritas sama-sama tersedia." }, { status: 400 });
  }

  try {
    const { error } = await access.supabase.from("membership_plans").upsert(plans, { onConflict: "id" });
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save admin membership plans:", error);
    return NextResponse.json({ error: "Perubahan paket membership belum dapat disimpan." }, { status: 503 });
  }
}
