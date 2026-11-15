"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, ClipboardList, LogOut, Plus, RefreshCw, Users, WashingMachine } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EquipmentLoanRequestsPanel } from "@/components/admin/EquipmentLoanRequestsPanel";
import { adminRequest } from "@/lib/admin/request";
import { getOperationalRole } from "@/lib/admin/role";
import { formatRupiah } from "@/lib/utils/format";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type ProcessStatus = "MENUNGGU" | "DITERIMA" | "DIPROSES" | "DICUCI" | "DISETRIKA" | "SIAP_DIAMBIL" | "SELESAI" | "DIBATALKAN";
type ApprovalStatus = "NOT_REQUIRED" | "PENDING" | "APPROVED" | "REJECTED";
type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
type BusinessHours = Record<DayKey, { open: string; close: string; closed: boolean }>;

export type AdminOrder = {
  id: string;
  order_code: string;
  customer_name: string | null;
  customer_message: string | null;
  contact_phone: string;
  pickup_address: string;
  order_type: "KILOAN" | "SATUAN";
  service_id: string | null;
  service_name: string;
  service_price_per_kg: number | null;
  weight_kg: number | null;
  total_price: number | null;
  process_status: ProcessStatus;
  payment_status: "UNPAID" | "PAID";
  capacity_approval_status: ApprovalStatus;
  created_at: string;
  pickup_at: string | null;
  archived_at: string | null;
  notes: string | null;
};

export type Service = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  price_per_kg: number;
  estimated_days: number;
  is_active: boolean;
  created_at: string;
};

type LaundryItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  is_active: boolean;
  created_at: string;
};

type Equipment = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_unit: "hari" | "minggu" | "bulan" | null;
  quantity_available: number;
  is_active: boolean;
  created_at: string;
};

type AdminData = {
  recentOrders: AdminOrder[];
  services: Service[];
  items: LaundryItem[];
  equipment: Equipment[];
  settings: {
    daily_capacity_kg: number;
    is_accepting_orders: boolean;
    business_hours: BusinessHours;
  };
  stats: {
    revenue: number;
    totalOrders: number;
    customers: number;
    activeServices: number;
    usedTodayKg: number;
    pendingApprovalCount: number;
  };
};

type ConfigDraft = Pick<AdminData, "services" | "items" | "equipment" | "settings">;

