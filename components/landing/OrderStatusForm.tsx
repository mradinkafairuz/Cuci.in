"use client";

import { useState } from "react";
import { Loader2, Search, SearchX } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getOrderByCode } from "@/lib/services/orders";
import { isValidOrderCode } from "@/lib/utils/order-code";
import type { OrderStatus, OrderTracking } from "@/types";

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
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-muted">Layanan</dt><dd className="font-medium text-ink">{order.serviceName}</dd></div>
              <div><dt className="text-muted">Estimasi selesai</dt><dd className="font-medium text-ink">{order.estimatedDone}</dd></div>
            </dl>
          </Card>
        )}
      </div>
    </section>
  );
}
