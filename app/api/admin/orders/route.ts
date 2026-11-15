import { NextResponse } from "next/server";
import { requireAdmin, requireStaffOrAdmin } from "@/lib/supabase/admin-auth";
import { generateOrderCode } from "@/lib/utils/generate-order-code";
import { isValidIndonesianPhone } from "@/lib/utils/phone";
import type { OrderProcessStatus } from "@/types/database.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const processStatuses: OrderProcessStatus[] = [
  "MENUNGGU",
  "DITERIMA",
  "DIPROSES",
  "DICUCI",
  "DISETRIKA",
  "SIAP_DIAMBIL",
  "SELESAI",
  "DIBATALKAN",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: Request) {
  const access = await requireAdmin(request);
  if (!access.ok) return access.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 });
  }
  if (!isRecord(body) || !isUuid(body.serviceId)) {
    return NextResponse.json({ error: "Pilih layanan yang valid." }, { status: 400 });
  }
  if (
    typeof body.customerName !== "string"
    || body.customerName.trim().length < 2
    || body.customerName.trim().length > 120
    || typeof body.phone !== "string"
    || !isValidIndonesianPhone(body.phone)
    || typeof body.pickupAddress !== "string"
    || body.pickupAddress.trim().length < 8
    || body.pickupAddress.trim().length > 1000
  ) {
    return NextResponse.json({ error: "Periksa kembali nama, nomor WhatsApp, dan alamat pelanggan." }, { status: 400 });
  }

  try {
    const supabase = access.supabase;
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("id, name, price_per_kg, estimated_days")
      .eq("id", body.serviceId)
      .eq("is_active", true)
      .maybeSingle();
    if (serviceError) throw serviceError;
    if (!service) return NextResponse.json({ error: "Layanan tidak tersedia." }, { status: 400 });

    let order: { id: string; order_code: string } | null = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          order_code: generateOrderCode(),
          customer_id: null,
          customer_name: body.customerName.trim(),
          contact_phone: body.phone.trim(),
          pickup_address: body.pickupAddress.trim(),
          service_id: service.id,
          service_price_per_kg: Number(service.price_per_kg),
          order_type: "KILOAN",
          process_status: "DITERIMA",
          payment_status: "UNPAID",
          capacity_approval_status: "NOT_REQUIRED",
          estimated_done_at: new Date(Date.now() + service.estimated_days * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select("id, order_code")
        .single();
      if (!error) {
        order = data;
        break;
      }
      if (error.code !== "23505" || attempt === 2) throw error;
    }
    if (!order) throw new Error("Could not reserve a unique order code.");
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Failed to create admin order:", error);
    return NextResponse.json({ error: "Pesanan tidak dapat dibuat." }, { status: 503 });
  }
}