const draftStorageKey = "cuci.in.admin-config-draft.v1";
const statusNames: Record<ProcessStatus, string> = {
  MENUNGGU: "Menunggu",
  DITERIMA: "Diterima",
  DIPROSES: "Diproses",
  DICUCI: "Sedang dicuci",
  DISETRIKA: "Disetrika",
  SIAP_DIAMBIL: "Siap diambil",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

const defaultHours: BusinessHours = {
  monday: { open: "07:00", close: "20:00", closed: false },
  tuesday: { open: "07:00", close: "20:00", closed: false },
  wednesday: { open: "07:00", close: "20:00", closed: false },
  thursday: { open: "07:00", close: "20:00", closed: false },
  friday: { open: "07:00", close: "20:00", closed: false },
  saturday: { open: "07:00", close: "18:00", closed: false },
  sunday: { open: "07:00", close: "18:00", closed: true },
};

const dayLabels: Record<DayKey, string> = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
  sunday: "Minggu",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toConfigDraft(data: AdminData): ConfigDraft {
  return {
    services: data.services.map((service) => ({ ...service })),
    items: data.items.map((item) => ({ ...item })),
    equipment: data.equipment.map((item) => ({ ...item })),
    settings: {
      ...data.settings,
      business_hours: Object.fromEntries(
        Object.entries(data.settings.business_hours ?? defaultHours).map(([day, hours]) => [day, { ...hours }]),
      ) as BusinessHours,
    },
  };
}

function isConfigDraft(value: unknown): value is ConfigDraft {
  if (!isRecord(value) || !Array.isArray(value.services) || !Array.isArray(value.items) || !Array.isArray(value.equipment) || !isRecord(value.settings)) return false;
  const settings = value.settings;
  const businessHours = settings.business_hours;
  if (typeof settings.daily_capacity_kg !== "number" || typeof settings.is_accepting_orders !== "boolean" || !isRecord(businessHours)) return false;
  return Object.keys(defaultHours).every((day) => {
    const hours = businessHours[day];
    return isRecord(hours)
      && typeof hours.open === "string"
      && typeof hours.close === "string"
      && typeof hours.closed === "boolean";
  });
}

function sameRows(left: Record<string, unknown>, right: Record<string, unknown>, fields: string[]) {
  return fields.every((field) => left[field] === right[field]);
}

function getChangedRows<T extends { id: string }>(draftRows: T[], serverRows: T[], fields: string[]) {
  const serverById = new Map(serverRows.map((row) => [row.id, row]));
  return draftRows.filter((row) => {
    const saved = serverById.get(row.id);
    return !saved || !sameRows(row as Record<string, unknown>, saved as Record<string, unknown>, fields);
  });
}

function hasConfigChanges(draft: ConfigDraft, data: AdminData) {
  return getChangedRows(draft.services, data.services, ["name", "description", "price_per_kg", "estimated_days", "is_active"]).length > 0
    || getChangedRows(draft.items, data.items, ["name", "price", "is_active"]).length > 0
    || getChangedRows(draft.equipment, data.equipment, ["name", "description", "price", "price_unit", "quantity_available", "is_active"]).length > 0
    || JSON.stringify(draft.settings) !== JSON.stringify(data.settings);
}

function Notice({ children, error = false }: { children: React.ReactNode; error?: boolean }) {
  return <p role={error ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{children}</p>;
}

export function OrderCard({ order, onPatch, onArchive, canManageAll = true }: {
  order: AdminOrder;
  onPatch: (id: string, payload: Record<string, unknown>) => Promise<void>;
  onArchive?: (id: string) => Promise<void>;
  canManageAll?: boolean;
}) {
  const [weight, setWeight] = useState(order.weight_kg?.toString() ?? "");
  const [customerMessage, setCustomerMessage] = useState(order.customer_message ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCustomerMessage(order.customer_message ?? "");
  }, [order.customer_message]);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Perubahan gagal.");
    } finally {
      setBusy(false);
    }
  }

  return <Card className="p-4 sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-700">{order.order_code} · {order.order_type === "KILOAN" ? "Kiloan" : "Satuan"}</p>
        <h3 className="mt-1 font-bold text-ink">{order.customer_name || "Pelanggan"}</h3>
        <p className="mt-1 text-sm text-muted">{order.service_name} · {new Date(order.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}</p>
        <p className="mt-2 text-sm font-bold text-ink">{order.total_price === null ? "Menunggu penimbangan" : formatRupiah(Number(order.total_price))}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-soft px-3 py-1 text-xs font-bold text-ink">{statusNames[order.process_status]}</span>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${order.payment_status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{order.payment_status === "PAID" ? "Lunas" : "Belum bayar"}</span>
      </div>
    </div>
    {canManageAll && order.capacity_approval_status === "PENDING" && !order.archived_at && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
      <p className="text-sm font-bold text-amber-900">Menunggu persetujuan kuota</p>
      <div className="flex gap-2">
        <button disabled={busy} onClick={() => void run(() => onPatch(order.id, { approvalStatus: "APPROVED" }))} className="min-h-11 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white disabled:opacity-50">Setujui</button>
        <button disabled={busy} onClick={() => void run(() => onPatch(order.id, { approvalStatus: "REJECTED" }))} className="min-h-11 rounded-lg border border-amber-300 px-4 text-sm font-bold text-amber-900 disabled:opacity-50">Tolak</button>
      </div>
    </div>}
    <details className="mt-3 border-t border-soft pt-2">
      <summary className="flex min-h-11 cursor-pointer items-center rounded-lg py-2 text-sm font-bold text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Detail & kelola pesanan</summary>
      <div className="mt-3 space-y-4">
        <div className="rounded-xl bg-soft/40 p-3 text-sm text-muted">
          <p>Kontak: {order.contact_phone}</p>
          <p className="mt-1">Alamat jemput: {order.pickup_address}</p>
          {order.notes && <p className="mt-1">Catatan: {order.notes}</p>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-ink">Status pesanan
            <select
              value={order.process_status}
              disabled={busy || Boolean(order.archived_at) || (!canManageAll && order.capacity_approval_status === "PENDING")}
              onChange={(event) => void run(() => onPatch(order.id, { processStatus: event.target.value }))}
              className="mt-1.5 min-h-11 w-full rounded-lg border border-soft bg-white px-3 disabled:opacity-50"
            >
              {Object.entries(statusNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            {!canManageAll && order.capacity_approval_status === "PENDING" && <span className="mt-1 block text-xs font-normal text-muted">Menunggu persetujuan admin.</span>}
          </label>
          {order.order_type === "KILOAN" && <form onSubmit={(event) => {
            event.preventDefault();
            void run(() => onPatch(order.id, { weightKg: weight ? Number(weight) : null }));
          }} className="text-sm font-semibold text-ink">
            <label>Berat (kg)
              <input type="number" min="0.1" max="1000" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-lg border border-soft px-3" />
            </label>
            <button disabled={busy || !weight || Boolean(order.archived_at)} className="mt-1 min-h-11 text-sm font-bold text-brand-700 disabled:opacity-40">Simpan berat & hitung tagihan</button>
          </form>}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void run(() => onPatch(order.id, { customerMessage }));
          }}
          className="rounded-xl border border-brand-100 bg-brand-50/50 p-3"
        >
          <label htmlFor={`customer-message-${order.id}`} className="block text-sm font-semibold text-ink">
            Pesan untuk pelanggan
          </label>
          <textarea
            id={`customer-message-${order.id}`}
            value={customerMessage}
            maxLength={500}
            rows={3}
            onChange={(event) => setCustomerMessage(event.target.value)}
            placeholder="Contoh: Pesanan sedang dicuci dan diperkirakan selesai besok."
            className="mt-2 w-full resize-y rounded-lg border border-soft bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-muted">{customerMessage.length}/500 karakter · terlihat pada halaman lacak pesanan</span>
            <button
              type="submit"
              disabled={busy || customerMessage.trim() === (order.customer_message ?? "")}
              className="min-h-10 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Simpan pesan
            </button>
          </div>
        </form>
        <div className="flex flex-wrap items-center gap-2">
          <button disabled={busy || Boolean(order.archived_at)} onClick={() => void run(() => onPatch(order.id, { paymentStatus: order.payment_status === "PAID" ? "UNPAID" : "PAID" }))} className="min-h-11 rounded-lg border border-soft px-4 text-sm font-bold text-ink disabled:opacity-50">{order.payment_status === "PAID" ? "Batalkan status lunas" : "Catat pembayaran tunai"}</button>
          {canManageAll && onArchive && !order.archived_at && <button disabled={busy} onClick={() => {
            if (window.confirm("Arsipkan dan batalkan pesanan ini? Riwayat tetap disimpan.")) void run(() => onArchive(order.id));
          }} className="min-h-11 rounded-lg border border-red-200 px-4 text-sm font-bold text-red-700 disabled:opacity-50">Arsipkan</button>}
        </div>
      </div>
    </details>
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  </Card>;
}

function OrderCreator({ services, onCreate }: {
  services: Service[];
  onCreate: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await onCreate({
        customerName: form.get("customerName"),
        phone: form.get("phone"),
        pickupAddress: form.get("pickupAddress"),
        serviceId: form.get("serviceId"),
      });
      formElement.reset();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Pesanan tidak dapat dibuat.");
    } finally {
      setBusy(false);
    }
  }
  return <details className="mb-5 rounded-2xl border border-soft bg-white p-4">
    <summary className="flex min-h-11 cursor-pointer items-center font-bold text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">+ Buat pesanan kiloan</summary>
    <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
      <input required name="customerName" aria-label="Nama pelanggan" placeholder="Nama pelanggan" className="min-h-11 rounded-xl border border-soft px-3 text-sm" />
      <input required name="phone" aria-label="Nomor WhatsApp pelanggan" placeholder="Nomor WhatsApp" className="min-h-11 rounded-xl border border-soft px-3 text-sm" />
      <input required minLength={8} name="pickupAddress" aria-label="Alamat penjemputan" placeholder="Alamat penjemputan" className="min-h-11 rounded-xl border border-soft px-3 text-sm sm:col-span-2" />
      <select required name="serviceId" aria-label="Pilih layanan kiloan" className="min-h-11 rounded-xl border border-soft bg-white px-3 text-sm">
        <option value="">Pilih layanan</option>{services.filter((service) => service.is_active).map((service) => <option key={service.id} value={service.id}>{service.name} · {formatRupiah(service.price_per_kg)}/kg</option>)}
      </select>
      <button disabled={busy} className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? "Menyimpan..." : "Simpan pesanan"}</button>
      {error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{error}</p>}
    </form>
  </details>;
}

