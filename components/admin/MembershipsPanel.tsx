"use client";

import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, Mail, Phone, RefreshCw, Save, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { adminRequest } from "@/lib/admin/request";
import { formatMembershipPrice, type MembershipPlan } from "@/lib/membership";

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
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await adminRequest<{ members: Member[] }>(token, "/api/admin/members");
      setMembers(result.members);
      const planResult = await adminRequest<{ plans: MembershipPlan[] }>(token, "/api/admin/membership-plans");
      setPlans(planResult.plans);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Daftar member belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void refresh(); }, [refresh]);

  if (loading) return <p role="status" className="flex items-center gap-2 py-5 text-sm text-muted"><LoaderCircle size={16} className="animate-spin" />Memuat membership...</p>;
  return <div>
    {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <MembershipPlansEditor token={token} plans={plans} onSaved={refresh} />
    <div className="mb-3 flex items-center justify-between gap-3">
      <div><h2 className="font-bold text-ink">Pendaftar membership</h2><p className="text-sm text-muted">Menampilkan {members.length} member terbaru.</p></div>
      <button onClick={() => void refresh()} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-soft bg-white px-3 text-sm font-semibold text-ink"><RefreshCw size={15} /> Muat ulang</button>
    </div>
    {members.length === 0
      ? <Card className="py-10 text-center"><Users size={28} className="mx-auto text-brand-300" /><p className="mt-3 font-bold text-ink">Belum ada member terdaftar</p><p className="mt-1 text-sm text-muted">Pendaftaran membership baru akan muncul di sini.</p></Card>
      : <div className="grid gap-3 md:grid-cols-2">
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
      </div>}
  </div>;
}

function MembershipPlansEditor({ token, plans, onSaved }: {
  token: string;
  plans: MembershipPlan[];
  onSaved: () => Promise<void>;
}) {
  const [draft, setDraft] = useState<MembershipPlan[]>(plans);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { setDraft(plans); }, [plans]);

  function updatePlan(code: MembershipPlan["code"], patch: Partial<MembershipPlan>) {
    setDraft((current) => current.map((plan) => plan.code === code ? { ...plan, ...patch } : plan));
    setNotice("");
    setError("");
  }

  async function save() {
    setSaving(true);
    setNotice("");
    setError("");
    try {
      await adminRequest(token, "/api/admin/membership-plans", "PUT", { plans: draft.map(({ id, code, name, description, monthly_price, discount_percent, priority_queue, is_active }) => ({ id, code, name, description, monthly_price, discount_percent, priority_queue, is_active })) });
      await onSaved();
      setNotice("Perubahan paket berhasil disimpan.");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Perubahan paket belum dapat disimpan.");
    } finally {
      setSaving(false);
    }
  }

  return <Card className="mb-8 p-5 sm:p-6">
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-lg font-extrabold text-ink">Atur paket membership</h2><p className="mt-1 text-sm text-muted">Harga dan manfaat yang disimpan akan langsung dipakai di halaman Membership.</p></div>
      <button type="button" onClick={() => void save()} disabled={saving || plans.length !== 2} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-wait disabled:opacity-50">
        {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}{saving ? "Menyimpan..." : "Simpan paket"}
      </button>
    </div>
    {plans.length !== 2 && <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Data paket belum tersedia. Jalankan migrasi Supabase paket membership terlebih dahulu.</p>}
    <div className="grid gap-4 lg:grid-cols-2">
      {draft.map((plan) => <section key={plan.code} className="rounded-xl border border-soft bg-soft/20 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-bold text-ink">Paket {plan.code === "hemat" ? "Hemat" : "Prioritas"}</h3>
          <label className="inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-ink"><input type="checkbox" checked={plan.is_active} onChange={(event) => updatePlan(plan.code, { is_active: event.target.checked })} className="size-4 accent-brand-600" />Tampilkan</label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-ink">Nama paket
            <input value={plan.name} maxLength={60} onChange={(event) => updatePlan(plan.code, { name: event.target.value })} className="mt-1 block min-h-10 w-full rounded-lg border border-soft bg-white px-3 font-normal" />
          </label>
          <label className="text-sm font-semibold text-ink">Harga per bulan (Rp)
            <input type="number" min={1} max={100000000} step={1000} value={plan.monthly_price} onChange={(event) => updatePlan(plan.code, { monthly_price: Number(event.target.value) })} className="mt-1 block min-h-10 w-full rounded-lg border border-soft bg-white px-3 font-normal" />
          </label>
          <label className="text-sm font-semibold text-ink">Diskon (%)
            <input type="number" min={0} max={100} step={1} value={plan.discount_percent} onChange={(event) => updatePlan(plan.code, { discount_percent: Number(event.target.value) })} className="mt-1 block min-h-10 w-full rounded-lg border border-soft bg-white px-3 font-normal" />
          </label>
          <label className="flex min-h-10 items-center gap-2 self-end text-sm font-semibold text-ink"><input type="checkbox" checked={plan.priority_queue} onChange={(event) => updatePlan(plan.code, { priority_queue: event.target.checked })} className="size-4 accent-brand-600" />Antrean prioritas</label>
          <label className="text-sm font-semibold text-ink sm:col-span-2">Deskripsi paket
            <textarea value={plan.description} maxLength={350} rows={2} onChange={(event) => updatePlan(plan.code, { description: event.target.value })} className="mt-1 block w-full resize-y rounded-lg border border-soft bg-white px-3 py-2 font-normal" />
          </label>
        </div>
      </section>)}
    </div>
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>}
  </Card>;
}
