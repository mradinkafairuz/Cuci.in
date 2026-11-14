import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { getJakartaDayBounds } from "@/lib/utils/jakarta-day";
import type { Tables } from "@/types/database.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DashboardOrder = Pick<
  Tables<"orders">,
  | "id"
  | "order_code"
  | "customer_name"
  | "customer_message"
  | "contact_phone"
  | "pickup_address"
  | "order_type"
  | "service_id"
  | "service_price_per_kg"
  | "weight_kg"
  | "total_price"
  | "process_status"
  | "payment_status"
  | "capacity_approval_status"
  | "created_at"
  | "pickup_at"
  | "archived_at"
  | "notes"
>;

export async function GET(request: Request) {
  const access = await requireAdmin(request);
  if (!access.ok) return access.response;

  try {
    const supabase = access.supabase;
    const { start, end } = getJakartaDayBounds();
    const [
      servicesResult,
      itemsResult,
      equipmentResult,
      settingsResult,
      customersResult,
      metricsResult,
      recentOrdersResult,
    ] = await Promise.all([
      supabase
        .from("services")
        .select("id, slug, name, description, price_per_kg, estimated_days, is_active, created_at")
        .order("name"),
      supabase
        .from("laundry_items")
        .select("id, slug, name, price, is_active, created_at")
        .order("name"),
      supabase
        .from("b2b_equipment")
        .select("id, name, description, price, price_unit, quantity_available, is_active, created_at")
        .order("name"),
      supabase
        .from("business_settings")
        .select("daily_capacity_kg, is_accepting_orders, business_hours")
        .eq("id", 1)
        .single(),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "pelanggan"),
      supabase.rpc("admin_dashboard_metrics", { p_start: start, p_end: end }).single(),
      supabase
        .from("orders")
        .select("id, order_code, customer_name, customer_message, contact_phone, pickup_address, order_type, service_id, service_price_per_kg, weight_kg, total_price, process_status, payment_status, capacity_approval_status, created_at, pickup_at, archived_at, notes")
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    for (const result of [servicesResult, itemsResult, equipmentResult, settingsResult, customersResult, metricsResult, recentOrdersResult]) {
      if (result.error) throw result.error;
    }
    if (!servicesResult.data || !itemsResult.data || !equipmentResult.data || !settingsResult.data || !metricsResult.data) {
      throw new Error("Admin dashboard query returned no data.");
    }

    const serviceNames = new Map(servicesResult.data.map((service) => [service.id, service.name]));
    const recentOrders = (recentOrdersResult.data as DashboardOrder[]).map((order) => ({
      ...order,
      service_name: order.service_id ? serviceNames.get(order.service_id) ?? "Layanan nonaktif" : "Cuci Satuan",
    }));

    return NextResponse.json(
      {
        recentOrders,
        services: servicesResult.data,
        items: itemsResult.data,
        equipment: equipmentResult.data,
        settings: settingsResult.data,
        stats: {
          revenue: Number(metricsResult.data.paid_revenue),
          totalOrders: Number(metricsResult.data.total_orders),
          customers: customersResult.count ?? 0,
          activeServices: servicesResult.data.filter((service) => service.is_active).length,
          usedTodayKg: Number(metricsResult.data.used_today_kg),
          pendingApprovalCount: Number(metricsResult.data.pending_approval_count),
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to load admin dashboard:", error);
    return NextResponse.json({ error: "Data admin belum dapat dimuat. Silakan coba lagi." }, { status: 503 });
  }
}
