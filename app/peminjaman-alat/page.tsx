"use client";

import { BadgeCheck, CalendarDays, Rows3, Shirt, ShieldCheck, ShoppingBasket, SprayCan, WashingMachine, Wind, type LucideIcon } from "lucide-react";
import { EquipmentLoanForm } from "@/components/loans/EquipmentLoanForm";
import { BackToHome } from "@/components/layout/BackToHome";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { usePublicCatalog } from "@/lib/hooks/use-public-catalog";
import { formatRupiah } from "@/lib/utils/format";

function getEquipmentIcon(name: string): LucideIcon {
  const normalized = name.toLowerCase();
  if (normalized.includes("mesin cuci")) return WashingMachine;
  if (normalized.includes("setrika")) return Shirt;
  if (normalized.includes("pengering")) return Wind;
  if (normalized.includes("steamer")) return SprayCan;
  if (normalized.includes("jemuran")) return Rows3;
  if (normalized.includes("keranjang")) return ShoppingBasket;
  return WashingMachine;
}

function EquipmentLoanContent() {
  const { catalog, isLoading, error, usingLocalEquipment } = usePublicCatalog();
  const equipment = catalog?.equipment ?? [];

  return <main className="min-h-[70vh] bg-soft/40 px-4 py-12 sm:px-6 sm:py-16">
    <div className="mx-auto max-w-6xl">
      <BackToHome />
      <div className="mb-9 max-w-2xl">
        <h1 className="text-3xl font-extrabold text-ink sm:text-5xl">Alat praktis untuk laundry rumahan</h1>
        <p className="mt-4 text-base leading-7 text-muted">Sewa peralatan untuk mencuci dan merawat pakaian di rumah. Petugas akan mengonfirmasi ketersediaan serta biaya, lalu alat disiapkan sesuai jadwal sewa.</p>
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section>
          {isLoading && <p role="status" className="mb-4 text-sm text-muted">Memuat daftar alat...</p>}
          {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {equipment.map((item) => {
              const Icon = getEquipmentIcon(item.name);
              return <article key={item.id} className="flex gap-4 rounded-2xl border border-soft bg-white p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-700"><Icon size={20} /></span>
              <div className="min-w-0">
                <h2 className="font-bold text-ink">{item.name}</h2>
                <p className="mt-1 text-sm text-muted">{item.description}</p>
                {item.price !== null && <p className="mt-2 text-sm font-bold text-brand-700">{formatRupiah(item.price)}{item.priceUnit ? ` / ${item.priceUnit}` : ""}</p>}
              </div>
            </article>;
            })}
          </div>
          {!isLoading && !error && equipment.length === 0 && <p className="rounded-2xl border border-soft bg-white p-5 text-sm text-muted">Belum ada alat aktif untuk disewa.</p>}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              { icon: CalendarDays, text: "Tentukan masa sewa" },
              { icon: ShieldCheck, text: "Petugas konfirmasi alat dan biaya" },
              { icon: BadgeCheck, text: "Alat disiapkan sesuai jadwal sewa" },
            ].map(({ icon: Icon, text }) => <p key={text} className="flex min-h-11 items-center gap-2 text-sm font-medium text-muted"><Icon size={17} className="text-brand-600" />{text}</p>)}
          </div>
        </section>
        <EquipmentLoanForm equipment={equipment.map(({ id, name }) => ({ id, name }))} usingLocalCatalog={usingLocalEquipment} />
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
