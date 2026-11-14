"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, PackageCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { usePublicCatalog } from "@/lib/hooks/use-public-catalog";
import { isValidIndonesianPhone } from "@/lib/utils/phone";
import { formatRupiah } from "@/lib/utils/format";
import type { OrderTracking } from "@/types";

export function CuciSatuanOrderForm({ initialItemId }: { initialItemId?: string }) {
  const { catalog, isLoading: catalogLoading, error: catalogError } = usePublicCatalog();
  const items = catalog?.items ?? [];
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [createdOrder, setCreatedOrder] = useState<OrderTracking | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);
  const selected = items.find((item) => item.id === itemId) ?? null;
  const total = selected ? selected.price * quantity : 0;

  useEffect(() => {
    if (!catalog) return;
    const initial = catalog.items.find((item) => item.slug === initialItemId || item.id === initialItemId);
    setItemId(initial?.id ?? catalog.items[0]?.id ?? "");
  }, [catalog, initialItemId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (!selected) {
      setSubmitError("Pilih jenis cucian yang tersedia sebelum membuat pesanan.");
      return;
    }
    const formData = new FormData(event.currentTarget);
    const customerName = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const pickupAddress = String(formData.get("address") ?? "").trim();
    if (customerName.length < 2) { setSubmitError("Nama lengkap minimal 2 karakter."); return; }
    if (!isValidIndonesianPhone(phone)) { setSubmitError("Masukkan nomor WhatsApp Indonesia yang valid, misalnya 081234567890."); return; }
    if (pickupAddress.length < 8) { setSubmitError("Alamat penjemputan perlu mencantumkan detail yang cukup."); return; }

    submitting.current = true;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderType: "SATUAN", itemId: selected.id, quantity, customerName, phone, pickupAddress }),
      });
      const result: { order?: OrderTracking; error?: string } = await response.json();
      if (!response.ok || !result.order) throw new Error(result.error ?? "Pesanan tidak dapat disimpan.");
      setCreatedOrder(result.order);
    } catch (error) {
      submitting.current = false;
      setIsSubmitting(false);
      setSubmitError(error instanceof Error ? error.message : "Pesanan tidak dapat disimpan. Silakan coba lagi.");
    }
  }

  if (createdOrder) {
    return (
      <Card className="mx-auto max-w-2xl px-6 py-10 text-center sm:px-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 size={30} /></span>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.15em] text-brand-600">Permintaan tersimpan</p>
        <h2 className="mt-2 text-3xl font-bold text-ink">Pesanan cuci satuan dibuat</h2>
        <p className="mt-3 text-muted">Kode pesanan Anda</p>
        <p className="mt-1 font-mono text-2xl font-bold text-brand-700">{createdOrder.code}</p>
        <div className="mx-auto mt-4 max-w-md rounded-xl bg-soft/50 p-4 text-left text-sm">
          <p className="font-semibold text-ink">{createdOrder.customerName}</p>
          <p className="mt-1 text-muted">{createdOrder.phone}</p>
          <p className="mt-1 text-muted">{createdOrder.pickupAddress}</p>
          <p className="mt-2 font-medium text-ink">{createdOrder.serviceName} · {formatRupiah(createdOrder.total ?? 0)}</p>
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href={`/cek-status?kode=${createdOrder.code}`} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600"><PackageCheck size={16} /> Lacak pesanan</Link>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold text-ink">1. Pilih jenis pakaian</h2>
          <p className="mt-1 text-sm text-muted">Harga dihitung per item dan langsung terlihat di ringkasan pesanan.</p>
          {catalogLoading && <p role="status" className="mt-4 text-sm text-muted">Memuat daftar cucian...</p>}
          {catalogError && <p role="alert" className="mt-4 text-sm text-red-600">{catalogError}</p>}
          {!catalogLoading && !catalogError && items.length === 0 && <p className="mt-4 text-sm text-muted">Belum ada jenis cucian aktif. Silakan hubungi pengelola laundry.</p>}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <button key={item.id} type="button" onClick={() => setItemId(item.id)} aria-pressed={item.id === itemId} className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${item.id === itemId ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-soft bg-white hover:border-brand-300"}`}>
                <span className="font-semibold text-ink">{item.name}</span>
                <span className="shrink-0 text-sm font-bold text-brand-700">{formatRupiah(item.price)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-soft bg-white p-5 sm:p-6">
          <h2 className="text-xl font-bold text-ink">2. Data penjemputan</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-ink">Nama lengkap
              <input name="name" required minLength={2} autoComplete="name" className="mt-1.5 w-full rounded-xl border border-brand-200 px-3.5 py-3 font-normal outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="Nama Anda" />
            </label>
            <label className="text-sm font-medium text-ink">Nomor WhatsApp
              <input name="phone" required type="tel" inputMode="tel" autoComplete="tel" className="mt-1.5 w-full rounded-xl border border-brand-200 px-3.5 py-3 font-normal outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="08xxxxxxxxxx" />
            </label>
            <label className="text-sm font-medium text-ink sm:col-span-2">Alamat penjemputan
              <textarea name="address" required minLength={8} rows={3} autoComplete="street-address" className="mt-1.5 w-full resize-y rounded-xl border border-brand-200 px-3.5 py-3 font-normal outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="Jalan, nomor rumah, kecamatan, dan patokan" />
            </label>
          </div>
        </section>
      </div>

      <aside className="h-fit lg:sticky lg:top-6">
        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-bold text-ink">Ringkasan pesanan</h2>
          <label htmlFor="quantity" className="mt-5 block text-sm font-medium text-ink">Jumlah {selected?.name ?? "item"}</label>
          <input id="quantity" type="number" min={1} max={99} step={1} value={quantity} onChange={(event) => setQuantity(Math.min(99, Math.max(1, Math.trunc(Number(event.target.value) || 1))))} disabled={!selected} className="mt-2 w-full rounded-xl border border-brand-200 px-3.5 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50" />
          <div className="mt-5 space-y-3 border-t border-soft pt-4 text-sm">
            <div className="flex justify-between gap-3 text-muted"><span>Harga per item</span><span>{formatRupiah(selected?.price ?? 0)}</span></div>
            <div className="flex justify-between gap-3 text-muted"><span>Jumlah</span><span>{quantity} item</span></div>
            <div className="flex justify-between gap-3 border-t border-soft pt-3 text-base font-extrabold text-ink"><span>Total</span><span className="text-brand-700">{formatRupiah(total)}</span></div>
          </div>
          <button type="submit" disabled={isSubmitting || catalogLoading || !selected} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-wait disabled:opacity-60"><PackageCheck size={18} /> {isSubmitting ? "Menyimpan..." : "Buat pesanan satuan"}</button>
          <p className="mt-3 text-xs leading-relaxed text-muted">Pesanan akan disimpan ke database laundry.</p>
        </Card>
      </aside>
      {submitError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 lg:col-span-2">{submitError}</p>}
    </form>
  );
}
