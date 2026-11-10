import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

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
    const [servicesResult, itemsResult] = await Promise.all([
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
    ]);

    if (servicesResult.error) throw servicesResult.error;

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
        catalogWarning: itemsResult.error
          ? "Katalog cuci satuan belum tersedia. Pastikan migrasi katalog Supabase sudah dijalankan."
          : null,
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
