import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import type { Json } from "@/types/database.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
type BusinessHours = Record<(typeof weekdays)[number], { open: string; close: string; closed: boolean }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBusinessHours(value: unknown): value is BusinessHours {
  if (!isRecord(value)) return false;
  return weekdays.every((day) => {
    const hours = value[day];
    return isRecord(hours)
      && typeof hours.open === "string"
      && /^([01]\d|2[0-3]):[0-5]\d$/.test(hours.open)
      && typeof hours.close === "string"
      && /^([01]\d|2[0-3]):[0-5]\d$/.test(hours.close)
      && typeof hours.closed === "boolean";
  });
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
  if (!isRecord(body)) return NextResponse.json({ error: "Pengaturan tidak valid." }, { status: 400 });

  const update: {
    daily_capacity_kg?: number;
    is_accepting_orders?: boolean;
    business_hours?: Json;
    updated_at: string;
  } = { updated_at: new Date().toISOString() };

  if (body.dailyCapacityKg !== undefined) {
    if (typeof body.dailyCapacityKg !== "number" || !Number.isFinite(body.dailyCapacityKg) || body.dailyCapacityKg < 1 || body.dailyCapacityKg > 100_000) {
      return NextResponse.json({ error: "Kuota harian harus antara 1 sampai 100.000 kg." }, { status: 400 });
    }
    update.daily_capacity_kg = body.dailyCapacityKg;
  }
  if (body.isAcceptingOrders !== undefined) {
    if (typeof body.isAcceptingOrders !== "boolean") return NextResponse.json({ error: "Status penerimaan pesanan tidak valid." }, { status: 400 });
    update.is_accepting_orders = body.isAcceptingOrders;
  }
  if (body.businessHours !== undefined) {
    if (!isBusinessHours(body.businessHours)) return NextResponse.json({ error: "Format jam operasional tidak valid." }, { status: 400 });
    update.business_hours = body.businessHours as Json;
  }
  if (Object.keys(update).length === 1) return NextResponse.json({ error: "Tidak ada pengaturan yang diubah." }, { status: 400 });

  try {
    const { error } = await access.supabase.from("business_settings").update(update).eq("id", 1);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update business settings:", error);
    return NextResponse.json({ error: "Pengaturan bisnis tidak dapat disimpan." }, { status: 503 });
  }
}
