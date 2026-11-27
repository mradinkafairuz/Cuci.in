"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Scale, Sparkles, Zap } from "lucide-react";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { usePublicCatalog } from "@/lib/hooks/use-public-catalog";
import { formatRupiah } from "@/lib/utils/format";

const highlights = [
  {
    icon: Scale,
    title: "Timbang Transparan & Persetujuan Harga",
    desc: "Cucian kiloan ditimbang akurat sebelum diproses. Anda menerima rincian berat & total biaya untuk disetujui lewat halaman status.",
    accent: "bg-[#D9F2FB] text-[#006F91]",
  },
  {
    icon: Sparkles,
    title: "Perawatan Linen Besar & Dry Clean",
    desc: "Bed cover jumbo, selimut tebal, jas formal, hingga gordyn ditangani terpisah dengan deterjen khusus agar serat kain tetap awet.",
    accent: "bg-[#FDF0B3] text-[#855800]",
  },
  {
    icon: Zap,
    title: "Layanan Express Prioritas 24 Jam",
    desc: "Butuh pakaian siap cepat untuk acara mendadak? Pilih jalur prioritas dengan penyortiran dan setrika uap tetap terjaga.",
    accent: "bg-[#E2F6EA] text-[#0F6E3D]",
  },
];

export function Pricing() {
  const { catalog, isLoading, error } = usePublicCatalog();
  const services = catalog?.services ?? [];
  const items = catalog?.items ?? [];

  const specialItems = items.slice(0, 4);

  return (
    <section id="tarif" className="relative isolate scroll-mt-20 overflow-hidden bg-[#D9F2FB] pb-28 pt-24 sm:pb-32 sm:pt-28">
      <WaveDivider topColor="#FFFFFF" bottomColor="#D9F2FB" className="-top-px" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Layanan & Harga"
          title="Transparansi biaya tanpa kejutan"
          subtitle="Rincian tarif per kategori dan standar perawatan Cuci.in. Total akhir kiloan selalu mengikuti berat aktual setelah penimbangan."
        />

        {isLoading && services.length === 0 && (
          <p role="status" className="text-center text-sm text-slate-600">
            Memuat daftar tarif...
          </p>
        )}
        {error && (
          <p role="alert" className="mb-4 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left: Compact Categorized Price Table */}
          <div className="rounded-3xl bg-white p-6 shadow-[0_14px_40px_rgba(0,111,145,0.08)] sm:p-8 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A]">Ringkasan Tarif per Kategori</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Harga sudah termasuk deterjen higienis, pelembut, dan lipatan rapi
                </p>
              </div>
              <Link
                href="/#cuci-satuan"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0079A8] hover:underline"
              >
                Hitung di Laundry Bar <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>

            {/* Category 1: Kiloan & Express */}
            <div className="mt-5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0079A8]">
                Paket Kiloan &amp; Express
              </p>
              <div className="mt-2 divide-y divide-slate-100">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-[#0F172A]">{service.name}</p>
                      <p className="text-xs text-slate-500">
                        Estimasi {service.estimateDays === 1 ? "1 hari (24 jam)" : `${service.estimateDays} hari`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-[#006F91]">
                        {formatRupiah(service.pricePerKg)}
                      </span>
                      <span className="text-xs font-medium text-slate-500"> /kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category 2: Cuci Satuan & Linen Spesial */}
            {specialItems.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0079A8]">
                    Highlight Cuci Satuan &amp; Linen
                  </p>
                  <Link
                    href="/pesan-satuan"
                    className="text-xs font-bold text-slate-600 hover:text-[#0079A8]"
                  >
                    Lihat {items.length} item →
                  </Link>
                </div>
                <div className="mt-2 divide-y divide-slate-100">
                  {specialItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-[#0F172A]">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.processingMethod}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-[#006F91]">
                          {formatRupiah(item.price)}
                        </span>
                        <span className="text-xs font-medium text-slate-500"> /item</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-[#EEF9FE] px-4 py-3 text-xs leading-relaxed text-[#005B75]">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#00AEEF]" aria-hidden="true" />
              <span>
                <strong>Tanpa biaya tersembunyi:</strong> penimbangan dilakukan transparan dan nominal akhir menunggu persetujuan Anda di halaman lacak pesanan.
              </span>
            </div>
          </div>

          {/* Right: 3 Package Advantages / Special Treatments */}
          <div className="space-y-4 lg:col-span-5">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-3xl bg-white/95 p-6 shadow-[0_10px_28px_rgba(0,111,145,0.06)] transition hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-4">
                    <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${item.accent}`}>
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-base font-extrabold text-[#0F172A]">{item.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                </article>
              );
            })}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-[#0F172A] px-6 py-5 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#F7D44C]">
                  Punya banyak cucian mingguan?
                </p>
                <p className="mt-1 text-sm font-semibold text-white/90">
                  Cek paket hemat &amp; membership bulanan
                </p>
              </div>
              <Link
                href="/membership"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#F7D44C] px-4 py-2 text-xs font-extrabold text-[#0F172A] transition hover:bg-[#efc52d]"
              >
                Lihat Paket <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <WaveDivider topColor="#D9F2FB" bottomColor="#FFFFFF" className="-bottom-px" />
    </section>
  );
}
