"use client";

import { useState } from "react";
import { Check, Loader2, Search, SearchX } from "@/lib/icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getOrderByCode } from "@/lib/services/orders";
import { isValidOrderCode } from "@/lib/utils/order-code";
import { formatRupiah } from "@/lib/utils/format";
import { formatPickupWindow } from "@/lib/utils/pickup-schedule";
import type { OrderStatus, OrderTracking } from "@/types";
import { OrderProgress } from "@/components/landing/OrderProgress";

const statusLabel: Record<OrderStatus, string> = {
  menunggu: "Menunggu",
  diterima: "Diterima",
  diproses: "Diproses",
  dicuci: "Sedang Dicuci",
  disetrika: "Sedang Disetrika",
  siap_diambil: "Siap Diambil",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

const progressSteps = ["Masuk", "Diterima", "Dicuci", "Disetrika", "Siap", "Selesai"];
const progressIndex: Record<OrderStatus, number> = {
  menunggu: 0,
  diterima: 1,
  diproses: 2,
  dicuci: 2,
  disetrika: 3,
  siap_diambil: 4,
  selesai: 5,
  dibatalkan: -1,
};
const defaultMessage: Record<OrderStatus, string> = {
  menunggu: "Pesanan Anda sudah masuk dan menunggu konfirmasi petugas.",
  diterima: "Pesanan Anda sudah diterima dan akan segera diproses.",
  diproses: "Pesanan Anda sedang diproses oleh petugas.",
  dicuci: "Cucian Anda sedang dicuci.",
  disetrika: "Cucian Anda sedang disetrika dan dirapikan.",
  siap_diambil: "Pesanan Anda sudah siap diambil atau diantar.",
  selesai: "Pesanan telah selesai. Terima kasih telah menggunakan Cuci.in!",
  dibatalkan: "Pesanan ini dibatalkan. Silakan hubungi petugas jika perlu bantuan.",
};

type ViewState = "idle" | "loading" | "found" | "notfound" | "error";

export function OrderStatusForm({
  initialCode = "",
  initialPhoneLast4 = "",
  compact = false,
}: {
  initialCode?: string;
  initialPhoneLast4?: string;
  compact?: boolean;
}) {
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [phoneLast4, setPhoneLast4] = useState(initialPhoneLast4);
  const [fieldError, setFieldError] = useState("");
  const [state, setState] = useState<ViewState>("idle");
  const [order, setOrder] = useState<OrderTracking | null>(null);
  const [quoteDecisionLoading, setQuoteDecisionLoading] = useState(false);
  const [quoteDecisionError, setQuoteDecisionError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "loading") return;

    const value = code.trim().toUpperCase();
    if (!value) {
      setFieldError("Kode pesanan wajib diisi.");
      return;
    }
    if (!isValidOrderCode(value)) {
      setFieldError("Format kode tidak valid. Periksa kode pesanan yang Anda terima.");
      return;
    }
    if (!/^\d{4}$/.test(phoneLast4.trim())) {
      setFieldError("Masukkan 4 digit terakhir nomor WhatsApp yang digunakan saat memesan.");
      return;
    }

    setCode(value);
    setFieldError("");
    setQuoteDecisionError("");
    setOrder(null);
    setState("loading");
    try {
      const result = await getOrderByCode(value, phoneLast4);
      setOrder(result);
      setState(result ? "found" : "notfound");
    } catch {
      setState("error");
    }
  }

  async function decidePriceQuote(decision: "approve" | "reject") {
    if (!order || quoteDecisionLoading) return;
    if (decision === "reject" && !window.confirm("Tolak penawaran harga ini? Hubungi petugas untuk membahas langkah selanjutnya.")) return;

    setQuoteDecisionLoading(true);
    setQuoteDecisionError("");
    try {
      const response = await fetch("/api/orders/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: order.code, phoneLast4: phoneLast4.trim(), decision }),
      });
      const result: { error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Keputusan harga belum dapat disimpan.");

      const refreshedOrder = await getOrderByCode(order.code, phoneLast4);
      if (!refreshedOrder) throw new Error("Pesanan tidak ditemukan setelah keputusan harga disimpan.");
      setOrder(refreshedOrder);
    } catch (failure) {
      setQuoteDecisionError(failure instanceof Error ? failure.message : "Keputusan harga belum dapat disimpan. Coba lagi.");
    } finally {
      setQuoteDecisionLoading(false);
    }
  }

  const currentStep = order ? progressIndex[order.status] : -1;
  const isCancelled = order?.status === "dibatalkan";
  const message = order?.customerMessage?.trim()
    || (order ? defaultMessage[order.status] : "");

  if (compact) {
    return (
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0079A8]">
            Cek Status
          </p>
          <h3 className="mt-1 text-xl font-extrabold tracking-tight text-[#0F172A]">
            Lacak Status Pesanan
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
            Masukkan kode pesanan dan 4 digit terakhir nomor WhatsApp untuk pantau progres &amp; konfirmasi harga.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-3">
          <div>
            <input
              value={code}
              onChange={(event) => {
                setCode(event.target.value.toUpperCase());
                if (fieldError) setFieldError("");
              }}
              placeholder="Contoh: LDR-XXXX-XXXX"
              autoComplete="off"
              aria-label="Kode pesanan"
              aria-invalid={Boolean(fieldError)}
              aria-describedby={fieldError ? "tracking-code-error" : undefined}
              className="min-h-11 w-full rounded-xl border border-brand-200 bg-white px-3.5 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <label className="block text-sm font-medium text-ink">
            <span className="sr-only">4 digit terakhir nomor WhatsApp</span>
            <input
              value={phoneLast4}
              onChange={(event) => {
                setPhoneLast4(event.target.value.replace(/\D/g, "").slice(0, 4));
                if (fieldError) setFieldError("");
              }}
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              placeholder="4 digit terakhir WhatsApp"
              aria-label="4 digit terakhir nomor WhatsApp"
              aria-invalid={Boolean(fieldError)}
              aria-describedby={fieldError ? "tracking-code-error" : undefined}
              className="min-h-11 w-full rounded-xl border border-brand-200 bg-white px-3.5 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </label>
          {fieldError && (
            <p id="tracking-code-error" className="text-xs font-medium text-red-600">
              {fieldError}
            </p>
          )}
          <Button type="submit" disabled={state === "loading"} className="min-h-11 w-full justify-center">
            {state === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {state === "loading" ? "Mencari..." : "Lacak Pesanan"}
          </Button>
        </form>

        <div className="mt-4" aria-live="polite">
          {state === "loading" && (
            <div className="animate-pulse space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="h-6 rounded bg-slate-200" />
            </div>
          )}

          {state === "notfound" && (
            <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-center">
              <SearchX size={28} className="text-brand-400" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-ink">Pesanan tidak ditemukan</p>
              <p className="mt-1 text-xs text-muted">
                Periksa kembali kode dan 4 digit terakhir nomor WhatsApp Anda.
              </p>
            </div>
          )}

          {state === "error" && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center">
              <p className="text-xs font-semibold text-red-700">Status pesanan belum dapat dimuat.</p>
              <Button type="button" onClick={() => setState("idle")} className="mt-3 min-h-9 px-3 text-xs">
                Coba lagi
              </Button>
            </div>
          )}

          {state === "found" && order && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-sm font-extrabold text-ink">{order.code}</p>
                <Badge tone={isCancelled ? "neutral" : order.status === "siap_diambil" || order.status === "selesai" ? "success" : "info"}>
                  {statusLabel[order.status]}
                </Badge>
              </div>
              {!isCancelled && (
                <div className="mt-3">
                  <OrderProgress status={order.status} />
                </div>
              )}
              <p className={`mt-3 rounded-xl px-3 py-2 text-xs font-semibold leading-relaxed ${
                isCancelled ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"
              }`}>
                {message}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-2.5 text-xs">
                <div>
                  <dt className="text-muted">Layanan</dt>
                  <dd className="font-semibold text-ink">{order.serviceName}</dd>
                </div>
                <div>
                  <dt className="text-muted">Estimasi</dt>
                  <dd className="font-semibold text-ink">{order.estimatedDone}</dd>
                </div>
                {order.total !== null && order.total !== undefined && (
                  <div>
                    <dt className="text-muted">Total</dt>
                    <dd className="font-semibold text-ink">{formatRupiah(order.total)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted">Pembayaran</dt>
                  <dd className="font-semibold text-ink">{order.paymentStatus === "lunas" ? "Lunas" : "Belum dibayar"}</dd>
                </div>
              </dl>

              {order.priceQuoteStatus === "menunggu_persetujuan" && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-bold text-amber-900">Tinjau dan setujui harga final</p>
                  <p className="mt-0.5 text-xs text-amber-900">
                    {order.weightKg !== null && order.weightKg !== undefined ? `${order.weightKg} kg · ` : ""}
                    {order.total !== null && order.total !== undefined ? formatRupiah(order.total) : "Menunggu konfirmasi"}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <Button type="button" disabled={quoteDecisionLoading} onClick={() => void decidePriceQuote("approve")} className="min-h-9 px-3 text-xs">
                      {quoteDecisionLoading ? "Menyimpan..." : "Setujui"}
                    </Button>
                    <Button type="button" variant="outline" disabled={quoteDecisionLoading} onClick={() => void decidePriceQuote("reject")} className="min-h-9 px-3 text-xs">
                      Tolak
                    </Button>
                  </div>
                  {quoteDecisionError && <p role="alert" className="mt-2 text-xs text-red-700">{quoteDecisionError}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <section id="cek-status" className="mx-auto max-w-4xl scroll-mt-20 px-4 py-10 sm:px-6 sm:py-16">
      <header className="text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-700">Cek status</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Lacak pesanan Anda</h1>
        <p className="mt-3 text-sm text-muted sm:text-base">Masukkan kode pesanan dan 4 digit terakhir nomor WhatsApp sebagai verifikasi.</p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-3 sm:grid-cols-[1fr_15rem_auto]">
        <div className="min-w-0 flex-1">
          <input
            value={code}
            onChange={(event) => {
              setCode(event.target.value.toUpperCase());
              if (fieldError) setFieldError("");
            }}
            placeholder="Contoh: LDR-XXXX-XXXX"
            autoComplete="off"
            aria-label="Kode pesanan"
            aria-invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? "tracking-code-error" : undefined}
            className="min-h-12 w-full rounded-xl border border-brand-200 bg-white px-4 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          {fieldError && <p id="tracking-code-error" className="mt-1.5 text-sm text-red-600">{fieldError}</p>}
        </div>
        <label className="block text-sm font-medium text-ink">
          <span className="sr-only">4 digit terakhir nomor WhatsApp</span>
          <input
            value={phoneLast4}
            onChange={(event) => {
              setPhoneLast4(event.target.value.replace(/\D/g, "").slice(0, 4));
              if (fieldError) setFieldError("");
            }}
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            placeholder="4 digit terakhir HP"
            aria-label="4 digit terakhir nomor WhatsApp"
            aria-invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? "tracking-code-error" : undefined}
            className="min-h-12 w-full rounded-xl border border-brand-200 bg-white px-4 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </label>
        <Button type="submit" disabled={state === "loading"} className="min-h-12 shrink-0 px-5">
          {state === "loading" ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
          {state === "loading" ? "Mencari..." : "Cek Status"}
        </Button>
      </form>

      <div className="mt-6" aria-live="polite">
        {state === "loading" && (
          <Card className="animate-pulse space-y-4 p-5 sm:p-6">
            <div className="h-5 w-1/3 rounded bg-soft" />
            <div className="h-8 rounded bg-soft" />
            <div className="h-4 w-2/3 rounded bg-soft" />
          </Card>
        )}

        {state === "notfound" && (
          <Card className="flex flex-col items-center py-10 text-center">
            <SearchX size={36} className="text-brand-400" aria-hidden="true" />
            <p className="mt-3 font-semibold text-ink">Pesanan tidak ditemukan</p>
            <p className="mt-1 text-sm text-muted">Periksa kembali kode dan 4 digit terakhir nomor WhatsApp Anda.</p>
          </Card>
        )}

        {state === "error" && (
          <Card className="text-center">
            <p className="text-sm font-semibold text-red-700">Status pesanan belum dapat dimuat.</p>
            <p className="mt-1 text-sm text-muted">Periksa koneksi Anda, lalu coba lagi.</p>
            <Button type="button" onClick={() => setState("idle")} className="mt-4 min-h-11">Coba lagi</Button>
          </Card>
        )}

        {state === "found" && order && (
          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-extrabold tracking-tight text-ink sm:text-xl">{order.code}</h2>
              <Badge tone={isCancelled ? "neutral" : order.status === "siap_diambil" || order.status === "selesai" ? "success" : "info"}>
                {statusLabel[order.status]}
              </Badge>
            </div>

            {!isCancelled ? (
              <div className="relative mt-8 pb-1" aria-label={`Progres pesanan: ${statusLabel[order.status]}`}>
                <div className="absolute left-[8.33%] right-[8.33%] top-3 h-1 rounded-full bg-[#dce9ec]" />
                <div
                  className="absolute left-[8.33%] top-3 h-1 rounded-full bg-emerald-500 transition-[width] duration-500"
                  style={{ width: `${(Math.max(currentStep, 0) / (progressSteps.length - 1)) * 83.34}%` }}
                />
                <ol className="relative grid grid-cols-6">
                  {progressSteps.map((step, index) => {
                    const complete = index < currentStep;
                    const current = index === currentStep;
                    return (
                      <li key={step} className="flex min-w-0 flex-col items-center gap-2 text-center">
                        <span className={`grid size-6 place-items-center rounded-full border-2 transition-colors ${
                          complete || current
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-[#dce9ec] bg-white text-transparent"
                        } ${current ? "ring-4 ring-emerald-100" : ""}`}>
                          {complete ? <Check size={13} strokeWidth={3} aria-hidden="true" /> : <span className="size-1.5 rounded-full bg-current" />}
                        </span>
                        <span className={`text-[10px] leading-tight sm:text-xs ${complete || current ? "font-bold text-emerald-800" : "text-muted"}`}>
                          {step}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ) : (
              <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">Progres pengerjaan berhenti karena pesanan dibatalkan.</p>
            )}

            <div className={`mt-5 rounded-xl px-4 py-3 text-sm font-semibold leading-6 ${
              isCancelled ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"
            }`}>
              {message}
            </div>

            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted">Layanan</dt>
                <dd className="mt-0.5 font-semibold text-ink">{order.serviceName}</dd>
              </div>
              {order.pickupAt && <div>
                <dt className="text-muted">Jadwal jemput</dt>
                <dd className="mt-0.5 font-semibold text-ink">{formatPickupWindow(order.pickupAt)}</dd>
              </div>}
              {order.pricePerKg !== null && order.pricePerKg !== undefined && <div>
                <dt className="text-muted">Tarif acuan</dt>
                <dd className="mt-0.5 font-semibold text-ink">{formatRupiah(order.pricePerKg)}/kg</dd>
              </div>}
              {order.weightKg !== null && order.weightKg !== undefined && <div>
                <dt className="text-muted">Berat aktual</dt>
                <dd className="mt-0.5 font-semibold text-ink">{order.weightKg} kg</dd>
              </div>}
              {order.total !== null && order.total !== undefined && <div>
                <dt className="text-muted">Total harga</dt>
                <dd className="mt-0.5 font-semibold text-ink">{formatRupiah(order.total)}</dd>
              </div>}
              <div>
                <dt className="text-muted">Estimasi selesai</dt>
                <dd className="mt-0.5 font-semibold text-ink">{order.estimatedDone}</dd>
              </div>
              <div>
                <dt className="text-muted">Pembayaran</dt>
                <dd className="mt-0.5 font-semibold text-ink">{order.paymentStatus === "lunas" ? "Lunas" : "Belum dibayar"}</dd>
              </div>
            </dl>

            {order.priceQuoteStatus === "menunggu_timbang" && (
              <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                Cucian kiloan menunggu penimbangan. Tarif per kilogram adalah acuan; total final akan dikirim setelah berat aktual dicatat.
              </p>
            )}
            {order.priceQuoteStatus === "menunggu_persetujuan" && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="font-bold text-amber-900">Tinjau dan setujui harga final</p>
                <p className="mt-1 text-sm leading-6 text-amber-900">
                  {order.weightKg !== null && order.weightKg !== undefined ? `${order.weightKg} kg · ` : ""}
                  {order.total !== null && order.total !== undefined ? formatRupiah(order.total) : "Total menunggu konfirmasi"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" disabled={quoteDecisionLoading} onClick={() => void decidePriceQuote("approve")}>
                    {quoteDecisionLoading ? "Menyimpan..." : "Setujui harga"}
                  </Button>
                  <Button type="button" variant="outline" disabled={quoteDecisionLoading} onClick={() => void decidePriceQuote("reject")}>
                    Tolak penawaran
                  </Button>
                </div>
                {quoteDecisionError && <p role="alert" className="mt-3 text-sm text-red-700">{quoteDecisionError}</p>}
              </div>
            )}
            {order.priceQuoteStatus === "disetujui" && (
              <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">Harga final telah Anda setujui.</p>
            )}
            {order.priceQuoteStatus === "ditolak" && (
              <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">Penawaran harga ditolak. Hubungi petugas melalui WhatsApp untuk membahas langkah selanjutnya.</p>
            )}
          </Card>
        )}
      </div>
    </section>
  );
}
