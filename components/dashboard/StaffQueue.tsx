"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, LoaderCircle, PackageOpen, Scale } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { usePublicCatalog } from "@/lib/hooks/use-public-catalog";
import { formatRupiah } from "@/lib/utils/format";
import type { LaundryService } from "@/types";

type QuoteOrder = {
  id: string;
  code: string;
  orderType: "KILOAN" | "SATUAN";
  quoteStatus: "MENUNGGU_TIMBANG" | "MENUNGGU_PERSETUJUAN";
  customerName: string;
  phone: string;
  serviceId: string | null;
  serviceName: string;
  pricePerKg: number | null;
  weightKg: number | null;
  total: number | null;
  createdAt: string;
  items: { name: string; processingMethod: string; unitPrice: number; quantity: number }[];
};

export function StaffQueue() {
  const { catalog } = usePublicCatalog();
  const services = catalog?.services ?? [];
  const [orders, setOrders] = useState<QuoteOrder[]>([]);
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [methods, setMethods] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadOrders = useCallback(async () => {
    const response = await fetch("/api/orders", { cache: "no-store" });
    const result: { orders?: QuoteOrder[]; error?: string } = await response.json();
    if (!response.ok || !result.orders) throw new Error(result.error ?? "Antrean pesanan belum dapat dimuat.");
    setOrders(result.orders);
  }, []);

  useEffect(() => {
    let active = true;
    loadOrders().catch((loadError) => {
      if (active) setError(loadError instanceof Error ? loadError.message : "Antrean pesanan belum dapat dimuat.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadOrders]);

  async function sendQuote(order: QuoteOrder) {
    const weightKg = Number(weights[order.id] ?? order.weightKg ?? 0);
    const serviceId = methods[order.id] ?? order.serviceId ?? services[0]?.id ?? "";
    if (!weightKg || weightKg <= 0 || !serviceId) {
      setError("Masukkan berat aktual dan pilih metode pengerjaan.");
      return;
    }

    setUpdatingId(order.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/orders/${order.id}/quote`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightKg, serviceId }),
      });
      const result: { error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Penawaran belum dapat dikirim.");
      await loadOrders();
      setNotice(`Penawaran untuk ${order.code} sudah dikirim ke pelanggan untuk disetujui.`);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Penawaran belum dapat dikirim.");
    } finally {
      setUpdatingId("");
    }
  }

  if (loading) return <Card className="flex items-center gap-2 text-sm text-muted"><LoaderCircle size={16} className="animate-spin" />Memuat antrean pesanan…</Card>;

  return (
    <div className="space-y-4">
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {orders.map((order) => {
        const selectedServiceId = methods[order.id] ?? order.serviceId ?? services[0]?.id ?? "";
        const selectedService = services.find((service: LaundryService) => service.id === selectedServiceId);
        const enteredWeight = Number(weights[order.id] ?? order.weightKg ?? 0);
        const previewTotal = selectedService && enteredWeight > 0 ? Math.round(enteredWeight * selectedService.pricePerKg) : null;
        const waitingForApproval = order.quoteStatus === "MENUNGGU_PERSETUJUAN";

        return (
          <Card key={order.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-600">{order.code} · {order.orderType === "KILOAN" ? "Kiloan" : "Cuci satuan"}</p>
                <h2 className="mt-1 text-lg font-bold text-ink">{order.customerName}</h2>
                <p className="text-sm text-muted">{order.phone} · {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(order.createdAt))}</p>
              </div>
              <Badge tone={waitingForApproval ? "warning" : "info"}>{waitingForApproval ? "Menunggu persetujuan pelanggan" : "Menunggu timbang"}</Badge>
            </div>

            {order.orderType === "SATUAN" && (
              <div className="mt-4 rounded-xl bg-soft/40 p-4 text-sm">
                <p className="font-semibold text-ink">Rincian pakaian</p>
                <ul className="mt-2 space-y-2">
                  {order.items.map((item, index) => <li key={`${item.name}-${index}`} className="flex flex-wrap justify-between gap-2 text-muted"><span>{item.name} × {item.quantity} · {item.processingMethod}</span><span className="font-semibold text-ink">{formatRupiah(item.unitPrice * item.quantity)}</span></li>)}
                </ul>
                <p className="mt-3 border-t border-soft pt-3 font-bold text-ink">Total penawaran · {formatRupiah(order.total ?? 0)}</p>
              </div>
            )}

            {order.orderType === "KILOAN" && waitingForApproval && (
              <div className="mt-4 rounded-xl bg-soft/40 p-4 text-sm">
                <p className="font-semibold text-ink">Penawaran sudah dikirim</p>
                <p className="mt-1 text-muted">{order.weightKg} kg · {order.serviceName} · {formatRupiah(order.total ?? 0)}</p>
                <p className="mt-1 text-xs text-muted">Menunggu pelanggan menyetujui harga dari halaman cek status.</p>
              </div>
            )}

            {order.orderType === "KILOAN" && !waitingForApproval && (
              <div className="mt-4 grid gap-3 rounded-xl bg-soft/40 p-4 sm:grid-cols-[1fr_1.2fr_auto] sm:items-end">
                <label className="text-sm font-medium text-ink"><span className="mb-1 flex items-center gap-1.5"><Scale size={15} /> Berat aktual (kg)</span>
                  <input type="number" min="0.1" max="200" step="0.1" value={weights[order.id] ?? ""} onChange={(event) => setWeights((current) => ({ ...current, [order.id]: event.target.value }))} placeholder="Contoh: 3,5" className="w-full rounded-xl border border-soft bg-white px-3 py-2.5 outline-none focus:border-brand-500" />
                </label>
                <label className="text-sm font-medium text-ink">Metode pengerjaan
                  <select value={selectedServiceId} onChange={(event) => setMethods((current) => ({ ...current, [order.id]: event.target.value }))} className="mt-1 w-full rounded-xl border border-soft bg-white px-3 py-2.5 outline-none focus:border-brand-500">
                    {services.map((service) => <option key={service.id} value={service.id}>{service.name} · {formatRupiah(service.pricePerKg)}/kg</option>)}
                  </select>
                </label>
                <button type="button" onClick={() => void sendQuote(order)} disabled={updatingId === order.id || services.length === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:cursor-wait disabled:opacity-60">
                  {updatingId === order.id ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />}
                  Kirim penawaran
                </button>
                <p className="text-sm text-muted sm:col-span-3">Perkiraan total: <strong className="text-ink">{previewTotal === null ? "Masukkan berat" : formatRupiah(previewTotal)}</strong>. Harga final menunggu persetujuan pelanggan.</p>
              </div>
            )}
          </Card>
        );
      })}
      {orders.length === 0 && <Card className="py-12 text-center"><PackageOpen size={30} className="mx-auto text-brand-300" /><p className="mt-3 font-bold text-ink">Tidak ada penawaran yang menunggu</p><p className="mt-1 text-sm text-muted">Pesanan baru akan tampil di sini.</p></Card>}
    </div>
  );
}