export function OrdersPanel({ token, services = [], canManageAll, refreshKey = 0 }: {
  token: string;
  services?: Service[];
  canManageAll: boolean;
  refreshKey?: number;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loanRequestsOpen, setLoanRequestsOpen] = useState(false);
  const [mutationKey, setMutationKey] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      page: String(page),
      status,
      search,
      includeArchived: String(canManageAll && showArchived),
    });
    void adminRequest<{ orders: AdminOrder[]; hasMore: boolean }>(token, `/api/admin/orders?${params}`)
      .then((result) => {
        if (!active) return;
        setOrders(result.orders);
        setHasMore(result.hasMore);
      })
      .catch((failure) => {
        if (active) setError(failure instanceof Error ? failure.message : "Daftar pesanan belum dapat dimuat.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [canManageAll, mutationKey, page, refreshKey, search, showArchived, status, token]);

  async function mutate(method: string, body?: unknown, url = "/api/admin/orders") {
    await adminRequest(token, url, method, body);
    setMutationKey((value) => value + 1);
    if (method === "POST") setPage(1);
  }

  return <section>
    {canManageAll && <OrderCreator services={services} onCreate={(payload) => mutate("POST", payload)} />}
    <div className="mb-4 flex flex-wrap gap-3">
      <input aria-label="Cari pesanan" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Cari kode, nama, atau nomor..." className="min-h-11 min-w-[220px] flex-1 rounded-xl border border-soft bg-white px-3 text-sm" />
      <select aria-label="Filter status pesanan" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="min-h-11 rounded-xl border border-soft bg-white px-3 text-sm">
        <option value="ALL">Semua status</option>{Object.entries(statusNames).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
      {canManageAll && <label className="flex min-h-11 items-center gap-2 rounded-xl border border-soft bg-white px-3 py-2 text-sm"><input type="checkbox" checked={showArchived} onChange={(event) => { setShowArchived(event.target.checked); setPage(1); }} /> Tampilkan arsip</label>}
    </div>
    {error && <div className="mb-4"><Notice error>{error}</Notice><button onClick={() => setMutationKey((value) => value + 1)} className="mt-2 min-h-11 rounded-lg border border-soft px-4 text-sm font-bold">Coba lagi</button></div>}
    {loading
      ? <Card className="py-10 text-center text-sm text-muted">Memuat pesanan...</Card>
      : orders.length
        ? <div className="space-y-3">{orders.map((order) => <OrderCard
          key={order.id}
          order={order}
          canManageAll={canManageAll}
          onPatch={(id, payload) => mutate("PATCH", { id, ...payload })}
          onArchive={canManageAll ? (id) => mutate("DELETE", undefined, `/api/admin/orders?id=${encodeURIComponent(id)}`) : undefined}
        />)}</div>
        : <Card className="py-12 text-center text-sm text-muted">Tidak ada pesanan yang cocok.</Card>}
    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted">
      <span>{orders.length ? `Halaman ${page} · ${orders.length} pesanan` : "Belum ada hasil"}</span>
      <div className="flex gap-2">
        <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} className="min-h-11 rounded-lg border border-soft bg-white px-3 font-semibold disabled:opacity-40">Sebelumnya</button>
        <button type="button" disabled={!hasMore || loading} onClick={() => setPage((value) => value + 1)} className="min-h-11 rounded-lg border border-soft bg-white px-3 font-semibold disabled:opacity-40">Berikutnya</button>
      </div>
    </div>
    {canManageAll && <details className="mt-8 rounded-2xl border border-soft bg-white p-4" onToggle={(event) => setLoanRequestsOpen(event.currentTarget.open)}>
      <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 font-bold text-ink">
        <span>Permintaan peminjaman alat</span>
        <span className="text-sm font-medium text-muted">Hanya admin</span>
      </summary>
      {loanRequestsOpen && <div className="mt-4 border-t border-soft pt-4"><EquipmentLoanRequestsPanel token={token} /></div>}
    </details>}
  </section>;
}

function ServiceForm({ kind, entry, onSave }: {
  kind: "service" | "item";
  entry?: Service | LaundryItem;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload: Record<string, unknown> = {
      kind,
      ...(entry ? { id: entry.id } : {}),
      name: form.get("name"),
      isActive: form.get("isActive") === "on",
    };
    if (kind === "service") {
      payload.description = form.get("description");
      payload.pricePerKg = Number(form.get("price"));
      payload.estimatedDays = Number(form.get("days"));
    } else {
      payload.price = Number(form.get("price"));
    }
    try {
      await onSave(payload);
      if (!entry) formElement.reset();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Data layanan tidak dapat disimpan ke draft.");
    } finally {
      setBusy(false);
    }
  }

  const service = kind === "service" ? entry as Service | undefined : undefined;
  const item = kind === "item" ? entry as LaundryItem | undefined : undefined;
  const form = <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-soft bg-white p-4 sm:grid-cols-2">
    <input required minLength={2} maxLength={120} name="name" aria-label={kind === "service" ? "Nama layanan kiloan" : "Nama jenis cucian"} defaultValue={entry?.name} placeholder={kind === "service" ? "Nama layanan kiloan" : "Nama jenis cucian"} className="min-h-11 rounded-lg border border-soft px-3 text-sm" />
    <input required type="number" min="0" step="100" name="price" aria-label={kind === "service" ? "Tarif per kilogram" : "Harga per item"} defaultValue={service?.price_per_kg ?? item?.price} placeholder={kind === "service" ? "Tarif/kg" : "Harga/item"} className="min-h-11 rounded-lg border border-soft px-3 text-sm" />
    {kind === "service" && <>
      <input name="description" aria-label="Deskripsi layanan" defaultValue={service?.description ?? ""} placeholder="Deskripsi" className="min-h-11 rounded-lg border border-soft px-3 text-sm" />
      <input required type="number" min="1" max="365" name="days" aria-label="Estimasi pengerjaan dalam hari" defaultValue={service?.estimated_days ?? 2} placeholder="Estimasi hari" className="min-h-11 rounded-lg border border-soft px-3 text-sm" />
    </>}
    <label className="flex min-h-11 items-center gap-2 text-sm text-muted"><input type="checkbox" name="isActive" defaultChecked={entry?.is_active ?? true} /> Tersedia untuk dipesan</label>
    <button disabled={busy} className="min-h-11 rounded-lg border border-brand-500 px-4 text-sm font-bold text-brand-700 disabled:opacity-50">{busy ? "Menyimpan lokal..." : entry ? "Simpan ke draft lokal" : "Tambah ke draft lokal"}</button>
    {error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{error}</p>}
  </form>;

  const price = entry
    ? kind === "service"
      ? `${formatRupiah(service?.price_per_kg ?? 0)}/kg`
      : `${formatRupiah(item?.price ?? 0)}/item`
    : "";
  const title = entry ? `${entry.name} · ${price}` : kind === "service" ? "Tambah layanan kiloan" : "Tambah jenis cucian";

  return <details className="rounded-2xl border border-soft bg-white">
    <summary aria-label={entry ? `Edit ${entry.name}` : title} className="flex min-h-12 cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
      {entry ? <span>{title}</span> : <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-brand-500/10 text-brand-700"><Plus size={19} /></span>}
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${entry?.is_active === false ? "bg-soft text-muted" : "bg-emerald-50 text-emerald-700"}`}>
        {entry?.is_active === false ? "Nonaktif" : entry ? "Aktif" : <span className="sr-only">{title}</span>}
      </span>
    </summary>
    <div className="border-t border-soft p-3">{form}</div>
  </details>;
}

function EquipmentForm({ entry, onSave }: {
  entry?: Equipment;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const priceValue = String(form.get("price") ?? "");
    try {
      await onSave({
        kind: "equipment",
        ...(entry ? { id: entry.id } : {}),
        name: form.get("name"),
        description: form.get("description"),
        price: priceValue ? Number(priceValue) : null,
        priceUnit: form.get("priceUnit") || null,
        quantityAvailable: Number(form.get("quantity")),
        isActive: form.get("isActive") === "on",
      });
      if (!entry) formElement.reset();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Data alat tidak dapat disimpan ke draft.");
    } finally {
      setBusy(false);
    }
  }
  const form = <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-soft bg-white p-4 sm:grid-cols-2">
    <input required minLength={2} maxLength={120} name="name" aria-label="Nama alat" defaultValue={entry?.name} placeholder="Nama alat" className="min-h-11 rounded-lg border border-soft px-3 text-sm" />
    <input name="description" aria-label="Deskripsi atau spesifikasi alat" defaultValue={entry?.description ?? ""} placeholder="Deskripsi/spesifikasi" className="min-h-11 rounded-lg border border-soft px-3 text-sm" />
    <input type="number" min="0" step="1000" name="price" aria-label="Harga sewa alat" defaultValue={entry?.price ?? ""} placeholder="Harga sewa (kosong = Tanya ke admin)" className="min-h-11 rounded-lg border border-soft px-3 text-sm" />
    <select name="priceUnit" aria-label="Satuan harga sewa" defaultValue={entry?.price_unit ?? ""} className="min-h-11 rounded-lg border border-soft bg-white px-3 text-sm"><option value="">Pilih satuan harga</option><option value="hari">Per hari</option><option value="minggu">Per minggu</option><option value="bulan">Per bulan</option></select>
    <input required type="number" min="0" max="100000" name="quantity" aria-label="Jumlah stok alat tersedia" defaultValue={entry?.quantity_available ?? 0} placeholder="Stok tersedia" className="min-h-11 rounded-lg border border-soft px-3 text-sm" />
    <label className="flex min-h-11 items-center gap-2 text-sm text-muted"><input type="checkbox" name="isActive" defaultChecked={entry?.is_active ?? true} /> Tampilkan di peminjaman alat</label>
    <button disabled={busy} className="min-h-11 rounded-lg border border-brand-500 px-4 text-sm font-bold text-brand-700 disabled:opacity-50">{busy ? "Menyimpan lokal..." : entry ? "Simpan ke draft lokal" : "Tambah ke draft lokal"}</button>
    {error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{error}</p>}
  </form>;

  return <details className="rounded-2xl border border-soft bg-white">
    <summary aria-label={entry ? `Edit ${entry.name}` : "Tambah alat"} className="flex min-h-12 cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
      {entry ? <span>{entry.name} · {entry.quantity_available} tersedia</span> : <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-brand-500/10 text-brand-700"><Plus size={19} /></span>}
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${entry?.is_active === false ? "bg-soft text-muted" : "bg-emerald-50 text-emerald-700"}`}>
        {entry?.is_active === false ? "Disembunyikan" : entry ? "Tampil" : <span className="sr-only">Tambah alat</span>}
      </span>
    </summary>
    <div className="border-t border-soft p-3">{form}</div>
  </details>;
}

function ServicesPanel({ draft, onSave }: {
  draft: ConfigDraft;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
}) {
  return <div className="space-y-8">
    <section>
      <h2 className="mb-3 text-lg font-bold text-ink">Layanan kiloan</h2>
      <div className="space-y-2">{draft.services.map((service) => <ServiceForm key={`${service.id}-${service.name}-${service.price_per_kg}-${service.estimated_days}-${service.is_active}`} kind="service" entry={service} onSave={onSave} />)}<ServiceForm kind="service" onSave={onSave} /></div>
    </section>
    <section>
      <h2 className="mb-3 text-lg font-bold text-ink">Cuci satuan</h2>
      <div className="space-y-2">{draft.items.map((item) => <ServiceForm key={`${item.id}-${item.name}-${item.price}-${item.is_active}`} kind="item" entry={item} onSave={onSave} />)}<ServiceForm kind="item" onSave={onSave} /></div>
    </section>
    <section>
      <h2 className="mb-2 text-lg font-bold text-ink">Peminjaman alat</h2>
      <p className="mb-3 text-sm text-muted">Atur jenis alat, harga, jumlah, dan ketersediaan. Harga kosong ditampilkan sebagai “Tanya ke admin”.</p>
      <div className="space-y-2">{draft.equipment.map((entry) => <EquipmentForm key={`${entry.id}-${entry.name}-${entry.price}-${entry.price_unit}-${entry.quantity_available}-${entry.is_active}`} entry={entry} onSave={onSave} />)}<EquipmentForm onSave={onSave} /></div>
      {draft.equipment.length === 0 && <Card className="py-8 text-center text-sm text-muted">Belum ada alat di katalog.</Card>}
    </section>
  </div>;
}

function OperationsPanel({ settings, usedTodayKg, onChange }: {
  settings: ConfigDraft["settings"];
  usedTodayKg: number;
  onChange: (settings: ConfigDraft["settings"]) => void;
}) {
  function updateHours(day: DayKey, update: Partial<BusinessHours[DayKey]>) {
    onChange({
      ...settings,
      business_hours: {
        ...settings.business_hours,
        [day]: { ...settings.business_hours[day], ...update },
      },
    });
  }

  return <div className="space-y-5">
    <Card className="p-5">
      <h2 className="font-bold text-ink">Kuota harian kiloan</h2>
      <p className="mt-1 text-sm text-muted">Berat yang sudah ditimbang hari ini: {usedTodayKg.toLocaleString("id-ID")} kg. Pesanan kiloan menunggu persetujuan admin agar kuota tetap terkendali.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="text-sm font-semibold text-ink">Batas kuota (kg/hari)
          <input type="number" min="1" max="100000" step="1" value={settings.daily_capacity_kg} onChange={(event) => onChange({ ...settings, daily_capacity_kg: Number(event.target.value) })} className="mt-1.5 min-h-11 w-full rounded-lg border border-soft px-3" />
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm font-semibold text-ink"><input type="checkbox" checked={settings.is_accepting_orders} onChange={(event) => onChange({ ...settings, is_accepting_orders: event.target.checked })} /> Terima pesanan baru</label>
      </div>
    </Card>
    <Card className="p-5">
      <details>
        <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          <span className="font-bold text-ink">Jam operasional</span>
          <span className="text-sm text-muted">{Object.values(settings.business_hours).filter((day) => !day.closed).length} hari buka · WIB</span>
        </summary>
        <p className="mt-2 text-sm text-muted">Atur jam buka untuk setiap hari.</p>
        <div className="mt-4 space-y-3">
          {(Object.keys(dayLabels) as DayKey[]).map((day) => <div key={day} className="grid items-center gap-2 sm:grid-cols-[100px_1fr_1fr_auto]">
            <span className="text-sm font-semibold text-ink">{dayLabels[day]}</span>
            <input aria-label={`${dayLabels[day]} buka`} type="time" value={settings.business_hours[day].open} disabled={settings.business_hours[day].closed} onChange={(event) => updateHours(day, { open: event.target.value })} className="min-h-11 rounded-lg border border-soft px-3 text-sm disabled:opacity-50" />
            <input aria-label={`${dayLabels[day]} tutup`} type="time" value={settings.business_hours[day].close} disabled={settings.business_hours[day].closed} onChange={(event) => updateHours(day, { close: event.target.value })} className="min-h-11 rounded-lg border border-soft px-3 text-sm disabled:opacity-50" />
            <label className="flex min-h-11 items-center gap-2 text-sm text-muted"><input type="checkbox" aria-label={`Tutup pada ${dayLabels[day]}`} checked={settings.business_hours[day].closed} onChange={(event) => updateHours(day, { closed: event.target.checked })} /> Tutup</label>
          </div>)}
        </div>
      </details>
    </Card>
  </div>;
}

export function AdminPanel() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [draft, setDraft] = useState<ConfigDraft | null>(null);
  const [tab, setTab] = useState<"overview" | "orders" | "services" | "operations">("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [configError, setConfigError] = useState("");
  const [draftNotice, setDraftNotice] = useState("");
  const [savingConfig, setSavingConfig] = useState(false);
  const [orderRefreshKey, setOrderRefreshKey] = useState(0);
  const draftInitialized = useRef(false);
  const loadedToken = useRef("");
  const dashboardRequest = useRef<{ token: string; promise: Promise<AdminData> } | null>(null);

  const loadData = useCallback(async (accessToken: string, force = false) => {
    if (!force && loadedToken.current === accessToken) return;
    const pending = dashboardRequest.current;
    if (!force && pending?.token === accessToken) {
      await pending.promise;
      return;
    }
    setError("");
    const promise = adminRequest<AdminData>(accessToken, "/api/admin/dashboard");
    dashboardRequest.current = { token: accessToken, promise };
    try {
      const result = await promise;
      loadedToken.current = accessToken;
      setData(result);
      setToken(accessToken);
      if (!draftInitialized.current) {
        draftInitialized.current = true;
        try {
          const saved = window.localStorage.getItem(draftStorageKey);
          if (saved) {
            const parsed: unknown = JSON.parse(saved);
            if (!isConfigDraft(parsed)) throw new Error("Draft lokal tidak sesuai format.");
            setDraft(parsed);
            setDraftNotice("Draft lokal dipulihkan dari penyimpanan perangkat ini.");
          } else {
            setDraft(toConfigDraft(result));
          }
        } catch (failure) {
          setDraft(toConfigDraft(result));
          setDraftNotice(failure instanceof Error ? `Draft lokal tidak dapat dipulihkan: ${failure.message}` : "Draft lokal tidak dapat dipulihkan.");
        }
      } else if (force) {
        setOrderRefreshKey((value) => value + 1);
      }
    } finally {
      if (dashboardRequest.current?.promise === promise) dashboardRequest.current = null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    try {
      const supabase = getBrowserSupabaseClient();
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        if (_event === "INITIAL_SESSION") return;
        if (!session) {
          setToken("");
          setData(null);
          setEmail("");
          setDraft(null);
          draftInitialized.current = false;
          loadedToken.current = "";
          dashboardRequest.current = null;
          router.replace("/login");
          return;
        }
        setEmail(session.user.email ?? "");
        void loadData(session.access_token).catch((failure) => {
          if (active) setError(failure instanceof Error ? failure.message : "Akses admin tidak berhasil.");
        });
      });
      void (async () => {
        try {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          if (!active) return;
          const session = sessionData.session;
          if (!session) {
            router.replace("/login");
            return;
          }

          setEmail(session.user.email ?? "");
          const role = await getOperationalRole(session.user.id);
          if (!active) return;
          if (role === "petugas") {
            router.replace("/petugas");
            return;
          }
          if (role !== "admin") {
            router.replace("/login");
            return;
          }

          setToken(session.access_token);
          await loadData(session.access_token);
        } catch (failure) {
          if (active) setError(failure instanceof Error ? failure.message : "Akses admin tidak berhasil.");
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
        listener.subscription.unsubscribe();
      };
    } catch (failure) {
      setConfigError(failure instanceof Error ? failure.message : "Konfigurasi Supabase browser tidak ditemukan.");
      setLoading(false);
    }
  }, [loadData, router]);

  useEffect(() => {
    if (!draft || !data) return;
    try {
      if (hasConfigChanges(draft, data)) window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
      else window.localStorage.removeItem(draftStorageKey);
    } catch (failure) {
      setDraftNotice(failure instanceof Error ? `Draft hanya tersimpan selama halaman terbuka: ${failure.message}` : "Draft hanya tersimpan selama halaman terbuka.");
    }
  }, [data, draft]);

  const refresh = useCallback(async () => {
    if (token) await loadData(token, true);
  }, [loadData, token]);

  async function logout() {
    await getBrowserSupabaseClient().auth.signOut();
    setData(null);
    setToken("");
    setDraft(null);
    draftInitialized.current = false;
    loadedToken.current = "";
    dashboardRequest.current = null;
  }

  function stageCatalogChange(payload: Record<string, unknown>) {
    if (!draft || typeof payload.kind !== "string" || typeof payload.name !== "string") return;
    const id = typeof payload.id === "string" ? payload.id : crypto.randomUUID();
    const createdAt = new Date().toISOString();
    setDraft((current) => {
      if (!current) return current;
      if (payload.kind === "service") {
        const previous = current.services.find((item) => item.id === id);
        const entry: Service = {
          id,
          name: payload.name as string,
          slug: previous?.slug ?? null,
          description: typeof payload.description === "string" ? payload.description || null : null,
          price_per_kg: Number(payload.pricePerKg),
          estimated_days: Number(payload.estimatedDays),
          is_active: payload.isActive === true,
          created_at: previous?.created_at ?? createdAt,
        };
        return { ...current, services: previous ? current.services.map((item) => item.id === id ? entry : item) : [...current.services, entry] };
      }
      if (payload.kind === "item") {
        const previous = current.items.find((item) => item.id === id);
        const entry: LaundryItem = {
          id,
          name: payload.name as string,
          slug: previous?.slug ?? "",
          price: Number(payload.price),
          is_active: payload.isActive === true,
          created_at: previous?.created_at ?? createdAt,
        };
        return { ...current, items: previous ? current.items.map((item) => item.id === id ? entry : item) : [...current.items, entry] };
      }
      if (payload.kind === "equipment") {
        const previous = current.equipment.find((item) => item.id === id);
        const entry: Equipment = {
          id,
          name: payload.name as string,
          description: typeof payload.description === "string" ? payload.description || null : null,
          price: typeof payload.price === "number" ? payload.price : null,
          price_unit: payload.priceUnit === "hari" || payload.priceUnit === "minggu" || payload.priceUnit === "bulan" ? payload.priceUnit : null,
          quantity_available: Number(payload.quantityAvailable),
          is_active: payload.isActive === true,
          created_at: previous?.created_at ?? createdAt,
        };
        return { ...current, equipment: previous ? current.equipment.map((item) => item.id === id ? entry : item) : [...current.equipment, entry] };
      }
      return current;
    });
    setDraftNotice("Perubahan disimpan lokal di perangkat ini. Belum dikirim ke server.");
  }

  async function saveConfig() {
    if (!token || !data || !draft) return;
    setSavingConfig(true);
    setConfigError("");
    try {
      const changedServices = getChangedRows(draft.services, data.services, ["name", "description", "price_per_kg", "estimated_days", "is_active"]);
      const changedItems = getChangedRows(draft.items, data.items, ["name", "price", "is_active"]);
      const changedEquipment = getChangedRows(draft.equipment, data.equipment, ["name", "description", "price", "price_unit", "quantity_available", "is_active"]);
      const payload = {
        services: changedServices.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          pricePerKg: item.price_per_kg,
          estimatedDays: item.estimated_days,
          isActive: item.is_active,
          createdAt: item.created_at,
        })),
        items: changedItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          isActive: item.is_active,
          createdAt: item.created_at,
        })),
        equipment: changedEquipment.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          priceUnit: item.price_unit,
          quantityAvailable: item.quantity_available,
          isActive: item.is_active,
          createdAt: item.created_at,
        })),
        ...(JSON.stringify(draft.settings) !== JSON.stringify(data.settings) ? {
          settings: {
            dailyCapacityKg: draft.settings.daily_capacity_kg,
            isAcceptingOrders: draft.settings.is_accepting_orders,
            businessHours: draft.settings.business_hours,
          },
        } : {}),
      };
      await adminRequest(token, "/api/admin/catalog", "PUT", payload);
      try {
        const fresh = await adminRequest<AdminData>(token, "/api/admin/dashboard");
        setData(fresh);
        setDraft(toConfigDraft(fresh));
        setDraftNotice("Semua perubahan berhasil disimpan.");
      } catch (refreshFailure) {
        setConfigError(refreshFailure instanceof Error
          ? `Perubahan tersimpan di server, tetapi data terbaru belum dapat dimuat: ${refreshFailure.message}`
          : "Perubahan tersimpan di server, tetapi data terbaru belum dapat dimuat. Tekan Muat ulang.");
      }
    } catch (failure) {
      setConfigError(failure instanceof Error ? failure.message : "Perubahan belum dapat disimpan. Draft lokal tetap tersimpan.");
    } finally {
      setSavingConfig(false);
    }
  }

  function discardDraft() {
    if (!data) return;
    setDraft(toConfigDraft(data));
    setDraftNotice("Draft lokal dibuang.");
    window.localStorage.removeItem(draftStorageKey);
  }

  const activeOrders = useMemo(() => data?.recentOrders.filter((order) => !order.archived_at) ?? [], [data]);
  const pendingCount = data?.stats.pendingApprovalCount ?? 0;
  const dirty = Boolean(data && draft && hasConfigChanges(draft, data));

  if (loading) return <div className="grid min-h-screen place-items-center text-sm text-muted">Memeriksa sesi admin...</div>;
  if (configError && !data) return <div className="mx-auto max-w-xl px-4 py-16"><Notice error>{configError}</Notice></div>;
  if (!data || !token) {
    return <main className="mx-auto grid min-h-screen max-w-xl content-center gap-4 px-4">
      {error ? <Notice error>{error}</Notice> : <p className="text-center text-sm text-muted">Mengalihkan ke halaman login...</p>}
      {token && <button onClick={() => void loadData(token, true).catch((failure) => setError(failure instanceof Error ? failure.message : "Data admin belum dapat dimuat."))} className="min-h-11 rounded-xl border border-soft bg-white px-4 text-sm font-bold text-ink">Coba muat ulang</button>}
    </main>;
  }

  const nav = [
    { id: "overview", label: "Ringkasan", icon: Banknote },
    { id: "orders", label: "Pesanan", icon: ClipboardList },
    { id: "services", label: "Layanan & harga", icon: WashingMachine },
    { id: "operations", label: "Pengaturan", icon: RefreshCw },
  ] as const;

  return <main className="min-h-screen bg-page">
    <header className="border-b border-soft bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div><p className="text-sm font-bold text-brand-700">Cuci.in · Panel admin</p><p className="text-xs text-muted">{email}</p></div>
        <div className="flex gap-2">
          <button onClick={() => void refresh()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-soft px-3 text-sm font-semibold text-ink"><RefreshCw size={15} /> Muat ulang</button>
          <button onClick={() => void logout()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-soft px-3 text-sm font-semibold text-ink"><LogOut size={15} /> Keluar</button>
        </div>
      </div>
    </header>
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {error && <div className="mb-4"><Notice error>{error}</Notice></div>}
      <div className="mb-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {nav.map(({ id, label, icon: Icon }) => <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold transition-colors duration-200 sm:shrink-0 sm:px-4 sm:text-sm ${tab === id ? "bg-brand-500 text-white" : "border border-soft bg-white text-muted hover:bg-soft/50"}`}><Icon size={16} />{label}</button>)}
      </div>
      {dirty && <Card className="mb-5 flex flex-wrap items-center justify-between gap-3 border-brand-200 bg-white p-4">
        <div><p className="font-bold text-ink">Ada perubahan draft lokal</p><p className="mt-1 text-sm text-muted">{draftNotice || "Belum dikirim ke server. Simpan hanya akan mengirim perubahan yang berbeda."}</p></div>
        <div className="flex gap-2">
          <button disabled={savingConfig} onClick={discardDraft} className="min-h-11 rounded-lg border border-soft px-4 text-sm font-bold text-muted disabled:opacity-50">Buang draft</button>
          <button disabled={savingConfig} onClick={() => void saveConfig()} className="min-h-11 rounded-lg bg-brand-500 px-4 text-sm font-bold text-white disabled:opacity-50">{savingConfig ? "Menyimpan..." : "Simpan perubahan"}</button>
        </div>
      </Card>}
      {!dirty && draftNotice && <p role="status" className="mb-4 text-sm text-muted">{draftNotice}</p>}
      {configError && <div className="mb-4"><Notice error>{configError}</Notice></div>}
      {tab === "overview" && <section>
        <h1 className="text-2xl font-extrabold text-ink">Ringkasan bisnis</h1>
        <p className="mt-1 text-sm text-muted">Status operasional, pendapatan tercatat, dan aktivitas pesanan.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Pendapatan lunas", value: formatRupiah(data.stats.revenue), icon: Banknote },
            { label: "Total pesanan", value: data.stats.totalOrders.toLocaleString("id-ID"), icon: ClipboardList },
            { label: "Pelanggan", value: data.stats.customers.toLocaleString("id-ID"), icon: Users },
            { label: "Layanan aktif", value: data.stats.activeServices.toLocaleString("id-ID"), icon: WashingMachine },
          ].map(({ label, value, icon: Icon }) => <Card key={label} className="p-5"><div className="flex justify-between"><div><p className="text-sm text-muted">{label}</p><p className="mt-2 text-xl font-extrabold text-ink">{value}</p></div><Icon className="text-brand-600" size={20} /></div></Card>)}
        </div>
        <Card className="mt-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-ink">Kuota laundry hari ini</h2><p className="mt-1 text-sm text-muted">{data.stats.usedTodayKg.toLocaleString("id-ID")} dari {Number(data.settings.daily_capacity_kg).toLocaleString("id-ID")} kg telah ditimbang</p></div><span className={`rounded-full px-3 py-1.5 text-sm font-bold ${data.settings.is_accepting_orders ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{data.settings.is_accepting_orders ? "Menerima pesanan" : "Penerimaan dijeda"}</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-soft"><div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, data.stats.usedTodayKg / Number(data.settings.daily_capacity_kg) * 100)}%` }} /></div>
          {pendingCount > 0 && <button onClick={() => setTab("orders")} className="mt-3 min-h-11 text-sm font-bold text-amber-700">{pendingCount} pesanan menunggu persetujuan kuota · Tinjau</button>}
        </Card>
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-ink">Pesanan terbaru</h2>
            <button onClick={() => setTab("orders")} className="min-h-11 shrink-0 rounded-lg px-2 text-sm font-bold text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Semua pesanan</button>
          </div>
          {activeOrders.length > 0
            ? <div className="space-y-3">{activeOrders.map((order) => <OrderCard
              key={order.id}
              order={order}
              onPatch={async (id, payload) => {
                await adminRequest(token, "/api/admin/orders", "PATCH", { id, ...payload });
                await refresh();
              }}
              onArchive={async (id) => {
                await adminRequest(token, `/api/admin/orders?id=${encodeURIComponent(id)}`, "DELETE");
                await refresh();
              }}
            />)}</div>
            : <Card className="py-10 text-center text-sm text-muted">Belum ada pesanan aktif.</Card>}
        </div>
      </section>}
      {tab === "orders" && <section>
        <h1 className="mb-2 text-2xl font-extrabold text-ink">Pesanan</h1>
        <p className="mb-5 text-sm text-muted">Kelola progres, tagihan, dan pembayaran tunai setelah pesanan diterima pelanggan.</p>
        <OrdersPanel token={token} services={data.services} canManageAll refreshKey={orderRefreshKey} />
      </section>}
      {tab === "services" && draft && <section>
        <h1 className="mb-4 text-2xl font-extrabold text-ink">Layanan & harga</h1>
        <p className="mb-5 text-sm text-muted">Edit dan tambahkan layanan di draft lokal. Perubahan harga berlaku untuk pesanan baru setelah disimpan ke server.</p>
        <ServicesPanel draft={draft} onSave={async (payload) => stageCatalogChange(payload)} />
      </section>}
      {tab === "operations" && draft && <section>
        <h1 className="mb-2 text-2xl font-extrabold text-ink">Pengaturan</h1>
        <p className="mb-5 text-sm text-muted">Kuota harian, penerimaan pesanan, dan jam buka laundry tersimpan di draft lokal sampai Anda menekan Simpan perubahan.</p>
        <OperationsPanel settings={draft.settings} usedTodayKg={data.stats.usedTodayKg} onChange={(settings) => setDraft((current) => current ? { ...current, settings } : current)} />
      </section>}
    </div>
  </main>;
}
