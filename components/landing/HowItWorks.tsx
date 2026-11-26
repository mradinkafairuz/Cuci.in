"use client";

import { motion } from "motion/react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useScrollReveal } from "@/components/ui/useScrollReveal";
import { LaundryDecor } from "@/components/landing/LaundryDecor";

const orderSteps = [
  { title: "Pilih layanan", desc: "Tentukan jenis layanan laundry yang Anda butuhkan." },
  { title: "Pilih pakaian", desc: "Pilih jenis pakaian atau barang laundry yang ingin dicuci." },
  { title: "Jemput & timbang", desc: "Laundry dijemput, lalu ditimbang untuk mengetahui berat sebenarnya." },
  { title: "Konfirmasi harga", desc: "Admin mengonfirmasi total harga setelah penimbangan sebelum pesanan diproses." },
  { title: "Pantau status", desc: "Lihat progres cucian dari dashboard." },
  { title: "Bayar & ambil", desc: "Lunasi tagihan, lalu ambil cucian Anda." },
];
const stepCardColors = ["bg-[#cde8e5]", "bg-[#eef7ff]", "bg-[#e2f0f2]"];

export function HowItWorks() {
  return (
    <section id="panduan" className="relative isolate scroll-mt-20 overflow-hidden py-20">
      <LaundryDecor variant={2} />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
      <SectionHeading
        eyebrow="Panduan Pemesanan"
        title="Pesan laundry dalam 6 langkah"
      />
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orderSteps.map((step, i) => <OrderStepCard key={step.title} step={step} index={i} />)}
      </ol>
      </div>
    </section>
  );
}

function OrderStepCard({ step, index }: { step: (typeof orderSteps)[number]; index: number }) {
  const revealRef = useScrollReveal<HTMLLIElement>(Math.min((index % 3) * 0.08, 0.16));

  return (
    <li ref={revealRef} className="min-h-44 motion-safe:translate-x-3 motion-safe:translate-y-3 motion-safe:opacity-0">
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 280, damping: 25 }}
        className={`min-h-44 rounded-2xl border border-[#b7d6d8] ${stepCardColors[index % stepCardColors.length]} p-6 shadow-sm transition-shadow hover:shadow-md`}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4d869c] font-bold text-white shadow-sm">
          {index + 1}
        </span>
        <h3 className="mt-4 font-semibold text-ink">{step.title}</h3>
        <p className="mt-2 text-sm text-muted">{step.desc}</p>
      </motion.div>
    </li>
  );
}
