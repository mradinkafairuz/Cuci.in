"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, LoaderCircle, PackageOpen } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { adminRequest } from "@/lib/admin/request";

type LoanStatus = "MENUNGGU" | "DISETUJUI" | "DIKEMBALIKAN" | "DITOLAK";
type LoanRequest = {
  id: string;
  borrower_name: string;
  phone: string;
  equipment_name: string;
  quantity: number;
  start_date: string;
  return_date: string;
  notes: string | null;
  status: LoanStatus;
  created_at: string;
};

const statusNames: Record<LoanStatus, string> = {
  MENUNGGU: "Menunggu konfirmasi",
  DISETUJUI: "Disetujui",
  DIKEMBALIKAN: "Dikembalikan",
  DITOLAK: "Ditolak",
};

const statuses = Object.keys(statusNames) as LoanStatus[];

export function EquipmentLoanRequestsPanel({ token }: { token: string }) {
  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await adminRequest<{
        requests: LoanRequest[];
        page: number;
        hasMore: boolean;
      }>(token, `/api/admin/equipment-loans?page=${page}`);
      setRequests(result.requests);
      setHasMore(result.hasMore);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Permintaan peminjaman belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }, [page, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function changeStatus(id: string, status: LoanStatus) {
    setBusyId(id);
    setError("");
    try {
      await adminRequest(token, "/api/admin/equipment-loans", "PATCH", { id, status });
      await refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Status peminjaman belum dapat diperbarui.");
    } finally {
      setBusyId("");
    }
  }

  if (loading) return <p role="status" className="flex items-center gap-2 py-5 text-sm text-muted"><LoaderCircle size={16} className="animate-spin" />Memuat permintaan...</p>;
  if (error && requests.length === 0) return <div><p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p><button onClick={() => void refresh()} className="mt-3 min-h-11 rounded-lg border border-soft px-4 text-sm font-bold">Coba lagi</button></div>;
  if (requests.length === 0) return <Card className="py-8 text-center"><PackageOpen size={27} className="mx-auto text-brand-300" /><p className="mt-2 font-semibold text-ink">Belum ada permintaan peminjaman</p></Card>;

  return <div>
    {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <div className="grid gap-3 md:grid-cols-2">
      {requests.map((request) => {
        const phone = request.phone.replace(/\D/g, "").replace(/^0/, "62");
        return <Card key={request.id} className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold text-ink">{request.equipment_name} <span className="text-muted">× {request.quantity}</span></p>
              <p className="mt-1 text-sm text-muted">{request.borrower_name} · {request.phone}</p>
            </div>
            <select aria-label={`Status peminjaman ${request.equipment_name}`} value={request.status} disabled={busyId === request.id} onChange={(event) => void changeStatus(request.id, event.target.value as LoanStatus)} className="min-h-11 rounded-lg border border-soft bg-white px-3 text-xs font-bold disabled:opacity-50">
              {statuses.map((status) => <option key={status} value={status}>{statusNames[status]}</option>)}
            </select>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted"><CalendarDays size={14} />{new Date(`${request.start_date}T00:00:00`).toLocaleDateString("id-ID")} – {new Date(`${request.return_date}T00:00:00`).toLocaleDateString("id-ID")}</p>
          {request.notes && <p className="mt-2 text-sm text-muted">{request.notes}</p>}
          <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-emerald-50 px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-100">Hubungi peminjam</a>
        </Card>;
      })}
    </div>
    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted">
      <span>Halaman {page} · {requests.length} permintaan</span>
      <div className="flex gap-2">
        <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="min-h-11 rounded-lg border border-soft bg-white px-3 font-semibold disabled:opacity-40">Sebelumnya</button>
        <button type="button" disabled={!hasMore} onClick={() => setPage((value) => value + 1)} className="min-h-11 rounded-lg border border-soft bg-white px-3 font-semibold disabled:opacity-40">Berikutnya</button>
      </div>
    </div>
  </div>;
}