export async function GET(request: Request) {
  const access = await requireStaffOrAdmin(request);
  if (!access.ok) return access.response;

  const params = new URL(request.url).searchParams;
  const page = Number(params.get("page") ?? 1);
  const pageSize = 30;
  const status = params.get("status") ?? "ALL";
  const includeArchived = access.role === "admin" && params.get("includeArchived") === "true";
  const search = (params.get("search") ?? "").replace(/[^a-zA-Z0-9\s@+.-]/g, "").trim().slice(0, 80);
  if (!Number.isInteger(page) || page < 1 || page > 100_000) {
    return NextResponse.json({ error: "Nomor halaman tidak valid." }, { status: 400 });
  }
  if (status !== "ALL" && !processStatuses.includes(status as OrderProcessStatus)) {
    return NextResponse.json({ error: "Filter status tidak valid." }, { status: 400 });
  }

  try {
    let query = access.supabase
      .from("orders")
      .select("id, order_code, customer_name, customer_message, contact_phone, pickup_address, order_type, service_id, service_price_per_kg, weight_kg, total_price, process_status, payment_status, capacity_approval_status, created_at, pickup_at, archived_at, notes")
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize);
    if (!includeArchived) query = query.is("archived_at", null);
    if (status !== "ALL") query = query.eq("process_status", status as OrderProcessStatus);
    if (search) query = query.or(`order_code.ilike.%${search}%,customer_name.ilike.%${search}%,contact_phone.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    const hasMore = data.length > pageSize;
    const pageOrders = data.slice(0, pageSize);
    const serviceIds = [...new Set(pageOrders.flatMap((order) => order.service_id ? [order.service_id] : []))];
    const serviceNames = new Map<string, string>();
    if (serviceIds.length) {
      const { data: services, error: serviceError } = await access.supabase
        .from("services")
        .select("id, name")
        .in("id", serviceIds);
      if (serviceError) throw serviceError;
      for (const service of services) serviceNames.set(service.id, service.name);
    }

    return NextResponse.json({
      orders: pageOrders.map((order) => ({
        ...order,
        service_name: order.service_id ? serviceNames.get(order.service_id) ?? "Layanan nonaktif" : "Cuci Satuan",
      })),
      page,
      pageSize,
      hasMore,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to load order page:", error);
    return NextResponse.json({ error: "Daftar pesanan belum dapat dimuat." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const access = await requireStaffOrAdmin(request);
  if (!access.ok) return access.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 });
  }
  if (!isRecord(body) || !isUuid(body.id)) {
    return NextResponse.json({ error: "ID pesanan tidak valid." }, { status: 400 });
  }
  if (access.role === "petugas" && body.approvalStatus !== undefined) {
    return NextResponse.json({ error: "Persetujuan kuota hanya dapat diatur oleh admin." }, { status: 403 });
  }

  const update: {
    process_status?: OrderProcessStatus;
    payment_status?: "UNPAID" | "PAID";
    capacity_approval_status?: "NOT_REQUIRED" | "PENDING" | "APPROVED" | "REJECTED";
    weight_kg?: number | null;
    total_price?: number | null;
    paid_at?: string | null;
    archived_at?: string | null;
    customer_message?: string | null;
  } = {};
  if (body.customerMessage !== undefined) {
    if (typeof body.customerMessage !== "string" || body.customerMessage.trim().length > 500) {
      return NextResponse.json({ error: "Pesan untuk pelanggan maksimal 500 karakter." }, { status: 400 });
    }
    update.customer_message = body.customerMessage.trim() || null;
  }
  if (body.processStatus !== undefined) {
    if (!processStatuses.includes(body.processStatus as OrderProcessStatus)) {
      return NextResponse.json({ error: "Status pesanan tidak valid." }, { status: 400 });
    }
    update.process_status = body.processStatus as OrderProcessStatus;
  }
  if (body.paymentStatus !== undefined) {
    if (body.paymentStatus !== "PAID" && body.paymentStatus !== "UNPAID") {
      return NextResponse.json({ error: "Status pembayaran tidak valid." }, { status: 400 });
    }
    update.payment_status = body.paymentStatus;
  }
  if (body.weightKg !== undefined) {
    if (body.weightKg !== null && (typeof body.weightKg !== "number" || !Number.isFinite(body.weightKg) || body.weightKg <= 0 || body.weightKg > 1000)) {
      return NextResponse.json({ error: "Berat harus lebih dari 0 dan maksimal 1000 kg." }, { status: 400 });
    }
    update.weight_kg = body.weightKg;
  }
  if (body.approvalStatus !== undefined) {
    if (!["NOT_REQUIRED", "PENDING", "APPROVED", "REJECTED"].includes(String(body.approvalStatus))) {
      return NextResponse.json({ error: "Status persetujuan kuota tidak valid." }, { status: 400 });
    }
    update.capacity_approval_status = body.approvalStatus as typeof update.capacity_approval_status;
    if (body.approvalStatus === "APPROVED") update.process_status = "DITERIMA";
    if (body.approvalStatus === "REJECTED") update.process_status = "DIBATALKAN";
  }
  if (body.paymentStatus === "PAID") update.paid_at = new Date().toISOString();
  if (body.paymentStatus === "UNPAID") update.paid_at = null;
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan pesanan." }, { status: 400 });
  }

  try {
    const { data: current, error: currentError } = await access.supabase
      .from("orders")
      .select("id, process_status, service_id, service_price_per_kg, weight_kg, capacity_approval_status")
      .eq("id", body.id)
      .is("archived_at", null)
      .maybeSingle();
    if (currentError) throw currentError;
    if (!current) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    if (
      access.role === "petugas"
      && current.capacity_approval_status === "PENDING"
      && update.process_status !== undefined
      && update.process_status !== "MENUNGGU"
      && update.process_status !== "DIBATALKAN"
    ) {
      return NextResponse.json({ error: "Pesanan ini perlu disetujui admin sebelum diproses." }, { status: 403 });
    }

    if (body.weightKg !== undefined) {
      if (body.weightKg === null) {
        update.total_price = null;
      } else {
        let pricePerKg = current.service_price_per_kg;
        if (pricePerKg === null && current.service_id) {
          const { data: service, error } = await access.supabase.from("services").select("price_per_kg").eq("id", current.service_id).single();
          if (error) throw error;
          pricePerKg = service.price_per_kg;
        }
        update.total_price = pricePerKg === null ? null : Math.round(Number(pricePerKg) * body.weightKg * 100) / 100;
      }
    }

    const nextStatus = update.process_status;
    const { error: updateError } = await access.supabase.from("orders").update(update).eq("id", body.id);
    if (updateError) throw updateError;

    if (nextStatus && nextStatus !== current.process_status) {
      const { error: logError } = await access.supabase.from("order_logs").insert({
        order_id: body.id,
        changed_by: access.user.id,
        old_status: current.process_status,
        new_status: nextStatus,
      });
      if (logError) throw logError;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update admin order:", error);
    return NextResponse.json({ error: "Perubahan pesanan tidak dapat disimpan." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const access = await requireAdmin(request);
  if (!access.ok) return access.response;
  const id = new URL(request.url).searchParams.get("id");
  if (!isUuid(id)) return NextResponse.json({ error: "ID pesanan tidak valid." }, { status: 400 });

  try {
    const { data: order, error: loadError } = await access.supabase
      .from("orders")
      .select("process_status, capacity_approval_status")
      .eq("id", id)
      .is("archived_at", null)
      .maybeSingle();
    if (loadError) throw loadError;
    if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });

    const { error: updateError } = await access.supabase
      .from("orders")
      .update({
        archived_at: new Date().toISOString(),
        process_status: "DIBATALKAN",
        capacity_approval_status: order.capacity_approval_status === "PENDING" ? "REJECTED" : order.capacity_approval_status,
      })
      .eq("id", id);
    if (updateError) throw updateError;
    if (order.process_status !== "DIBATALKAN") {
      const { error: logError } = await access.supabase.from("order_logs").insert({
        order_id: id,
        changed_by: access.user.id,
        old_status: order.process_status,
        new_status: "DIBATALKAN",
        note: "Pesanan diarsipkan oleh admin.",
      });
      if (logError) throw logError;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to archive admin order:", error);
    return NextResponse.json({ error: "Pesanan tidak dapat diarsipkan." }, { status: 503 });
  }
}
