"use client";

import { Droplets, Shirt, WashingMachine, Zap } from "@/lib/icons";
import Link from "next/link";
import { RevealCard } from "@/components/ui/RevealCard";
import { ScrollReveal } from "@/components/ui/useScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { usePublicCatalog } from "@/lib/hooks/use-public-catalog";
import { LaundryDecor } from "@/components/landing/LaundryDecor";

const icons = {
  wash: WashingMachine,
  iron: Shirt,
  full: Droplets,
  express: Zap,
};
const serviceCardColors = ["bg-[#cde8e5]", "bg-[#eef7ff]", "bg-[#e2f0f2]", "bg-[#e5f1f7]"];
const serviceIconColors = ["bg-[#7ab2b2] text-white", "bg-[#4d869c] text-white", "bg-[#4d869c] text-white", "bg-[#7ab2b2] text-white"];

export function Services() {
  const { catalog, isLoading, error } = usePublicCatalog();
  const services = catalog?.services ?? [];

  return (
    <section id="layanan" className="relative isolate scroll-mt-20 overflow-hidden bg-white px-4 py-16 sm:px-6 sm:py-20">
      <LaundryDecor variant={0} />
      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Layanan"
          title="Pilih layanan sesuai kebutuhan"
          subtitle="Dari cuci biasa sampai layanan kilat, semua dikerjakan rapi."
        />
        {isLoading && <p role="status" className="text-sm text-muted">Memuat layanan...</p>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {!isLoading && !error && services.length === 0 && <p className="text-sm text-muted">Belum ada layanan aktif.</p>}
        {services.length > 0 && (
          <>
            <p aria-hidden="true" className="mb-3 flex items-center justify-end gap-1 text-xs font-semibold text-[#0079A8] md:hidden">
              Geser untuk lihat layanan →
            </p>
            <ScrollReveal className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4">
              {services.map((s, index) => {
                const Icon = icons[s.icon];
                return (
                  <Link
                    key={s.id}
                    href={`/pesan?layanan=${encodeURIComponent(s.slug || s.name)}`}
                    aria-label={`Pilih layanan ${s.name}`}
                    className="group block w-[76%] max-w-[275px] shrink-0 snap-start rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:w-[46%] md:w-auto md:max-w-none"
                  >
                    <RevealCard reveal={false} className={`border-[#b7d6d8] ${serviceCardColors[index % serviceCardColors.length]}`}>
                      <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${serviceIconColors[index % serviceIconColors.length]}`}>
                        <Icon size={24} />
                      </span>
                      <h3 className="text-lg font-semibold text-ink">{s.name}</h3>
                      {s.description && <p className="mt-2 text-sm text-muted">{s.description}</p>}
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">Pilih layanan <span aria-hidden="true">→</span></span>
                    </RevealCard>
                  </Link>
                );
              })}
            </ScrollReveal>
          </>
        )}
      </div>
    </section>
  );
}
