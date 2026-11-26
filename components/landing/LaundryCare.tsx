"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Shirt, WashingMachine } from "@/lib/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/useScrollReveal";
import { LaundryDecor } from "@/components/landing/LaundryDecor";

const careSteps = [
  {
    title: "Penyortiran pakaian",
    description: "Pakaian dipilah berdasarkan jenis dan kebutuhan perawatannya sebelum dicuci.",
    image:
      "https://dafgr1y3h3vlw.cloudfront.net/website-builder/websites/1707/23dfc646-ef5a-4512-9440-dfb4546c1916.webp",
    fallback: "/images/laundry-process/sorting.svg",
    alt: "Petugas laundry sedang menata cucian pada meja kerja",
    position: "object-center",
    icon: Shirt,
  },
  {
    title: "Peralatan yang sesuai",
    description: "Mesin dan proses dipilih mengikuti jenis cucian agar pakaian ditangani dengan tepat.",
    image:
      "https://images.unsplash.com/photo-1580175486077-959357d7c72e?auto=format&fit=crop&w=1200&q=82",
    fallback: "/images/laundry-process/equipment.svg",
    alt: "Mesin laundry tersusun di area yang terang",
    position: "object-center",
    icon: WashingMachine,
  },
  {
    title: "Pemeriksaan akhir",
    description: "Cucian dirapikan dan diperiksa sebelum disiapkan untuk diambil atau diantar.",
    image:
      "https://cdn.uc.assets.prezly.com/7adcee31-0129-46a8-8d32-5ab226659b42/pexels-darya-sannikova-2927523.jpg",
    fallback: "/images/laundry-process/inspection.svg",
    alt: "Pakaian bersih sedang dirapikan setelah proses laundry",
    position: "object-center",
    icon: CheckCircle2,
  },
];

export function LaundryCare() {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  return (
    <section className="relative isolate overflow-hidden bg-[#edf5f6] px-4 py-16 sm:px-6 sm:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-36 size-[28rem] rounded-full bg-[#a9d3d7]/45 blur-3xl motion-safe:animate-[laundryGlow_19s_ease-in-out_infinite_alternate]" />
        <div className="absolute -bottom-48 -right-24 size-[32rem] rounded-full bg-[#c5d9c9]/55 blur-3xl motion-safe:animate-[laundryGlow_23s_ease-in-out_infinite_alternate-reverse]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.72),transparent_58%)]" />
      </div>
      <LaundryDecor variant={1} />
      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Perhatian pada setiap proses"
          title="Pakaian dirawat dengan langkah yang tertata"
          subtitle="Dari penyortiran hingga pemeriksaan akhir, setiap tahap membantu menjaga cucian tetap rapi dan siap kembali kepada Anda."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {careSteps.map((step, index) => (
            <ScrollReveal key={step.title} delay={Math.min(index * 0.08, 0.16)} className="h-full">
              <motion.article
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 280, damping: 25 }}
                className="group h-full overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-[0_10px_34px_-22px_rgba(31,58,68,0.4)] backdrop-blur-sm transition-[border-color,box-shadow] duration-300 hover:border-brand-300 hover:shadow-[0_22px_46px_-24px_rgba(31,58,68,0.36)]"
              >
              <div className="relative aspect-[16/10] overflow-hidden bg-soft">
                <Image
                  src={failedImages[step.title] ? step.fallback : step.image}
                  alt={step.alt}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${step.position}`}
                  onError={() => {
                    setFailedImages((current) =>
                      current[step.title] ? current : { ...current, [step.title]: true },
                    );
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#173b49]/35 to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="flex items-center gap-2.5 text-lg font-semibold text-ink">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-700">
                    <step.icon size={20} weight="duotone" aria-hidden="true" />
                  </span>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
              </div>
              </motion.article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
