"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, Clock3, Wrench } from "lucide-react";
import { isValidIndonesianPhone } from "@/lib/utils/phone";

type EquipmentOption = { id: string; name: string };

function getJakartaDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function EquipmentLoanForm({ equipment }: { equipment: EquipmentOption[] }) {
  const [today, setToday] = useState("");
  const [startDate, setStartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const date = getJakartaDate();
    setToday(date);
    setStartDate(date);
    setReturnDate(date);
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const phone = String(form.get("phone") ?? "").trim();
    if (!isValidIndonesianPhone(phone)) {
      setError("Masukkan nomor WhatsApp Indonesia yang aktif.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/equipment-loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          borrowerName: form.get("borrowerName"),
          phone,
          equipmentId: form.get("equipmentId"),
          quantity: Number(form.get("quantity")),
          startDate: form.get("startDate"),
          returnDate: form.get("returnDate"),
          notes: form.get("notes"),
        }),
      });
      const result = await response.json() as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error ?? "Permintaan gagal dikirim.");
      setMessage(result.message ?? "Permintaan peminjaman berhasil dikirim.");
      formElement.reset();
      setStartDate(today);
      setReturnDate(today);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Permintaan gagal dikirim.");
    } finally {
      setLoading(false);
    }
  }

  return <form onSubmit={submit} className="rounded-3xl border border-soft bg-white p-5 shadow-sm sm:p-8">
    <div className="mb-6">
      <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1.5 text-xs font-bold text-brand-700"><Wrench size={14} /> Form peminjaman</span>
      <h2 className="mt-3 text-2xl font-extrabold text-ink">Ajukan peminjaman</h2>
      <p className="mt-1 text-sm text-muted">Tim kami akan mengonfirmasi ketersediaan alat.</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-semibold text-ink">Nama peminjam
        <input name="borrowerName" required minLength={2} maxLength={120} placeholder="Nama lengkap" className="mt-1.5 min-h-11 w-full rounded-xl border border-soft px-4 font-normal outline-none focus:border-brand-500" />
      </label>
      <label className="text-sm font-semibold text-ink">Nomor WhatsApp
        <input name="phone" type="tel" required autoComplete="tel" placeholder="08xxxxxxxxxx" className="mt-1.5 min-h-11 w-full rounded-xl border border-soft px-4 font-normal outline-none focus:border-brand-500" />
      </label>
      <label className="text-sm font-semibold text-ink sm:col-span-2">Pilih alat
        <span className="relative mt-1.5 block">
          <select name="equipmentId" required defaultValue="" disabled={equipment.length === 0} className="min-h-11 w-full appearance-none rounded-xl border border-soft bg-white px-4 pr-10 font-normal outline-none focus:border-brand-500 disabled:bg-soft/40">
            <option value="" disabled>{equipment.length ? "Pilih alat yang ingin dipinjam" : "Alat belum tersedia"}</option>
            {equipment.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <ChevronDown size={17} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
        </span>
      </label>
      <label className="text-sm font-semibold text-ink">Jumlah
        <input name="quantity" type="number" min="1" max="10" defaultValue="1" required className="mt-1.5 min-h-11 w-full rounded-xl border border-soft px-4 font-normal outline-none focus:border-brand-500" />
      </label>
      <div className="hidden sm:block" />
      <label className="text-sm font-semibold text-ink">Tanggal mulai
        <input name="startDate" type="date" min={today} value={startDate} onChange={(event) => {
          const value = event.target.value;
          setStartDate(value);
          if (returnDate < value) setReturnDate(value);
        }} required className="mt-1.5 min-h-11 w-full rounded-xl border border-soft px-4 font-normal outline-none focus:border-brand-500" />
      </label>
      <label className="text-sm font-semibold text-ink">Rencana pengembalian
        <input name="returnDate" type="date" min={startDate} value={returnDate} onChange={(event) => setReturnDate(event.target.value)} required className="mt-1.5 min-h-11 w-full rounded-xl border border-soft px-4 font-normal outline-none focus:border-brand-500" />
      </label>
      <label className="text-sm font-semibold text-ink sm:col-span-2">Catatan (opsional)
        <textarea name="notes" maxLength={500} rows={3} placeholder="Keterangan tambahan" className="mt-1.5 w-full resize-y rounded-xl border border-soft px-4 py-3 font-normal outline-none focus:border-brand-500" />
      </label>
    </div>
    {equipment.length === 0 && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Belum ada alat aktif. Silakan hubungi admin.</p>}
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    {message && <p role="status" className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><CheckCircle2 size={18} className="shrink-0" />{message}</p>}
    <button disabled={loading || equipment.length === 0 || !today} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3.5 font-bold text-white hover:bg-brand-600 disabled:opacity-60">
      {loading ? <Clock3 size={17} className="animate-pulse" /> : <Wrench size={17} />}
      {loading ? "Mengirim permintaan..." : "Kirim permintaan"}
    </button>
    <p className="mt-3 text-center text-xs text-muted">Pelanggan tidak perlu membuat akun untuk meminjam alat.</p>
  </form>;
}
