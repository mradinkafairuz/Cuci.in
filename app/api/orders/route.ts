import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isValidIndonesianPhone } from "@/lib/utils/phone";
import type { OrderTracking } from "@/types";

export const runtime = "nodejs";
const ORDER_CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function generateOrderCode(): string {
  const bytes = randomBytes(5);
  let buffer = 0;
  let bits = 0;
  let code = "";
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      code += ORDER_CODE_ALPHABET[(buffer >> bits) & 31];
      buffer &= (1 << bits) - 1;
    }
  }
  return `LDR-${code.slice(0, 4)}-${code.slice(4)}`;
}

type ContactDetails = {
  customerName: string;
  phone: string;
  pickupAddress: string;
};

type CreateOrderInput = ContactDetails & (
  | { orderType: "KILOAN"; serviceId: string }
  | { orderType: "SATUAN"; itemId: string; quantity: number }
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseInput(value: unknown): CreateOrderInput | null {
  if (!isRecord(value)) return null;
  const { orderType, customerName, phone, pickupAddress } = value;
  if (
    (orderType !== "KILOAN" && orderType !== "SATUAN")
    || typeof customerName !== "string"
    || customerName.trim().length < 2
    || customerName.trim().length > 120
    || typeof phone !== "string"
    || !isValidIndonesianPhone(phone)
    || typeof pickupAddress !== "string"
    || pickupAddress.trim().length < 8
    || pickupAddress.trim().length > 1000
  ) {
    return null;
  }

  const contactDetails = {
    customerName: customerName.trim(),
    phone: phone.trim(),
    pickupAddress: pickupAddress.trim(),
  };

  if (
    orderType === "KILOAN"
    && typeof value.serviceId === "string"
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.serviceId)
  ) {
    return {
      orderType,
      ...contactDetails,
      serviceId: value.serviceId,
    };
  }

  if (
    orderType === "SATUAN"
    && typeof value.itemId === "string"
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.itemId)
    && typeof value.quantity === "number"
    && Number.isInteger(value.quantity)
    && value.quantity >= 1
    && value.quantity <= 99
  ) {
    return {
      orderType,
      ...contactDetails,
      itemId: value.itemId,
      quantity: value.quantity,
    };
  }

  return null;
}

function formatEstimatedDone(date: string | null): string {
  return date
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(date))
    : "Menunggu konfirmasi";
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Permintaan tidak diizinkan." }, { status: 403 });
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 10_000) {
    return NextResponse.json({ error: "Data pesanan terlalu besar." }, { status: 413 });
  }

  let input: CreateOrderInput | null;
  try {
    input = parseInput(await request.json());
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 });
  }

  if (!input) {
    return NextResponse.json({ error: "Periksa kembali data pesanan Anda." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    let serviceId: string | null = null;
    let serviceName = "Cuci Satuan";
    let estimatedDoneAt: string | null = null;
    let totalPrice: number | null = null;
    let orderItem: { itemId: string; itemName: string; unitPrice: number; quantity: number } | null = null;

    if (input.orderType === "KILOAN") {
      const { data: service, error } = await supabase
        .from("services")
        .select("id, name, estimated_days")
        .eq("id", input.serviceId)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!service) {
        return NextResponse.json({ error: "Layanan tidak tersedia. Muat ulang halaman dan coba lagi." }, { status: 400 });
      }

      serviceId = service.id;
      serviceName = service.name;
      const estimate = new Date();
      estimate.setDate(estimate.getDate() + service.estimated_days);
      estimatedDoneAt = estimate.toISOString();
    } else {
      const { data: item, error } = await supabase
        .from("laundry_items")
        .select("id, name, price")
        .eq("id", input.itemId)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!item) {
        return NextResponse.json({ error: "Jenis cucian tidak tersedia. Muat ulang halaman dan coba lagi." }, { status: 400 });
      }

      const quantity = input.quantity;
      const unitPrice = Number(item.price);
      totalPrice = unitPrice * quantity;
      serviceName = `${item.name} (${quantity} item)`;
      orderItem = { itemId: item.id, itemName: item.name, unitPrice, quantity };
    }

    let createdOrder: { id: string; order_code: string } | null = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const orderCode = generateOrderCode();
      const { data, error } = await supabase
        .from("orders")
        .insert({
          order_code: orderCode,
          customer_id: null,
          customer_name: input.customerName,
          contact_phone: input.phone,
          pickup_address: input.pickupAddress,
          service_id: serviceId,
          order_type: input.orderType,
          process_status: "MENUNGGU",
          payment_status: "UNPAID",
          weight_kg: null,
          total_price: totalPrice,
          estimated_done_at: estimatedDoneAt,
        })
        .select("id, order_code")
        .single();

      if (!error) {
        createdOrder = data;
        break;
      }
      if (error.code !== "23505" || attempt === 2) throw error;
    }

    if (!createdOrder) throw new Error("Could not reserve a unique order code.");

    if (orderItem) {
      const { error } = await supabase.from("order_items").insert({
        order_id: createdOrder.id,
        item_id: orderItem.itemId,
        item_name: orderItem.itemName,
        unit_price: orderItem.unitPrice,
        quantity: orderItem.quantity,
      });

      if (error) {
        const { error: cleanupError } = await supabase.from("orders").delete().eq("id", createdOrder.id);
        if (cleanupError) {
          console.error("Failed to remove incomplete laundry order:", cleanupError);
        }
        throw error;
      }
    }

    const order: OrderTracking = {
      code: createdOrder.order_code,
      customerName: input.customerName,
      phone: input.phone,
      pickupAddress: input.pickupAddress,
      serviceName,
      status: "menunggu",
      paymentStatus: "belum_bayar",
      weightKg: null,
      total: totalPrice,
      estimatedDone: formatEstimatedDone(estimatedDoneAt),
    };

    return NextResponse.json({ order }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to create Supabase laundry order:", error);
    return NextResponse.json(
      { error: "Pesanan belum dapat disimpan. Silakan coba lagi." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
