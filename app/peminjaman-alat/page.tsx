"use client";

import Link from "next/link";
import { BadgeCheck, CalendarDays, ShieldCheck, WashingMachine } from "lucide-react";
import { EquipmentLoanForm } from "@/components/loans/EquipmentLoanForm";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { usePublicCatalog } from "@/lib/hooks/use-public-catalog";
import { formatRupiah } from "@/lib/utils/format";

function EquipmentLoanContent() {
  const { catalog, isLoading, error } = usePublicCatalog();
  const equipment = catalog?.equipment ?? [];

  return <main className="min-h-screen bg-soft/35 px-4 py-10 sm:px-6 sm:py-14">
    <div className="mx-auto max-w-6xl">
      <Link href="/" className="mb-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted hover:text-brand-700">← Kembali ke beranda</Link>
      <div className="mb-9 max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand-700"><WashingMachine size={15} /> Peminjaman alat laundry</span>
        <h1 className="mt-4 text-3xl font-extrabold text-ink sm:text-5xl">Peralatan laundry untuk kebutuhan Anda</h1>
        <p className="mt-4 text-base leading-7 text-muted">Ajukan peminjaman mesin cuci, setrika uap, pengering, dan alat pendukung lainnya. Petugas kami akan menghubungi Anda untuk konfirmasi.</p>
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section>
          {isLoading && <p role="status" className="mb-4 text-sm text-muted">Memuat daftar alat...</p>}
          {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {equipment.map((item) => <article key={item.id} className="flex gap-4 rounded-2xl border border-soft bg-white p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-700"><WashingMachine size={20} /></span>
              <div className="min-w-0">
                <h2 className="font-bold text-ink">{item.name}</h2>
                <p className="mt-1 text-sm text-muted">{item.description}</p>
                <p className="mt-2 text-sm font-bold text-brand-700">
                  {item.price === null ? "Tanya ke admin" : `${formatRupiah(item.price)}${item.priceUnit ? ` / ${item.priceUnit}` : ""}`}
                </p>
              </div>
            </article>)}
          </div>
          {!isLoading && !error && equipment.length === 0 && <p className="rounded-2xl border border-soft bg-white p-5 text-sm text-muted">Belum ada alat aktif untuk dipinjam.</p>}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              { icon: CalendarDays, text: "Tentukan masa peminjaman" },
              { icon: ShieldCheck, text: "Petugas konfirmasi ketersediaan" },
              { icon: BadgeCheck, text: "Tanpa perlu login pelanggan" },
            ].map(({ icon: Icon, text }) => <p key={text} className="flex min-h-11 items-center gap-2 text-sm font-medium text-muted"><Icon size={17} className="text-brand-600" />{text}</p>)}
          </div>
        </section>
        <EquipmentLoanForm equipment={equipment.map(({ id, name }) => ({ id, name }))} />
      </div>
    </div>
  </main>;
}

export default function EquipmentLoanPage() {
  return <>
    <Navbar />
    <EquipmentLoanContent />
    <Footer />
  </>;
}
