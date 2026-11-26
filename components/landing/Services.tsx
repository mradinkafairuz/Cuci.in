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
    <section id="layanan" className="relative isolate scroll-mt-20 overflow-hidden px-4 py-20 sm:px-6">
      <LaundryDecor variant={0} />
      <div className="relative z-10 mx-auto max-w-6xl">
      <SectionHeading
        eyebrow="Layanan"
        title="Pilih layanan sesuai kebutuhan"
        subtitle="Dari cuci biasa sampai layanan kilat, semua dikerjakan rapi."
      />
      <ScrollReveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading && <p role="status" className="text-sm text-muted">Memuat layanan...</p>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {!isLoading && !error && services.length === 0 && <p className="text-sm text-muted">Belum ada layanan aktif.</p>}
        {services.map((s, index) => {
          const Icon = icons[s.icon];
          return (
            <Link key={s.id} href={`/pesan?layanan=${encodeURIComponent(s.slug || s.name)}`} aria-label={`Pilih layanan ${s.name}`} className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
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
      </div>
    </section>
  );
}
