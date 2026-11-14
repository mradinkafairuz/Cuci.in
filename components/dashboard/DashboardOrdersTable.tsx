"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatRupiah } from "@/lib/utils/format";
import { dashboardOrders, statusLabels } from "@/lib/mock-data/dashboard";
import type { OrderStatus } from "@/types";

const tones: Record<OrderStatus, "info" | "success" | "warning" | "neutral"> = { menunggu: "warning", diterima: "info", diproses: "info", dicuci: "info", disetrika: "info", siap_diambil: "success", selesai: "neutral", dibatalkan: "neutral" };

export function DashboardOrdersTable({ customerOnly = false }: { customerOnly?: boolean }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("semua");
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const orders = useMemo(() => dashboardOrders.filter((order) => (status === "semua" || order.status === status) && `${order.code} ${order.customer} ${order.service}`.toLowerCase().includes(query.toLowerCase())), [query, status]);
  const pageCount = Math.max(1, Math.ceil(orders.length / pageSize));
  const visible = orders.slice((page - 1) * pageSize, page * pageSize);
  function changeStatus(value: string) { setStatus(value); setPage(1); }
  function changeQuery(value: string) { setQuery(value); setPage(1); }
  return <div>
    <div className="mb-4 flex flex-col gap-3 sm:flex-row">
      <label className="relative flex-1"><span className="sr-only">Cari pesanan</span><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="Cari kode, pelanggan, layanan..." className="w-full rounded-xl border border-soft bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-500" /></label>
      <select value={status} onChange={(event) => changeStatus(event.target.value)} aria-label="Filter status pesanan" className="rounded-xl border border-soft bg-white px-3 py-2.5 text-sm text-ink"><option value="semua">Semua status</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
    </div>
    <div className="overflow-x-auto rounded-2xl border border-soft bg-white"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-soft/40 text-xs uppercase tracking-wide text-muted"><tr><th className="px-4 py-3">Kode</th>{!customerOnly && <th className="px-4 py-3">Pelanggan</th>}<th className="px-4 py-3">Layanan</th><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Tagihan</th></tr></thead><tbody className="divide-y divide-soft">{visible.map((order) => <tr key={order.code}><td className="px-4 py-4 font-bold text-brand-700">{order.code}</td>{!customerOnly && <td className="px-4 py-4 font-medium text-ink">{order.customer}</td>}<td className="px-4 py-4 text-ink">{order.service}</td><td className="px-4 py-4 text-muted">{order.createdAt}</td><td className="px-4 py-4"><Badge tone={tones[order.status]}>{statusLabels[order.status]}</Badge></td><td className="px-4 py-4 text-right font-semibold text-ink">{order.total ? formatRupiah(order.total) : "Menunggu timbang"}</td></tr>)}</tbody></table>
      {visible.length === 0 && <div className="px-6 py-12 text-center"><p className="font-semibold text-ink">{orders.length === 0 ? "Belum ada data pesanan" : "Pesanan tidak ditemukan"}</p><p className="mt-1 text-sm text-muted">{orders.length === 0 ? "Pesanan akan tampil setelah Supabase terhubung." : "Ubah kata pencarian atau filter status."}</p></div>}
    </div>
    <div className="mt-4 flex items-center justify-between text-sm text-muted"><span>{orders.length ? `Menampilkan ${visible.length} dari ${orders.length} pesanan` : "Belum ada hasil"}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-soft bg-white px-3 py-2 font-semibold disabled:opacity-40">Sebelumnya</button><button type="button" disabled={page >= pageCount} onClick={() => setPage(page + 1)} className="rounded-lg border border-soft bg-white px-3 py-2 font-semibold disabled:opacity-40">Berikutnya</button></div></div>
  </div>;
}
