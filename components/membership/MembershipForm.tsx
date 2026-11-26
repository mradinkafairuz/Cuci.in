"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, CheckCircle2, ContactRound, Crown, Hash, LoaderCircle } from "@/lib/icons";
import { motion } from "motion/react";
import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/ui/useScrollReveal";
import { DEFAULT_MEMBERSHIP_PLANS, formatMembershipPrice, type MembershipPlan, type MembershipPlanCode } from "@/lib/membership";
import { isValidIndonesianPhone } from "@/lib/utils/phone";

export function MembershipForm() {
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlanCode | "">("");
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [memberCode, setMemberCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const plan = plans.find((item) => item.code === selectedPlan);

  const loadPlans = useCallback(async () => {
    setLoadingPlans(true);
    setPlansError("");
    try {
      const response = await fetch("/api/membership-plans", { cache: "no-store" });
      const result = await response.json() as { plans?: MembershipPlan[]; error?: string };
      if (!response.ok || !Array.isArray(result.plans)) throw new Error(result.error ?? "Paket membership belum dapat dimuat.");
      setPlans(result.plans.length > 0 ? result.plans : []);
    } catch {
      // Paket cadangan tetap ditampilkan saat tabel Supabase belum tersedia.
      setPlans(DEFAULT_MEMBERSHIP_PLANS);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  useEffect(() => { void loadPlans(); }, [loadPlans]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current || !plan) return;

    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("fullName") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const consent = form.get("consent") === "on";
    if (fullName.length < 2) { setError("Nama lengkap minimal 2 karakter."); return; }
    if (!isValidIndonesianPhone(phone)) { setError("Nomor WhatsApp belum valid."); return; }
    if (!consent) { setError("Setujui penggunaan data untuk pendaftaran membership."); return; }

    submittingRef.current = true;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, email, consent, planCode: plan.code }),
      });
      const result = await response.json() as { memberCode?: string; error?: string };
      if (!response.ok || !result.memberCode) throw new Error(result.error ?? "Pendaftaran membership belum berhasil.");
      setMemberCode(result.memberCode);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Pendaftaran belum berhasil. Silakan coba lagi.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  if (memberCode && plan) {
    return <Card className="mx-auto max-w-2xl px-6 py-9 text-center sm:px-10">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-amber-100 text-amber-700"><CheckCircle2 size={29} /></span>
      <p className="mt-5 text-sm font-bold uppercase tracking-[0.14em] text-brand-700">Pendaftaran diterima</p>
      <h2 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">Paket {plan.name} dipilih</h2>
      <p className="mt-2 text-sm text-muted">{formatMembershipPrice(plan.monthly_price)} per bulan · diskon {plan.discount_percent}%</p>
      <p className="mt-3 text-sm leading-6 text-muted">Status membership menunggu konfirmasi pembayaran. Kode member adalah ID unik pendaftaran Anda; simpan untuk referensi saat menghubungi Cuci.in.</p>
      <p className="mt-4 rounded-2xl bg-soft px-4 py-4 font-mono text-2xl font-extrabold tracking-wider text-brand-700">{memberCode}</p>
      <Link href="/" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-bold text-white hover:bg-brand-600">Kembali ke halaman utama</Link>
    </Card>;
  }

  if (!showForm) {
    return <div className="mx-auto max-w-4xl">
      <div className="mb-8 grid gap-3 md:grid-cols-3">
        {[
          { icon: Hash, title: "Kode member unik", description: "ID khusus untuk mengenali pendaftaran membership Anda." },
          { icon: ContactRound, title: "Data tercatat", description: "Nama dan nomor WhatsApp digunakan untuk mencatat pendaftaran Anda." },
          { icon: BadgeCheck, title: "Konfirmasi pembayaran", description: "Paket aktif setelah pembayaran dikonfirmasi oleh tim Cuci.in." },
        ].map(({ icon: Icon, title, description }, index) => <ScrollReveal key={title} delay={index * 0.06}>
          <Card className="flex gap-3 p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-700"><Icon size={19} /></span>
          <span><span className="block font-bold text-ink">{title}</span><span className="mt-1 block text-sm leading-5 text-muted">{description}</span></span>
          </Card>
        </ScrollReveal>)}
      </div>
      <div className="mb-5 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1.5 text-xs font-bold text-brand-700"><Crown size={15} /> Pilih paket</span>
        <h2 className="mt-3 text-2xl font-extrabold text-ink">Pilih membership yang sesuai</h2>
        <p className="mt-1 text-sm leading-6 text-muted">Pilih paket dahulu. Data diri diisi pada langkah berikutnya.</p>
      </div>
      {loadingPlans && <Card className="py-8 text-center text-sm text-muted"><LoaderCircle size={18} className="mx-auto mb-2 animate-spin" />Memuat paket membership...</Card>}
      {!loadingPlans && plansError && <Card className="py-7 text-center"><p role="alert" className="text-sm text-red-700">{plansError}</p><button type="button" onClick={() => void loadPlans()} className="mt-3 min-h-10 rounded-lg border border-soft px-4 text-sm font-bold text-ink">Coba lagi</button></Card>}
      {!loadingPlans && !plansError && plans.length === 0 && <Card className="py-7 text-center text-sm text-muted">Belum ada paket membership yang tersedia.</Card>}
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((item, index) => {
          const isSelected = selectedPlan === item.code;
          const isFeatured = item.priority_queue;
          return <ScrollReveal key={item.code} delay={index * 0.08} className="h-full">
            <motion.div
              layout
              className="h-full"
              animate={{ y: isSelected ? -2 : 0, scale: isSelected ? 1.012 : 1 }}
              whileHover={{ y: -6, scale: 1.015 }}
              transition={{ type: "spring", stiffness: 240, damping: 26, mass: 0.8 }}
            >
            <Card className={`relative flex h-full min-h-[17.5rem] flex-col overflow-hidden p-5 transition-[border-color,box-shadow] duration-300 ease-out ${isFeatured ? "border-brand-700 bg-brand-700 text-white" : "border-[#b7d6d8] bg-[#eef7ff] text-ink"} ${isSelected ? "ring-2 ring-brand-300 shadow-lg" : "hover:border-brand-300 hover:shadow-md"}`}>
              {isFeatured && <span aria-hidden="true" className="pointer-events-none absolute -right-12 -top-14 size-40 rounded-full bg-white/10" />}
              <div className="flex min-h-[5.5rem] items-start justify-between gap-3">
                <div>
                  <h3 className={`text-xl font-extrabold ${isFeatured ? "text-white" : "text-ink"}`}>{item.name}</h3>
              <p className={`mt-1 text-sm leading-6 ${isFeatured ? "text-white/80" : "text-muted"}`}>{item.description}</p>
                </div>
              {item.priority_queue && <span className="shrink-0 rounded-full bg-[#cde8e5] px-2.5 py-1 text-xs font-bold text-brand-700">Antrean prioritas</span>}
              </div>
            <p className={`mt-4 text-2xl font-extrabold ${isFeatured ? "text-white" : "text-brand-700"}`}>{formatMembershipPrice(item.monthly_price)}<span className={`ml-1 text-sm font-medium ${isFeatured ? "text-white/75" : "text-muted"}`}>/bulan</span></p>
              <div className="mt-2 mb-4 min-h-12 text-sm leading-6">
                <p className={`font-semibold ${isFeatured ? "text-white" : "text-ink"}`}>Diskon {item.discount_percent}% untuk layanan laundry</p>
                <p className={isFeatured ? "text-white/80" : "text-muted"}>{item.priority_queue ? "Termasuk antrean layanan prioritas." : "Berlaku untuk setiap transaksi laundry."}</p>
              </div>
              <motion.button type="button" whileTap={{ scale: 0.985 }} transition={{ type: "spring", stiffness: 240, damping: 24, mass: 0.7 }} onClick={() => { setSelectedPlan(item.code); setError(""); }} aria-pressed={isSelected} className={`mt-auto inline-flex min-h-11 w-full items-center justify-center rounded-xl border px-4 text-sm font-bold transition-[background-color,color,border-color,box-shadow,transform] duration-300 ease-out ${isSelected ? "border-white bg-white text-brand-700 shadow-sm" : isFeatured ? "border-white/50 text-white hover:bg-white/10" : "border-brand-300 text-brand-700 hover:bg-brand-50 active:scale-[0.985]"}`}>
                {isSelected ? "Paket dipilih" : "Pilih paket ini"}
              </motion.button>
            </Card>
            </motion.div>
          </ScrollReveal>;
        })}
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <button type="button" disabled={!selectedPlan || loadingPlans || Boolean(plansError)} onClick={() => { setShowForm(true); setError(""); }} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 font-bold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50">
        Lanjut isi data diri
      </button>
    </div>;
  }

  return <Card className="mx-auto max-w-2xl p-5 sm:p-8">
    <button type="button" onClick={() => { setShowForm(false); setError(""); }} className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-lg border border-soft px-3 text-sm font-semibold text-ink hover:bg-soft/40"><ArrowLeft size={16} /> Ganti paket</button>
    <div className="mb-6">
      <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1.5 text-xs font-bold text-brand-700"><Crown size={15} /> Paket {plan?.name}</span>
      <h2 className="mt-3 text-2xl font-extrabold text-ink">Lengkapi data membership</h2>
      <p className="mt-1 text-sm leading-6 text-muted">{plan && <>{formatMembershipPrice(plan.monthly_price)}/bulan · diskon {plan.discount_percent}%.</>} Setelah mendaftar, admin akan menghubungi Anda untuk konfirmasi pembayaran dan aktivasi.</p>
    </div>

    <form onSubmit={submit} noValidate className="space-y-4">
      <label className="block text-sm font-semibold text-ink">Nama lengkap
        <input name="fullName" required minLength={2} maxLength={120} autoComplete="name" className="mt-1.5 min-h-11 w-full rounded-xl border border-soft px-4 font-normal outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15" placeholder="Nama sesuai identitas" />
      </label>
      <label className="block text-sm font-semibold text-ink">Nomor WhatsApp
        <input name="phone" required type="tel" inputMode="tel" autoComplete="tel" className="mt-1.5 min-h-11 w-full rounded-xl border border-soft px-4 font-normal outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15" placeholder="Nomor WhatsApp aktif" />
      </label>
      <label className="block text-sm font-semibold text-ink">Email <span className="font-normal text-muted">(opsional)</span>
        <input name="email" type="email" maxLength={254} autoComplete="email" className="mt-1.5 min-h-11 w-full rounded-xl border border-soft px-4 font-normal outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15" placeholder="Alamat email" />
      </label>
      <label className="flex items-start gap-3 rounded-xl bg-soft/60 p-3 text-sm leading-5 text-muted">
        <input name="consent" type="checkbox" required className="mt-1 size-4 shrink-0 accent-brand-600" />
        <span>Saya setuju data ini disimpan untuk keperluan membership Cuci.in.</span>
      </label>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={submitting} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 font-bold text-white transition-colors hover:bg-brand-600 disabled:cursor-wait disabled:opacity-60">
        {submitting ? <><LoaderCircle size={17} className="animate-spin" /> Mengirim pendaftaran...</> : <><BadgeCheck size={18} /> Ajukan membership</>}
      </button>
      <p className="text-center text-xs leading-5 text-muted">Setiap nomor WhatsApp hanya dapat digunakan untuk satu pendaftaran membership.</p>
    </form>
  </Card>;
}
