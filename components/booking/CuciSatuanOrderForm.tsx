"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, PackageCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { usePublicCatalog } from "@/lib/hooks/use-public-catalog";
import { isValidIndonesianPhone } from "@/lib/utils/phone";
import { formatRupiah } from "@/lib/utils/format";
import { LOCAL_LAUNDRY_ITEMS } from "@/lib/data/laundry-items";
import type { OrderTracking } from "@/types";

export function CuciSatuanOrderForm({ initialItemId }: { initialItemId?: string }) {
  const { catalog, isLoading: catalogLoading, error: catalogError, usingLocalItems } = usePublicCatalog();
  const items = catalog?.items.length ? catalog.items : LOCAL_LAUNDRY_ITEMS;
  const usingLocalCatalog = usingLocalItems || !catalog?.items.length;
  const [itemId, setItemId] = useState(() => LOCAL_LAUNDRY_ITEMS.find((item) => item.slug === initialItemId || item.id === initialItemId)?.id ?? LOCAL_LAUNDRY_ITEMS[0]?.id ?? "");
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
    if (!isValidIndonesianPhone(phone)) { setSubmitError("Masukkan nomor WhatsApp yang valid."); return; }
    if (pickupAddress.length < 8) { setSubmitError("Alamat penjemputan perlu mencantumkan detail yang cukup."); return; }

    if (usingLocalCatalog) {
      const message = [
        "Halo Cuci.in, saya ingin memesan cuci satuan.",
        `Pakaian: ${selected.name}`,
        `Jumlah: ${quantity} item`,
        `Metode perawatan: ${selected.processingMethod}`,
        `Perkiraan harga: ${formatRupiah(total)}`,
        `Nama: ${customerName}`,
        `Nomor WhatsApp: ${phone}`,
        `Alamat penjemputan: ${pickupAddress}`,
        "Mohon konfirmasi harga dan jadwal penjemputan. Terima kasih.",
      ].join("\n");
      window.location.href = `https://wa.me/6285211981471?text=${encodeURIComponent(message)}`;
      return;
    }

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
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">Harga satuan sudah tercatat. Setujui penawaran melalui halaman cek status sebelum pengerjaan dimulai.</p>
        <div className="mx-auto mt-4 max-w-md rounded-xl bg-soft/50 p-4 text-left text-sm">
          <p className="font-semibold text-ink">{createdOrder.customerName}</p>
          <p className="mt-1 text-muted">{createdOrder.phone}</p>
          <p className="mt-1 text-muted">{createdOrder.pickupAddress}</p>
          <p className="mt-2 font-medium text-ink">{createdOrder.serviceName} · {formatRupiah(createdOrder.total ?? 0)}</p>
          {createdOrder.processingMethod && <p className="mt-1 text-muted">Metode: {createdOrder.processingMethod}</p>}
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href={`/cek-status?kode=${createdOrder.code}`} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600"><PackageCheck size={16} /> Lacak pesanan</Link>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate data-wa-order-type="SATUAN" data-wa-selection={selected?.name ?? ""} data-wa-quantity={quantity} className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold text-ink">1. Pilih jenis pakaian</h2>
          <p className="mt-1 text-sm text-muted">Harga dihitung per item dan langsung terlihat di ringkasan pesanan.</p>
          {catalogLoading && <p role="status" className="mt-4 text-sm text-muted">Menyiapkan daftar cucian...</p>}
          {!catalogLoading && !catalogError && items.length === 0 && !catalog?.catalogWarning && <p className="mt-4 text-sm text-muted">Belum ada jenis cucian aktif. Silakan hubungi pengelola laundry.</p>}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <button key={item.id} type="button" onClick={() => setItemId(item.id)} aria-pressed={item.id === itemId} className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${item.id === itemId ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-soft bg-white hover:border-brand-300"}`}>
                <span><span className="block font-semibold text-ink">{item.name}</span><span className="mt-1 block text-xs font-normal text-muted">{item.processingMethod}</span></span>
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
          <input id="quantity" name="quantity" type="number" min={1} max={99} step={1} value={quantity} onChange={(event) => setQuantity(Math.min(99, Math.max(1, Math.trunc(Number(event.target.value) || 1))))} disabled={!selected} className="mt-2 w-full rounded-xl border border-brand-200 px-3.5 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50" />
          <div className="mt-5 space-y-3 border-t border-soft pt-4 text-sm">
            <div className="flex justify-between gap-3 text-muted"><span>Harga per item</span><span>{formatRupiah(selected?.price ?? 0)}</span></div>
            <div className="flex justify-between gap-3 text-muted"><span>Jumlah</span><span>{quantity} item</span></div>
            <div className="flex justify-between gap-3 border-t border-soft pt-3 text-base font-extrabold text-ink"><span>Total</span><span className="text-brand-700">{formatRupiah(total)}</span></div>
          </div>
          <button type="submit" disabled={isSubmitting || !selected} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-wait disabled:opacity-60"><PackageCheck size={18} /> {usingLocalCatalog ? "Pesan via WhatsApp" : isSubmitting ? "Menyimpan..." : "Buat pesanan satuan"}</button>
          {usingLocalCatalog && <p className="mt-3 text-xs leading-relaxed text-muted">Pilihan dan detail pesanan akan disiapkan di pesan WhatsApp.</p>}
        </Card>
      </aside>
      {submitError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 lg:col-span-2">{submitError}</p>}
    </form>
  );
}
