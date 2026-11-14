"use client";

import { useState } from "react";
import { Check, Scale } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { dashboardOrders, statusLabels, type DashboardOrder } from "@/lib/mock-data/dashboard";
import { formatRupiah } from "@/lib/utils/format";
import type { OrderStatus } from "@/types";

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = { menunggu: "diterima", diterima: "dicuci", dicuci: "disetrika", disetrika: "siap_diambil", siap_diambil: "selesai" };

export function StaffQueue() {
  const [orders, setOrders] = useState(dashboardOrders.filter((order) => order.status !== "selesai"));
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  function updateOrder(order: DashboardOrder) {
    const weight = Number(weights[order.code]);
    if (order.weight === null && (!weight || weight <= 0)) { setNotice(`Masukkan berat yang valid untuk ${order.code}.`); return; }
    const status = nextStatus[order.status];
    if (!status) return;
    const rate = order.service.includes("Express") ? 12000 : order.service.includes("Setrika Saja") ? 4000 : order.service.includes("Kering") ? 5000 : 7000;
    setOrders((current) => current.map((item) => item.code === order.code ? { ...item, status, weight: item.weight ?? weight, total: item.total ?? Math.round(weight * rate) } : item));
    setNotice(`${order.code} diperbarui ke ${statusLabels[status]} (pratinjau).`);
  }
  return <div className="space-y-4">{notice && <div role="status" className="rounded-xl border border-brand-300 bg-brand-500/10 px-4 py-3 text-sm font-medium text-brand-700">{notice}</div>}{orders.map((order) => <Card key={order.code} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-brand-600">{order.code}</p><h2 className="mt-1 text-lg font-bold text-ink">{order.customer}</h2><p className="text-sm text-muted">{order.service} · {order.createdAt}</p></div><Badge tone={order.status === "siap_diambil" ? "success" : "info"}>{statusLabels[order.status]}</Badge></div><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label className="text-sm font-medium text-ink"><span className="mb-1 flex items-center gap-1.5"><Scale size={15} /> Berat (kg)</span><input type="number" min="0.1" step="0.1" value={weights[order.code] ?? order.weight ?? ""} onChange={(event) => setWeights((current) => ({ ...current, [order.code]: event.target.value }))} placeholder="Masukkan berat" className="w-full rounded-xl border border-soft px-3 py-2.5 outline-none focus:border-brand-500" /></label><div className="text-sm"><p className="text-muted">Tagihan</p><p className="mt-1 font-bold text-ink">{order.total ? formatRupiah(order.total) : "Dihitung setelah ditimbang"}</p></div><button type="button" onClick={() => updateOrder(order)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-bold text-white hover:bg-brand-600"><Check size={16} /> {order.status === "siap_diambil" ? "Catat penyerahan" : "Perbarui status"}</button></div></Card>)}{orders.length === 0 && <Card className="py-12 text-center"><p className="font-bold text-ink">Antrean kosong</p><p className="mt-1 text-sm text-muted">Pesanan baru akan tampil di sini.</p></Card>}</div>;
}
