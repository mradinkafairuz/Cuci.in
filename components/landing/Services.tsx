"use client";

import { Droplets, Shirt, WashingMachine, Zap } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { usePublicCatalog } from "@/lib/hooks/use-public-catalog";

const icons = {
  wash: WashingMachine,
  iron: Shirt,
  full: Droplets,
  express: Zap,
};

export function Services() {
  const { catalog, isLoading, error } = usePublicCatalog();
  const services = catalog?.services ?? [];

  return (
    <section id="layanan" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Layanan"
        title="Pilih layanan sesuai kebutuhan"
        subtitle="Dari cuci biasa sampai layanan kilat, semua dikerjakan rapi."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading && <p role="status" className="text-sm text-muted">Memuat layanan...</p>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {!isLoading && !error && services.length === 0 && <p className="text-sm text-muted">Belum ada layanan aktif.</p>}
        {services.map((s) => {
          const Icon = icons[s.icon];
          return (
            <Link key={s.id} href={`/pesan?layanan=${encodeURIComponent(s.slug || s.name)}`} aria-label={`Pilih layanan ${s.name}`} className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            <Card className="h-full transition-all group-hover:-translate-y-1 group-hover:border-brand-300 group-hover:shadow-md">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-soft text-brand-600">
                <Icon size={24} />
              </span>
              <h3 className="text-lg font-semibold text-ink">{s.name}</h3>
              {s.description && <p className="mt-2 text-sm text-muted">{s.description}</p>}
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">Pilih layanan <span aria-hidden="true">→</span></span>
            </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
