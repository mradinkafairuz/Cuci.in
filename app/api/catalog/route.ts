import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
const dayLabels = [
  ["monday", "Senin"],
  ["tuesday", "Selasa"],
  ["wednesday", "Rabu"],
  ["thursday", "Kamis"],
  ["friday", "Jumat"],
  ["saturday", "Sabtu"],
  ["sunday", "Minggu"],
] as const;

function readHour(value: unknown) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { open: "07:00", close: "20:00", closed: true };
  }
  const record = value as Record<string, unknown>;
  return {
    open: typeof record.open === "string" ? record.open : "07:00",
    close: typeof record.close === "string" ? record.close : "20:00",
    closed: typeof record.closed === "boolean" ? record.closed : true,
  };
}

function readHourForDay(value: unknown, key: string) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return readHour(null);
  }
  return readHour((value as Record<string, unknown>)[key]);
}

function getServiceIcon(name: string): "wash" | "iron" | "full" | "express" {
  const normalized = name.toLowerCase();
  if (normalized.includes("express") || normalized.includes("kilat")) return "express";
  if (normalized.includes("setrika") && !normalized.includes("cuci")) return "iron";
  if (normalized.includes("setrika")) return "full";
  return "wash";
}

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const [servicesResult, itemsResult, equipmentResult, settingsResult] = await Promise.all([
      supabase
        .from("services")
        .select("id, slug, name, description, price_per_kg, estimated_days")
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("laundry_items")
        .select("id, slug, name, processing_method, price")
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("b2b_equipment")
        .select("id, name, description, price, price_unit, quantity_available")
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("business_settings")
        .select("business_hours")
        .eq("id", 1)
        .single(),
    ]);

    if (servicesResult.error) throw servicesResult.error;
    if (itemsResult.error) throw itemsResult.error;
    if (equipmentResult.error) throw equipmentResult.error;
    if (settingsResult.error) throw settingsResult.error;

    return NextResponse.json(
      {
        services: servicesResult.data.map((service) => ({
          id: service.id,
          slug: service.slug,
          name: service.name,
          description: service.description,
          pricePerKg: Number(service.price_per_kg),
          estimateDays: service.estimated_days,
          icon: getServiceIcon(service.name),
        })),
        items: (itemsResult.data ?? []).map((item) => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          processingMethod: item.processing_method,
          price: Number(item.price),
        })),
        equipment: equipmentResult.data.map((equipment) => ({
          id: equipment.id,
          name: equipment.name,
          description: equipment.description,
          price: equipment.price === null ? null : Number(equipment.price),
          priceUnit: equipment.price_unit,
          quantityAvailable: equipment.quantity_available,
        })),
        businessHours: dayLabels.map(([key, day]) => ({
          day,
          ...readHourForDay(settingsResult.data.business_hours, key),
        })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to load Supabase laundry catalog:", error);
    return NextResponse.json(
      { error: "Katalog belum dapat dimuat. Silakan coba lagi." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
