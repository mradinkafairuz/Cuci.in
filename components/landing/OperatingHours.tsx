"use client";

import { Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { usePublicCatalog } from "@/lib/hooks/use-public-catalog";

export function OperatingHours() {
  const { catalog, isLoading, error } = usePublicCatalog();
  const hours = catalog?.businessHours ?? [];
  return (
    <section id="jam-operasional" className="scroll-mt-20 bg-soft/50 py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <SectionHeading eyebrow="Jam Operasional" title="Kapan kami buka" />
        <Card className="divide-y divide-soft p-0">
          {isLoading && <p role="status" className="p-6 text-sm text-muted">Memuat jam operasional...</p>}
          {error && <p role="alert" className="p-6 text-sm text-red-600">{error}</p>}
          {!isLoading && !error && hours.length === 0 && <p className="p-6 text-sm text-muted">Jam operasional belum tersedia.</p>}
          {hours.map((h) => (
            <div key={h.day} className="flex items-center justify-between px-6 py-4">
              <span className="flex items-center gap-2 font-medium text-ink">
                <Clock size={16} className="text-brand-500" /> {h.day}
              </span>
              <span className={h.closed ? "font-semibold text-red-700" : "text-muted"}>
                {h.closed ? "Tutup" : h.open && h.close ? `${h.open} - ${h.close} WIB` : "Belum diatur"}
              </span>
            </div>
          ))}
        </Card>
      </div>
    </section>
  );
}
