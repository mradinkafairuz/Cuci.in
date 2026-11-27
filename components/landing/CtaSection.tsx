"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, PackageSearch, Sparkles, Truck, WashingMachine } from "lucide-react";

function PhoneScreenFallback() {
  const miniSteps = [
    { label: "Dijemput", done: true, icon: Truck },
    { label: "Dicuci", active: true, icon: WashingMachine },
    { label: "Disetrika", done: false, icon: Sparkles },
    { label: "Siap Antar", done: false, icon: PackageSearch },
  ];

  return (
    <div className="flex h-full w-full flex-col justify-between bg-[#F6FBFE] px-4 pb-5 pt-9 text-slate-900">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="grid size-5 place-items-center rounded-md bg-[#00AEEF] text-[10px] font-black text-white">
              C
            </span>
            <span className="text-xs font-extrabold tracking-tight text-[#0F172A]">
              Cuci.in
            </span>
          </div>
          <span className="rounded-full bg-[#D9F2FB] px-2 py-0.5 text-[10px] font-bold text-[#0079A8]">
            Live
          </span>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-3.5 shadow-xs ring-1 ring-slate-200/70">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold text-slate-400">Kode Pesanan</p>
              <p className="font-mono text-xs font-extrabold text-[#0F172A]">LDR-2604-8821</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Dicuci
            </span>
          </div>

          <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-3">
            {miniSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="flex items-center gap-2.5">
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-full ${
                      step.done
                        ? "bg-emerald-500 text-white"
                        : step.active
                          ? "bg-[#00AEEF] text-white ring-4 ring-[#D9F2FB]"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {step.done ? (
                      <Check size={11} strokeWidth={3} aria-hidden="true" />
                    ) : (
                      <Icon size={11} aria-hidden="true" />
                    )}
                  </span>
                  <span
                    className={`text-[11px] ${
                      step.done || step.active
                        ? "font-bold text-[#0F172A]"
                        : "font-medium text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#0F172A] p-3 text-white">
        <div className="flex items-center justify-between text-[10px] text-white/70">
          <span>Cuci + Setrika · 4,2 kg</span>
          <span className="font-semibold text-[#F7D44C]">Disetujui</span>
        </div>
        <p className="mt-1 text-sm font-extrabold">Rp 29.400</p>
        <p className="mt-0.5 text-[10px] text-white/65">Estimasi siap besok · 17.00 WIB</p>
      </div>
    </div>
  );
}

export function CtaSection() {
  const [screenError, setScreenError] = useState(false);
  const screenImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = screenImgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setScreenError(true);
    }
  }, []);

  return (
    <section
      id="cta"
      className="relative isolate scroll-mt-20 overflow-x-clip bg-[#ECF8FC] px-4 pb-16 pt-12 sm:px-6 sm:pb-20"
    >
      {/* Antar-jemput row */}
      <div className="mx-auto mb-16 flex max-w-6xl flex-col items-center justify-between gap-4 px-2 py-2 text-center sm:flex-row sm:text-left md:mb-24">
        <div className="relative z-10 max-w-xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0079A8]">
            Antar-jemput gratis
          </p>
          <h2 className="mt-1.5 text-xl font-extrabold text-[#181818] sm:text-2xl">
            Cucian dijemput, waktu Anda tetap milik Anda.
          </h2>
        </div>
        <svg
          aria-hidden="true"
          viewBox="0 0 220 70"
          className="hidden h-16 w-44 flex-none text-[#00AEEF]/65 md:block lg:w-56"
        >
          <path
            d="M4 54C50 6 115 6 213 39"
            fill="none"
            stroke="currentColor"
            strokeDasharray="5 7"
            strokeLinecap="round"
            strokeWidth="2.2"
          />
        </svg>
        <Image
          src="/images/hero-delivery.webp"
          alt="Armada antar-jemput Cuci.in"
          width={260}
          height={170}
          sizes="(max-width: 640px) 176px, 224px"
          className="w-44 flex-none object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.12)] sm:w-48 md:w-56"
        />
      </div>

      {/* Cyan promo banner with top-protruding, bottom-clipped iPhone CSS device frame */}
      <div className="relative mx-auto max-w-6xl md:pt-8">
        <div
          className="relative rounded-3xl bg-[#00AEEF] text-white shadow-[0_24px_70px_rgba(0,112,151,0.22)]"
          style={{ clipPath: "inset(-140px 0px 0px 0px round 1.5rem)" }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.24),transparent_38%)]" />
            <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-[#00799f]/65 via-[#00799f]/25 to-transparent md:w-[72%]" />
          </div>

          <div className="grid grid-cols-1 items-end md:grid-cols-12">
            {/* Text column */}
            <div className="relative z-10 p-8 pb-8 md:col-span-7 md:p-12 md:pb-14 lg:p-14 lg:pb-16">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/25">
                <span className="size-2 rounded-full bg-[#F7D44C]" />
                Tracking real-time
              </span>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
                Cucian dalam proses? Pantau kapan saja.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/95 sm:text-base">
                Pesan jemputan dengan mudah, lalu ikuti setiap progres cucian dan konfirmasi tagihan langsung dari halaman status pesanan.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/pesan"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F7D44C] px-6 py-3.5 text-sm font-extrabold text-[#181818] shadow-[0_10px_24px_rgba(0,63,82,0.18)] transition hover:-translate-y-0.5 hover:bg-[#efc52d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#00AEEF]"
                >
                  Pesan Laundry <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
                <Link
                  href="/cek-status"
                  className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#00AEEF]"
                >
                  Lacak Pesanan
                </Link>
              </div>
            </div>

            {/* CSS Smartphone Device Frame column */}
            <div className="relative z-10 flex items-end justify-center px-6 pt-2 md:col-span-5 md:justify-end md:px-0 md:pr-10 lg:pr-14">
              <div className="relative w-[228px] sm:w-[248px] md:-mt-16 md:-mb-10 md:w-[258px] lg:-mt-20 lg:-mb-12 lg:w-[274px]">
                <div className="relative rounded-[2.5rem] bg-slate-950 p-2.5 shadow-[0_24px_48px_rgba(0,40,60,0.35)] ring-1 ring-white/20">
                  {/* Minimalist Dynamic Island / Notch */}
                  <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-4 z-20 flex h-4.5 w-20 -translate-x-1/2 items-center justify-end rounded-full bg-slate-950 px-2"
                  >
                    <span className="size-1.5 rounded-full bg-slate-800 ring-1 ring-slate-700" />
                  </div>

                  {/* Screen Ratio 9:19.5 */}
                  <div className="relative aspect-[9/19.5] w-full overflow-hidden rounded-[2rem] bg-white">
                    {!screenError ? (
                      <img
                        ref={screenImgRef}
                        src="/images/app-mockup-screen.png"
                        alt="Tampilan pelacakan pesanan Cuci.in di ponsel"
                        onError={() => setScreenError(true)}
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <PhoneScreenFallback />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
