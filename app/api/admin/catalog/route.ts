import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import type { Json, TablesInsert } from "@/types/database.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CatalogKind = "service" | "item" | "equipment";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isPrice(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1_000_000_000;
}

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function isPriceUnit(value: unknown): value is "hari" | "minggu" | "bulan" {
  return value === "hari" || value === "minggu" || value === "bulan";
}

function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function readKind(value: unknown): value is CatalogKind {
  return value === "service" || value === "item" || value === "equipment";
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
  if (!isRecord(body) || !readKind(body.kind) || typeof body.name !== "string" || body.name.trim().length < 2 || body.name.trim().length > 120) {
    return NextResponse.json({ error: "Jenis katalog dan nama wajib diisi." }, { status: 400 });
  }

  try {
    const name = body.name.trim();
    if (body.kind === "service") {
      if (!isPrice(body.pricePerKg) || !isInteger(body.estimatedDays) || body.estimatedDays < 1 || body.estimatedDays > 365) {
        return NextResponse.json({ error: "Tarif per kg dan estimasi hari tidak valid." }, { status: 400 });
      }
      const { error } = await access.supabase.from("services").insert({
        name,
        slug: slugify(name),
        description: typeof body.description === "string" ? body.description.trim() : null,
        price_per_kg: body.pricePerKg,
        estimated_days: body.estimatedDays,
        is_active: body.isActive !== false,
      });
      if (error) throw error;
    } else if (body.kind === "item") {
      if (!isPrice(body.price)) return NextResponse.json({ error: "Harga satuan tidak valid." }, { status: 400 });
      const { error } = await access.supabase.from("laundry_items").insert({
        name,
        slug: slugify(name),
        price: body.price,
        is_active: body.isActive !== false,
      });
      if (error) throw error;
    } else {
      if (
        (body.price !== null && body.price !== undefined && !isPrice(body.price))
        || !isInteger(body.quantityAvailable)
        || body.quantityAvailable < 0
        || body.quantityAvailable > 100_000
        || (body.priceUnit !== null && body.priceUnit !== undefined && !isPriceUnit(body.priceUnit))
      ) {
        return NextResponse.json({ error: "Harga, satuan sewa, atau jumlah stok alat tidak valid." }, { status: 400 });
      }
      const { error } = await access.supabase.from("b2b_equipment").insert({
        name,
        description: typeof body.description === "string" ? body.description.trim() : null,
        price: typeof body.price === "number" ? body.price : null,
        price_unit: isPriceUnit(body.priceUnit) ? body.priceUnit : null,
        quantity_available: body.quantityAvailable,
        is_active: body.isActive !== false,
      });
      if (error) throw error;
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to create catalog entry:", error);
    const message = isRecord(error) && error.code === "23505" ? "Nama/slug tersebut sudah digunakan." : "Data katalog tidak dapat dibuat.";
    return NextResponse.json({ error: message }, { status: 400 });
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
  if (!isRecord(body) || !readKind(body.kind) || !isUuid(body.id)) {
    return NextResponse.json({ error: "Jenis katalog atau ID tidak valid." }, { status: 400 });
  }
  if (body.name !== undefined && (typeof body.name !== "string" || body.name.trim().length < 2 || body.name.trim().length > 120)) {
    return NextResponse.json({ error: "Nama harus berisi 2 sampai 120 karakter." }, { status: 400 });
  }
  if (body.isActive !== undefined && typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: "Status ketersediaan tidak valid." }, { status: 400 });
  }

  try {
    if (body.kind === "service") {
      const update: { name?: string; slug?: string; description?: string | null; price_per_kg?: number; estimated_days?: number; is_active?: boolean } = {};
      if (typeof body.name === "string") {
        update.name = body.name.trim();
        update.slug = slugify(update.name);
      }
      if (body.description !== undefined) update.description = typeof body.description === "string" ? body.description.trim() : null;
      if (body.pricePerKg !== undefined) {
        if (!isPrice(body.pricePerKg)) return NextResponse.json({ error: "Tarif per kg tidak valid." }, { status: 400 });
        update.price_per_kg = body.pricePerKg;
      }
      if (body.estimatedDays !== undefined) {
        if (!isInteger(body.estimatedDays) || body.estimatedDays < 1 || body.estimatedDays > 365) {
          return NextResponse.json({ error: "Estimasi hari tidak valid." }, { status: 400 });
        }
        update.estimated_days = body.estimatedDays;
      }
      if (typeof body.isActive === "boolean") update.is_active = body.isActive;
      const { error } = await access.supabase.from("services").update(update).eq("id", body.id);
      if (error) throw error;
    } else if (body.kind === "item") {
      const update: { name?: string; slug?: string; price?: number; is_active?: boolean } = {};
      if (typeof body.name === "string") {
        update.name = body.name.trim();
        update.slug = slugify(update.name);
      }
      if (body.price !== undefined) {
        if (!isPrice(body.price)) return NextResponse.json({ error: "Harga satuan tidak valid." }, { status: 400 });
        update.price = body.price;
      }
      if (typeof body.isActive === "boolean") update.is_active = body.isActive;
      const { error } = await access.supabase.from("laundry_items").update(update).eq("id", body.id);
      if (error) throw error;
    } else {
      const update: { name?: string; description?: string | null; price?: number | null; price_unit?: "hari" | "minggu" | "bulan" | null; quantity_available?: number; is_active?: boolean } = {};
      if (typeof body.name === "string") update.name = body.name.trim();
      if (body.description !== undefined) update.description = typeof body.description === "string" ? body.description.trim() : null;
      if (body.price !== undefined) {
        if (body.price !== null && !isPrice(body.price)) return NextResponse.json({ error: "Harga sewa tidak valid." }, { status: 400 });
        update.price = body.price as number | null;
      }
      if (body.priceUnit !== undefined) {
        if (body.priceUnit !== null && !isPriceUnit(body.priceUnit)) {
          return NextResponse.json({ error: "Satuan sewa tidak valid." }, { status: 400 });
        }
        update.price_unit = isPriceUnit(body.priceUnit) ? body.priceUnit : null;
      }
      if (body.quantityAvailable !== undefined) {
        if (!isInteger(body.quantityAvailable) || body.quantityAvailable < 0 || body.quantityAvailable > 100_000) {
          return NextResponse.json({ error: "Jumlah alat tidak valid." }, { status: 400 });
        }
        update.quantity_available = body.quantityAvailable;
      }
      if (typeof body.isActive === "boolean") update.is_active = body.isActive;
      const { error } = await access.supabase.from("b2b_equipment").update(update).eq("id", body.id);
      if (error) throw error;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update catalog entry:", error);
    const message = isRecord(error) && error.code === "23505" ? "Nama/slug tersebut sudah digunakan." : "Perubahan katalog tidak dapat disimpan.";
    return NextResponse.json({ error: message }, { status: 400 });
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
  if (!isRecord(body)) return NextResponse.json({ error: "Data katalog tidak valid." }, { status: 400 });

  if (
    (body.services !== undefined && !Array.isArray(body.services))
    || (body.items !== undefined && !Array.isArray(body.items))
    || (body.equipment !== undefined && !Array.isArray(body.equipment))
  ) {
    return NextResponse.json({ error: "Format daftar katalog tidak valid." }, { status: 400 });
  }
  const readRows = (value: unknown) => Array.isArray(value) ? value : [];
  const rawServices = readRows(body.services);
  const rawItems = readRows(body.items);
  const rawEquipment = readRows(body.equipment);
  if (rawServices.length > 100 || rawItems.length > 100 || rawEquipment.length > 100) {
    return NextResponse.json({ error: "Simpan maksimal 100 entri per jenis katalog." }, { status: 400 });
  }

  const services: TablesInsert<"services">[] = [];
  const items: TablesInsert<"laundry_items">[] = [];
  const equipment: TablesInsert<"b2b_equipment">[] = [];

  for (const row of rawServices) {
    if (
      !isRecord(row)
      || (row.id !== undefined && !isUuid(row.id))
      || typeof row.name !== "string"
      || row.name.trim().length < 2
      || row.name.trim().length > 120
      || (row.description !== null && typeof row.description !== "string")
      || (typeof row.description === "string" && row.description.length > 1000)
      || !isPrice(row.pricePerKg)
      || !isInteger(row.estimatedDays)
      || row.estimatedDays < 1
      || row.estimatedDays > 365
      || !isTimestamp(row.createdAt)
      || typeof row.isActive !== "boolean"
    ) {
      return NextResponse.json({ error: "Periksa kembali nama, harga, deskripsi, dan estimasi layanan." }, { status: 400 });
    }
    const name = row.name.trim();
    services.push({
      ...(isUuid(row.id) ? { id: row.id } : {}),
      name,
      slug: slugify(name),
      description: typeof row.description === "string" ? row.description.trim() || null : null,
      price_per_kg: row.pricePerKg,
      estimated_days: row.estimatedDays,
      is_active: row.isActive,
      created_at: row.createdAt,
    });
  }

  for (const row of rawItems) {
    if (
      !isRecord(row)
      || (row.id !== undefined && !isUuid(row.id))
      || typeof row.name !== "string"
      || row.name.trim().length < 2
      || row.name.trim().length > 120
      || !isPrice(row.price)
      || !isTimestamp(row.createdAt)
      || typeof row.isActive !== "boolean"
    ) {
      return NextResponse.json({ error: "Periksa kembali nama dan harga layanan satuan." }, { status: 400 });
    }
    const name = row.name.trim();
    items.push({
      ...(isUuid(row.id) ? { id: row.id } : {}),
      name,
      slug: slugify(name),
      price: row.price,
      is_active: row.isActive,
      created_at: row.createdAt,
    });
  }

  for (const row of rawEquipment) {
    if (
      !isRecord(row)
      || (row.id !== undefined && !isUuid(row.id))
      || typeof row.name !== "string"
      || row.name.trim().length < 2
      || row.name.trim().length > 120
      || (row.description !== null && typeof row.description !== "string")
      || (typeof row.description === "string" && row.description.length > 1000)
      || (row.price !== null && row.price !== undefined && !isPrice(row.price))
      || (row.priceUnit !== null && row.priceUnit !== undefined && !isPriceUnit(row.priceUnit))
      || !isInteger(row.quantityAvailable)
      || row.quantityAvailable < 0
      || row.quantityAvailable > 100_000
      || !isTimestamp(row.createdAt)
      || typeof row.isActive !== "boolean"
    ) {
      return NextResponse.json({ error: "Periksa kembali data alat, harga, dan jumlah stok." }, { status: 400 });
    }
    equipment.push({
      ...(isUuid(row.id) ? { id: row.id } : {}),
      name: row.name.trim(),
      description: typeof row.description === "string" ? row.description.trim() || null : null,
      price: typeof row.price === "number" ? row.price : null,
      price_unit: isPriceUnit(row.priceUnit) ? row.priceUnit : null,
      quantity_available: row.quantityAvailable,
      is_active: row.isActive,
      created_at: row.createdAt,
    });
  }

  let settings: {
    daily_capacity_kg?: number;
    is_accepting_orders?: boolean;
    business_hours?: Json;
    updated_at: string;
  } | null = null;
  if (body.settings !== undefined) {
    if (!isRecord(body.settings)) return NextResponse.json({ error: "Pengaturan operasional tidak valid." }, { status: 400 });
    const value = body.settings;
    if (
      typeof value.dailyCapacityKg !== "number"
      || !Number.isFinite(value.dailyCapacityKg)
      || value.dailyCapacityKg < 1
      || value.dailyCapacityKg > 100_000
      || typeof value.isAcceptingOrders !== "boolean"
      || !isBusinessHours(value.businessHours)
    ) {
      return NextResponse.json({ error: "Periksa kembali kuota, status penerimaan, dan jam operasional." }, { status: 400 });
    }
    settings = {
      daily_capacity_kg: value.dailyCapacityKg,
      is_accepting_orders: value.isAcceptingOrders,
      business_hours: value.businessHours as Json,
      updated_at: new Date().toISOString(),
    };
  }

  if (!services.length && !items.length && !equipment.length && !settings) {
    return NextResponse.json({ error: "Tidak ada perubahan untuk disimpan." }, { status: 400 });
  }

  try {
    const supabase = access.supabase;
    const results = await Promise.all([
      services.length ? supabase.from("services").upsert(services, { onConflict: "id" }) : Promise.resolve({ error: null }),
      items.length ? supabase.from("laundry_items").upsert(items, { onConflict: "id" }) : Promise.resolve({ error: null }),
      equipment.length ? supabase.from("b2b_equipment").upsert(equipment, { onConflict: "id" }) : Promise.resolve({ error: null }),
      settings ? supabase.from("business_settings").update(settings).eq("id", 1) : Promise.resolve({ error: null }),
    ]);
    const failed = results.find((result) => result.error);
    if (failed?.error) throw failed.error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save admin configuration:", error);
    const message = isRecord(error) && error.code === "23505" ? "Nama layanan tersebut sudah digunakan." : "Pengaturan belum dapat disimpan. Draft lokal tetap tersimpan.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

function isBusinessHours(value: unknown): value is Record<string, { open: string; close: string; closed: boolean }> {
  if (!isRecord(value)) return false;
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  return days.every((day) => {
    const hours = value[day];
    return isRecord(hours)
      && typeof hours.open === "string"
      && /^([01]\d|2[0-3]):[0-5]\d$/.test(hours.open)
      && typeof hours.close === "string"
      && /^([01]\d|2[0-3]):[0-5]\d$/.test(hours.close)
      && typeof hours.closed === "boolean";
  });
}
