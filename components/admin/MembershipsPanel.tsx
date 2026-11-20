"use client";

import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, Mail, Phone, RefreshCw, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { adminRequest } from "@/lib/admin/request";
import { formatMembershipPrice } from "@/lib/membership";

type Member = {
  id: string;
  member_code: string;
  full_name: string;
  phone: string;
  email: string | null;
  package_name: string;
  monthly_price: number;
  discount_percent: number;
  status: string;
  is_active: boolean;
  created_at: string;
};

export function MembershipsPanel({ token }: { token: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await adminRequest<{ members: Member[] }>(token, "/api/admin/members");
      setMembers(result.members);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Daftar member belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void refresh(); }, [refresh]);

  if (loading) return <p role="status" className="flex items-center gap-2 py-5 text-sm text-muted"><LoaderCircle size={16} className="animate-spin" />Memuat membership...</p>;
  if (error && members.length === 0) return <div><p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p><button onClick={() => void refresh()} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-soft px-4 text-sm font-bold"><RefreshCw size={15} /> Coba lagi</button></div>;
  if (members.length === 0) return <Card className="py-10 text-center"><Users size={28} className="mx-auto text-brand-300" /><p className="mt-3 font-bold text-ink">Belum ada member terdaftar</p><p className="mt-1 text-sm text-muted">Pendaftaran membership baru akan muncul di sini.</p></Card>;

  return <div>
    {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="text-sm text-muted">Menampilkan {members.length} member terbaru.</p>
      <button onClick={() => void refresh()} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-soft bg-white px-3 text-sm font-semibold text-ink"><RefreshCw size={15} /> Muat ulang</button>
    </div>
    <div className="grid gap-3 md:grid-cols-2">
      {members.map((member) => <Card key={member.id} className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-ink">{member.full_name}</p>
            <p className="mt-1 font-mono text-xs font-bold tracking-wide text-brand-700">{member.member_code}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${member.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{member.status === "active" ? "Aktif" : member.status === "pending_payment" ? "Menunggu pembayaran" : member.status}</span>
        </div>
        <p className="mt-3 text-sm font-semibold text-ink">Paket {member.package_name} · {formatMembershipPrice(member.monthly_price)}/bulan</p>
        <p className="mt-1 text-xs text-muted">Diskon {member.discount_percent}%</p>
        <p className="mt-4 flex items-center gap-2 text-sm text-muted"><Phone size={15} />{member.phone}</p>
        {member.email && <p className="mt-2 flex items-center gap-2 text-sm text-muted"><Mail size={15} />{member.email}</p>}
        <p className="mt-3 text-xs text-muted">Terdaftar {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(member.created_at))}</p>
      </Card>)}
    </div>
  </div>;
}
