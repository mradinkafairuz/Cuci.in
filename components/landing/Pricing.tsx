"use client";

import { Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CUCI_SATUAN_ITEMS, ProductRailGallery, type RailGarment } from "@/components/ui/product-rail-gallery";
import { usePublicCatalog } from "@/lib/hooks/use-public-catalog";
import { formatRupiah } from "@/lib/utils/format";

// Menampilkan tarif per kg + estimasi pengerjaan.
export function Pricing() {
  const { catalog, isLoading, error } = usePublicCatalog();
  const services = catalog?.services ?? [];
  const items = catalog?.items ?? [];
  const galleryItems: RailGarment[] = items.map((item) => {
    const artwork = CUCI_SATUAN_ITEMS.find((preset) => preset.id === item.slug);
    return {
      ...artwork,
      id: item.id,
      name: item.name,
      kind: artwork?.kind ?? "tee",
      tag: formatRupiah(item.price),
      details: [...(artwork?.details ?? []), `Harga ${formatRupiah(item.price)} per item`],
    };
  });

  return (
    <section id="tarif" className="scroll-mt-20 bg-soft/50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Tarif & Estimasi"
          title="Tarif layanan dan estimasi biaya"
          subtitle="Tarif per kilogram. Contoh estimasi 3 kg ditampilkan di tiap layanan; total akhir mengikuti berat aktual setelah penimbangan."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading && <p role="status" className="text-sm text-muted">Memuat tarif...</p>}
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {!isLoading && !error && services.length === 0 && <p className="text-sm text-muted">Belum ada layanan aktif.</p>}
          {services.map((s) => (
            <Card key={s.id} className="flex flex-col">
              <h3 className="font-semibold text-ink">{s.name}</h3>
              <p className="mt-4 text-3xl font-bold text-brand-600">
                {formatRupiah(s.pricePerKg)}
                <span className="text-sm font-medium text-muted"> /kg</span>
              </p>
              <p className="mt-1 text-xs font-medium text-muted">
                Estimasi 3 kg: {formatRupiah(s.pricePerKg * 3)}
              </p>
              <div className="mt-4">
                <Badge>
                  <Clock size={12} className="mr-1" />
                  {s.estimateDays === 1 ? "1 hari" : `${s.estimateDays} hari`}
                </Badge>
              </div>
              <div className="mt-6 pt-2">
                <Link href={`/pesan?layanan=${encodeURIComponent(s.slug || s.name)}`} className="inline-flex w-full items-center justify-center rounded-xl border border-brand-300 px-4 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50">Pesan Layanan</Link>
              </div>
            </Card>
          ))}
        </div>
        <div id="cuci-satuan" className="mt-14 scroll-mt-24">
          <SectionHeading
            eyebrow="Cuci Satuan"
            title="Harga layanan cuci satuan"
            subtitle="Berikut harga untuk setiap item yang ingin dicuci."
          />
          {items.length > 0
            ? <ProductRailGallery items={galleryItems} />
            : <p className="py-8 text-center text-sm text-muted">{isLoading ? "Memuat daftar cucian..." : error || "Belum ada jenis cucian aktif."}</p>}
        </div>
      </div>
    </section>
  );
}
