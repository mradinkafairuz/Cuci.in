"use client";

import { useState } from "react";
import { Check, Loader2, Search, SearchX } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getOrderByCode } from "@/lib/services/orders";
import { isValidOrderCode } from "@/lib/utils/order-code";
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

export function OrderStatusForm({ initialCode = "" }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode.toUpperCase());
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

    setCode(value);
    setFieldError("");
    setOrder(null);
    setState("loading");
    try {
      const result = await getOrderByCode(value);
      setOrder(result);
      setState(result ? "found" : "notfound");
    } catch {
      setState("error");
    }
  }

  const currentStep = order ? progressIndex[order.status] : -1;
  const isCancelled = order?.status === "dibatalkan";
  const message = order?.customerMessage?.trim()
    || (order ? defaultMessage[order.status] : "");

  return (
    <section id="cek-status" className="mx-auto max-w-4xl scroll-mt-20 px-4 py-10 sm:px-6 sm:py-16">
      <header className="text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-700">Cek status</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Lacak pesanan Anda</h1>
        <p className="mt-3 text-sm text-muted sm:text-base">Masukkan kode pesanan untuk melihat progres cucian.</p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-3 sm:flex-row">
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
            <p className="mt-1 text-sm text-muted">Periksa kembali kode pesanan yang Anda terima.</p>
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
              <div>
                <dt className="text-muted">Estimasi selesai</dt>
                <dd className="mt-0.5 font-semibold text-ink">{order.estimatedDone}</dd>
              </div>
            </dl>
          </Card>
        )}
      </div>
    </section>
  );
}
