"use client";

import { useEffect, useState } from "react";
import { CalendarDays, LoaderCircle, PackageOpen } from "lucide-react";
import { Card } from "@/components/ui/Card";

type LoanRequest = { id: string; borrower_name: string; phone: string; equipment_name: string; quantity: number; start_date: string; return_date: string; notes: string | null; status: string; created_at: string };
const statusName: Record<string, string> = { MENUNGGU: "Menunggu konfirmasi", DISETUJUI: "Disetujui", DIKEMBALIKAN: "Dikembalikan", DITOLAK: "Ditolak" };

export function EquipmentLoanRequests() {
  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    fetch("/api/equipment-loans", { cache: "no-store" }).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Gagal memuat permintaan.");
      if (active) setRequests(result.requests);
    }).catch((loadError) => { if (active) setError(loadError instanceof Error ? loadError.message : "Gagal memuat permintaan."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  if (loading) return <Card className="flex items-center gap-2 text-sm text-muted"><LoaderCircle size={16} className="animate-spin" />Memuat permintaan…</Card>;
  if (error) return <Card className="text-sm text-muted">{error}</Card>;
  if (requests.length === 0) return <Card className="py-8 text-center"><PackageOpen size={27} className="mx-auto text-brand-300" /><p className="mt-2 font-semibold text-ink">Belum ada permintaan peminjaman</p></Card>;
  return <div className="grid gap-3 md:grid-cols-2">{requests.map((request) => { const phone = request.phone.replace(/\D/g, "").replace(/^0/, "62"); return <Card key={request.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-ink">{request.equipment_name} <span className="text-muted">× {request.quantity}</span></p><p className="mt-1 text-sm text-muted">{request.borrower_name} · {request.phone}</p></div><span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">{statusName[request.status] ?? request.status}</span></div><p className="mt-3 flex items-center gap-1.5 text-xs text-muted"><CalendarDays size={14} />{request.start_date} – {request.return_date}</p>{request.notes && <p className="mt-2 text-sm text-muted">{request.notes}</p>}<a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100">Hubungi peminjam</a></Card>; })}</div>;
}
