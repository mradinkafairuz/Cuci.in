"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, PackageCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { NearbyLaundryFinder } from "@/components/booking/NearbyLaundryFinder";
import { usePublicCatalog } from "@/lib/hooks/use-public-catalog";
import { isValidIndonesianPhone } from "@/lib/utils/phone";
import { formatRupiah } from "@/lib/utils/format";
import type { OrderTracking } from "@/types";

export function BookingForm({ initialServiceId }: { initialServiceId?: string }) {
  const { catalog, isLoading: catalogLoading, error: catalogError } = usePublicCatalog();
  const services = catalog?.services ?? [];
  const [serviceId, setServiceId] = useState("");
  const [createdOrder, setCreatedOrder] = useState<OrderTracking | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);
  const selected = services.find((service) => service.id === serviceId) ?? null;

  useEffect(() => {
    if (!catalog) return;
    const initial = catalog.services.find((service) => service.slug === initialServiceId || service.name === initialServiceId);
    setServiceId(initial?.id ?? catalog.services[0]?.id ?? "");
  }, [catalog, initialServiceId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (!selected) {
      setSubmitError("Pilih layanan yang tersedia sebelum membuat pesanan.");
      return;
    }
    const data = new FormData(event.currentTarget);
    const customerName = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const pickupAddress = String(data.get("address") ?? "").trim();
    if (customerName.length < 2) {
      setSubmitError("Nama lengkap minimal 2 karakter.");
      return;
    }
    if (!isValidIndonesianPhone(phone)) {
      setSubmitError("Masukkan nomor WhatsApp Indonesia yang valid, misalnya 081234567890.");
      return;
    }
    if (pickupAddress.length < 8) {
      setSubmitError("Alamat penjemputan perlu mencantumkan detail yang cukup.");
      return;
    }

    submitting.current = true;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderType: "KILOAN", serviceId: selected.id, customerName, phone, pickupAddress }),
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
        <h1 className="mt-2 text-3xl font-bold text-ink">Pesanan Anda siap dilacak</h1>
        <p className="mt-3 text-muted">Kode pesanan Anda:</p>
        <p className="mt-1 font-mono text-2xl font-bold text-brand-700">{createdOrder.code}</p>
        <div className="mx-auto mt-4 max-w-md rounded-xl bg-soft/50 p-4 text-left text-sm">
          <p className="font-semibold text-ink">{createdOrder.customerName}</p>
          <p className="mt-1 text-muted">{createdOrder.phone}</p>
          <p className="mt-1 text-muted">{createdOrder.pickupAddress}</p>
          <p className="mt-2 font-medium text-ink">{createdOrder.serviceName} · estimasi {createdOrder.estimatedDone}</p>
        </div>
        <p className="mt-4 text-sm text-muted">Simpan kode ini untuk melihat perkembangan pesanan Anda.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href={`/cek-status?kode=${createdOrder.code}`} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600"><PackageCheck size={16} /> Lacak pesanan</Link>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-4xl space-y-6">
      <section>
        <h2 className="text-xl font-bold text-ink">1. Pilih layanan</h2>
        <p className="mt-1 text-sm text-muted">Tarif yang ditampilkan per kilogram. Tagihan akhir mengikuti berat aktual setelah cucian ditimbang.</p>
        {catalogLoading && <p role="status" className="mt-4 text-sm text-muted">Memuat layanan...</p>}
        {catalogError && <p role="alert" className="mt-4 text-sm text-red-600">{catalogError}</p>}
        {!catalogLoading && !catalogError && services.length === 0 && <p className="mt-4 text-sm text-muted">Belum ada layanan aktif. Silakan hubungi pengelola laundry.</p>}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {services.map((service) => (
            <button key={service.id} type="button" onClick={() => setServiceId(service.id)} aria-pressed={service.id === serviceId} className={`rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${service.id === serviceId ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-soft bg-white hover:border-brand-300"}`}>
              <span className="flex items-start justify-between gap-3"><span className="font-semibold text-ink">{service.name}</span><span className="text-sm font-bold text-brand-700">{formatRupiah(service.pricePerKg)}/kg</span></span>
              {service.description && <span className="mt-2 block text-sm text-muted">{service.description}</span>}
              <span className="mt-3 inline-flex items-center gap-1 text-xs text-muted"><Clock size={13} /> Estimasi {service.estimateDays} hari</span>
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
            <input name="phone" required type="tel" inputMode="tel" autoComplete="tel" className="mt-1.5 w-full rounded-xl border border-brand-200 px-3.5 py-3 font-normal outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="08xxxxxxxxxx" aria-describedby="booking-phone-help" />
            <span id="booking-phone-help" className="mt-1 block text-xs font-normal text-muted">Gunakan nomor Indonesia yang bisa dihubungi.</span>
          </label>
          <label className="text-sm font-medium text-ink sm:col-span-2">Alamat penjemputan
            <textarea name="address" required minLength={8} rows={3} autoComplete="street-address" className="mt-1.5 w-full resize-y rounded-xl border border-brand-200 px-3.5 py-3 font-normal outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="Jalan, nomor rumah, kecamatan, dan patokan" />
          </label>
        </div>
      </section>

      <NearbyLaundryFinder />

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted">Layanan dipilih</p>
          <p className="font-semibold text-ink">{selected ? `${selected.name} · ${formatRupiah(selected.pricePerKg)}/kg` : "Pilih layanan"}</p>
          {selected && <Badge><Clock size={12} className="mr-1" /> Estimasi {selected.estimateDays} hari</Badge>}
        </div>
        <button type="submit" disabled={isSubmitting || catalogLoading || !selected} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-wait disabled:opacity-60">
          <PackageCheck size={18} /> {isSubmitting ? "Menyimpan..." : "Buat pesanan"}
        </button>
      </Card>
      {submitError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>}
      <p className="text-center text-xs text-muted">Pesanan akan disimpan ke database laundry.</p>
    </form>
  );
}
