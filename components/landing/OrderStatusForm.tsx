"use client";

import { useState } from "react";
import { Loader2, Search, SearchX } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatRupiah } from "@/lib/utils/format";
import { getOrderByCode } from "@/lib/services/orders";
import { isValidOrderCode } from "@/lib/utils/order-code";
import type { OrderStatus, OrderTracking } from "@/types";
import { OrderProgress } from "@/components/landing/OrderProgress";

const statusLabel: Record<OrderStatus, string> = {
  menunggu: "Menunggu",
  diterima: "Diterima",
  dicuci: "Sedang Dicuci",
  disetrika: "Sedang Disetrika",
  siap_diambil: "Siap Diambil",
  selesai: "Selesai",
};

type ViewState = "idle" | "loading" | "found" | "notfound" | "error";

// Form cek status: validasi -> loading -> hasil / tidak ditemukan / error.
export function OrderStatusForm({ initialCode = "" }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode);
  const [fieldError, setFieldError] = useState("");
  const [state, setState] = useState<ViewState>("idle");
  const [order, setOrder] = useState<OrderTracking | null>(null);
  const [quoteDecisionLoading, setQuoteDecisionLoading] = useState(false);
  const [quoteDecisionError, setQuoteDecisionError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return; // cegah double-click

    const value = code.trim();
    if (!value) {
      setFieldError("Kode pesanan wajib diisi.");
      return;
    }
    if (!isValidOrderCode(value)) {
      setFieldError("Format kode tidak valid. Periksa kode pesanan yang Anda terima.");
      return;
    }

    setFieldError("");
    setState("loading");
    try {
      const result = await getOrderByCode(value);
      setOrder(result);
      setState(result ? "found" : "notfound");
    } catch {
      setState("error");
    }
  }

  async function decideQuote(decision: "approve" | "reject") {
    if (!order || quoteDecisionLoading) return;
    setQuoteDecisionLoading(true);
    setQuoteDecisionError("");
    try {
      const response = await fetch("/api/orders/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: order.code, decision }),
      });
      const result: { error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Persetujuan harga belum dapat disimpan.");
      const refreshed = await getOrderByCode(order.code);
      if (!refreshed) throw new Error("Status terbaru belum dapat dimuat. Silakan cek ulang kode pesanan.");
      setOrder(refreshed);
    } catch (error) {
      setQuoteDecisionError(error instanceof Error ? error.message : "Persetujuan harga belum dapat disimpan.");
    } finally {
      setQuoteDecisionLoading(false);
    }
  }

  return (
    <section id="cek-status" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Cek Status"
        title="Lacak pesanan Anda"
        subtitle="Masukkan kode pesanan untuk melihat progres cucian."
      />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Contoh: LDR-7K3M-9Q2R"
            aria-label="Kode pesanan"
            aria-invalid={!!fieldError}
            className="w-full rounded-xl border border-brand-300 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
          />
          {fieldError && <p className="mt-1.5 text-sm text-red-500">{fieldError}</p>}
        </div>
        <Button type="submit" disabled={state === "loading"} className="py-3">
          {state === "loading" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Search size={16} />
          )}
          {state === "loading" ? "Mencari..." : "Cek Status"}
        </Button>
      </form>

      <div className="mt-6" aria-live="polite">
        {state === "loading" && (
          <Card className="animate-pulse space-y-3">
            <div className="h-5 w-1/3 rounded bg-soft" />
            <div className="h-4 w-2/3 rounded bg-soft" />
            <div className="h-4 w-1/2 rounded bg-soft" />
          </Card>
        )}

        {state === "notfound" && (
          <Card className="flex flex-col items-center py-10 text-center">
            <SearchX size={36} className="text-brand-300" />
            <p className="mt-3 font-semibold text-ink">Pesanan tidak ditemukan</p>
            <p className="text-sm text-muted">Periksa kembali kode pesanan Anda.</p>
          </Card>
        )}

        {state === "error" && (
          <Card className="border-red-200 bg-red-50 text-center text-sm text-red-600">
            Terjadi kesalahan. Silakan coba lagi.
          </Card>
        )}

        {state === "found" && order && (
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-ink">{order.code}</h3>
              <Badge tone={order.status === "siap_diambil" ? "success" : "info"}>
                {statusLabel[order.status]}
              </Badge>
            </div>
            <OrderProgress status={order.status} />
            {order.priceQuoteStatus === "menunggu_timbang" && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Cucian sedang menunggu ditimbang. Petugas akan mengirim harga final untuk Anda setujui sebelum pengerjaan dimulai.
              </div>
            )}
            {order.priceQuoteStatus === "menunggu_persetujuan" && (
              <div className="mt-5 rounded-xl border border-brand-300/50 bg-brand-50/70 p-4">
                <p className="font-bold text-ink">Konfirmasi penawaran harga</p>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  {order.processingMethod && <div><dt className="text-muted">Metode pengerjaan</dt><dd className="font-semibold text-ink">{order.processingMethod}</dd></div>}
                  {order.weightKg != null && <div><dt className="text-muted">Berat aktual</dt><dd className="font-semibold text-ink">{order.weightKg} kg</dd></div>}
                  <div><dt className="text-muted">Total penawaran</dt><dd className="text-lg font-extrabold text-brand-700">{formatRupiah(order.total ?? 0)}</dd></div>
                </dl>
                <p className="mt-2 text-xs text-muted">Pengerjaan baru dimulai setelah Anda menyetujui harga ini.</p>
                {quoteDecisionError && <p role="alert" className="mt-3 text-sm text-red-700">{quoteDecisionError}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" disabled={quoteDecisionLoading} onClick={() => void decideQuote("approve")}>
                    {quoteDecisionLoading ? "Menyimpan..." : "Setujui harga"}
                  </Button>
                  <Button type="button" variant="outline" disabled={quoteDecisionLoading} onClick={() => void decideQuote("reject")}>
                    Tolak penawaran
                  </Button>
                </div>
              </div>
            )}
            {order.priceQuoteStatus === "disetujui" && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">Harga sudah Anda setujui. Pesanan mulai diproses.</p>}
            {order.priceQuoteStatus === "ditolak" && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800">Penawaran ditolak. Hubungi Cuci.in jika ingin membahas perubahan layanan atau harga.</p>}
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-muted">Layanan</dt><dd className="font-medium text-ink">{order.serviceName}</dd></div>
              <div><dt className="text-muted">Estimasi selesai</dt><dd className="font-medium text-ink">{order.estimatedDone}</dd></div>
              {order.priceQuoteStatus !== "menunggu_persetujuan" && order.total != null && <div><dt className="text-muted">Total</dt><dd className="font-medium text-ink">{formatRupiah(order.total)}</dd></div>}
            </dl>
          </Card>
        )}
      </div>
    </section>
  );
}
