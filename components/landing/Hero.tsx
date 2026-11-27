import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock3, Truck } from "@/lib/icons";
import { WaveDivider } from "@/components/ui/WaveDivider";

const customerAvatars = [
  "/images/Avatar-1.webp",
  "/images/Avatar-2.webp",
  "/images/Avatar-3.webp",
  "/images/Avatar-4.webp",
];

export function Hero({ className = "" }: { className?: string } = {}) {
  return (
    <section className={`relative isolate overflow-hidden bg-[#D9F2FB] ${className}`}>
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-12 size-64 rounded-full bg-white/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute right-[8%] top-14 size-7 rounded-full bg-[#F7D44C] shadow-[0_0_30px_8px_rgba(247,212,76,0.28)]" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-6 px-4 pb-24 pt-5 sm:px-6 sm:pt-8 md:grid-cols-[0.95fr_1.05fr] md:gap-8 md:pb-32 md:pt-10 lg:gap-12 lg:pt-12">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-xs font-bold text-[#0079A8] shadow-xs backdrop-blur sm:px-4 sm:py-2">
            <span className="size-2 rounded-full bg-[#00AEEF]" />
            Jemput & antar gratis di area layanan
          </span>
          <h1 className="mt-3.5 max-w-xl text-[2.2rem] font-extrabold leading-[1.08] tracking-tight text-[#0F172A] sm:mt-5 sm:text-5xl lg:text-[3.8rem]">
            Cucian bersih,<br />
            <span className="relative inline-block">
              <span className="relative z-10 text-[#0F172A]">hari lebih ringan.</span>
              <span aria-hidden="true" className="absolute -inset-x-1 bottom-0.5 -z-0 h-3.5 rounded-full bg-[#F7D44C] sm:bottom-1 sm:h-5" />
            </span>
          </h1>
          <p className="mt-3.5 max-w-lg text-sm leading-relaxed text-slate-700 sm:mt-5 sm:text-lg">
            Laundry praktis dengan penjemputan terjadwal, harga yang dikonfirmasi sebelum diproses, dan status cucian yang mudah dipantau.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4 sm:mt-7 sm:gap-5">
            <Link
              href="/pesan"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F7D44C] px-8 py-4 text-base font-extrabold text-[#181818] shadow-[0_10px_24px_rgba(195,153,13,0.22)] transition hover:-translate-y-0.5 hover:bg-[#efc52d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0079A8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#D9F2FB]"
            >
              Jadwalkan Jemput <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <Link
              href="/cek-status"
              className="inline-flex items-center gap-1.5 px-2 py-2.5 text-base font-bold text-[#006F91] underline decoration-[#006F91]/35 decoration-2 underline-offset-4 transition hover:text-[#004f69] hover:decoration-[#004f69] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AEEF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#D9F2FB]"
            >
              Lacak Pesanan <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-700 sm:mt-7 sm:gap-x-5 sm:text-sm">
            <li className="flex items-center gap-1.5 sm:gap-2"><CheckCircle2 size={16} className="text-[#008DB9]" /> Harga transparan</li>
            <li className="flex items-center gap-1.5 sm:gap-2"><Clock3 size={16} className="text-[#008DB9]" /> Jadwal fleksibel</li>
            <li className="flex items-center gap-1.5 sm:gap-2"><Truck size={16} className="text-[#008DB9]" /> Jemput & antar</li>
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[38rem] self-end mb-[-16px] md:mb-[-28px]">
          <Image
            src="/images/hero-visual.webp"
            alt="Staf Cuci.in membawa keranjang pakaian bersih"
            width={760}
            height={700}
            priority
            sizes="(max-width: 768px) 100vw, 52vw"
            className="relative z-10 mx-auto h-auto max-h-[18.5rem] w-full object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.12)] sm:max-h-[24rem] md:max-h-[34rem]"
          />

          <div className="absolute bottom-0 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/95 px-4 py-2.5 shadow-[0_14px_30px_rgba(18,73,91,0.14)] backdrop-blur md:bottom-4 md:left-4 md:translate-x-0 md:px-5 md:py-3">
            <div className="flex items-center gap-3 whitespace-nowrap">
              <div className="flex -space-x-2.5">
                {customerAvatars.map((src) => (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    width={38}
                    height={38}
                    className="size-8 rounded-full object-cover ring-2 ring-white sm:size-9"
                  />
                ))}
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#181818] sm:text-sm">Pelanggan puas</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-slate-600 sm:text-xs">
                  <span aria-hidden="true" className="text-[#E2B51C]">★★★★★</span> 4.9/5 rating
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <WaveDivider topColor="#D9F2FB" bottomColor="#FFFFFF" className="-bottom-px z-10" />
    </section>
  );
}
