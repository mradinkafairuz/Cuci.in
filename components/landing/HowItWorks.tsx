"use client";

import { motion } from "motion/react";
import { BadgeDollarSign, PackageSearch, Shirt, Sparkles, Truck } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useScrollReveal } from "@/components/ui/useScrollReveal";

const orderSteps = [
  { title: "Pilih layanan", desc: "Tentukan layanan kiloan atau satuan sesuai kebutuhan.", icon: Shirt },
  { title: "Jadwalkan jemput", desc: "Pilih alamat dan slot waktu penjemputan tersedia.", icon: Truck },
  { title: "Setujui harga", desc: "Konfirmasi total harga setelah cucian ditimbang.", icon: BadgeDollarSign },
  { title: "Pantau cucian", desc: "Pantau progres hingga cucian bersih siap diterima.", icon: PackageSearch },
];

export function HowItWorks() {
  return (
    <section id="panduan" className="relative isolate scroll-mt-20 overflow-hidden bg-white py-16 sm:py-20">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Panduan Pemesanan"
          title="Laundry praktis dalam 4 langkah"
        />
        <ol className="grid grid-cols-2 gap-x-5 gap-y-8 sm:gap-x-8 lg:grid-cols-4">
          {orderSteps.map((step, i) => <OrderStepItem key={step.title} step={step} index={i} />)}
        </ol>
      </div>
    </section>
  );
}

function OrderStepItem({ step, index }: { step: (typeof orderSteps)[number]; index: number }) {
  const revealRef = useScrollReveal<HTMLLIElement>(index * 0.06);
  const Icon = step.icon;

  return (
    <li ref={revealRef} className="motion-safe:translate-y-3 motion-safe:opacity-0">
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 280, damping: 25 }}
        className="group flex flex-col items-center text-center"
      >
        <div className="relative inline-flex items-center justify-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-[#D9F2FB] text-[#005B75] transition-transform duration-300 group-hover:scale-105">
            <Icon size={28} strokeWidth={2.1} aria-hidden="true" />
          </span>
          <Sparkles
            size={17}
            aria-hidden="true"
            className="absolute -right-1.5 -top-1 text-[#EAB308] drop-shadow-[0_1px_2px_rgba(247,212,76,0.45)]"
          />
        </div>
        <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0079A8]">
          Langkah {index + 1}
        </p>
        <h3 className="mt-1.5 text-base font-bold text-[#181818] sm:text-lg">{step.title}</h3>
        <p className="mt-1.5 line-clamp-2 max-w-[16rem] text-xs leading-relaxed text-muted sm:text-sm">
          {step.desc}
        </p>
      </motion.div>
    </li>
  );
}
