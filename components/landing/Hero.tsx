import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock, Shirt, Truck, WashingMachine } from "@/lib/icons";
import { Button } from "@/components/ui/Button";

const HERO_LAUNDRY_IMAGE = "https://images.unsplash.com/photo-1776356829215-37929a717f0d?auto=format&fit=crop&w=1600&q=82";

export function Hero({ className = "" }: { className?: string } = {}) {
  return (
    <section className={`relative isolate overflow-hidden bg-gradient-to-br from-[#e7f1f4] via-[#f5f9fc] to-[#eef4f1] ${className}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden max-md:hidden">
        <span className="absolute left-[max(0.5rem,calc((100%-72rem)/2-6rem))] top-[36%] grid size-12 place-items-center rounded-[1rem] border border-white/80 bg-[#cde8e5]/65 text-brand-600/60 shadow-sm backdrop-blur-sm motion-safe:animate-[laundryFloat_8s_ease-in-out_infinite]">
          <WashingMachine size={25} weight="duotone" />
        </span>
        <span className="absolute right-[max(0.5rem,calc((100%-72rem)/2-6rem))] top-[17%] grid size-11 place-items-center rounded-full border border-white/80 bg-[#eef7ff]/75 text-[#4d869c]/55 shadow-sm motion-safe:animate-[laundryFloat_7s_ease-in-out_infinite_alternate]">
          <Shirt size={22} weight="duotone" />
        </span>
        <span className="absolute bottom-[13%] left-[47%] size-4 rounded-full border-2 border-[#7ab2b2]/60 motion-safe:animate-[laundryBubble_5s_ease-in-out_infinite]" />
        <span className="absolute right-[8%] top-[55%] size-3 rounded-full bg-[#7ab2b2]/50 motion-safe:animate-[laundryBubble_6s_ease-in-out_infinite_1s]" />
      </div>
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:gap-10 sm:px-6 sm:py-14 md:grid-cols-[0.9fr_1.1fr] md:gap-8 md:py-20 lg:gap-12">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-300/50 bg-white/80 px-4 py-1.5 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
            Jemput & antar dari rumah
          </span>
          <h1 className="mt-5 text-[2.6rem] font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.6rem]">
            Cucian bersih,<br /><span className="text-brand-600">tanpa repot.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            Pakaian dijemput dari rumah, dicuci dengan teliti, lalu diantar kembali dalam keadaan bersih dan siap dipakai.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/pesan">Pesan Sekarang <ArrowUpRight size={16} /></Button>
            <Button href="/cek-status" variant="outline">Cek Status Pesanan</Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs font-medium text-muted sm:text-sm">
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-600" /> Bersih & higienis</li>
            <li className="flex items-center gap-2"><Clock size={16} className="text-brand-600" /> Tepat waktu</li>
            <li className="flex items-center gap-2"><Truck size={16} className="text-brand-600" /> Antar jemput</li>
          </ul>
        </div>

        <Link
          href="/pesan"
          className="group relative block min-w-0 overflow-hidden rounded-[2rem] border border-white/80 bg-brand-700 shadow-[0_30px_80px_-32px_rgba(31,58,68,0.42)] outline-none ring-offset-4 transition-shadow duration-500 hover:shadow-[0_36px_90px_-30px_rgba(31,58,68,0.5)] focus-visible:ring-2 focus-visible:ring-brand-600"
        >
          <div className="relative aspect-[1.12/1] min-h-[340px] w-full sm:aspect-[1.35/1] md:min-h-[410px]">
            <Image
              src={HERO_LAUNDRY_IMAGE}
              alt="Deretan mesin laundry dalam ruang yang bersih dan terang"
              fill
              unoptimized
              priority
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#102f3b]/85 via-[#183c49]/15 to-[#183c49]/5" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-700/25 to-transparent" />
            <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#173b49]/45 px-3.5 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-md sm:left-7 sm:top-7">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
              Perawatan penuh perhatian
            </span>
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">Cuci.in · antar jemput</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Rapi kembali, siap dipakai.</h2>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80">Pilih layanan dan jadwalkan penjemputan dalam beberapa langkah.</p>
                </div>
                <span aria-hidden="true" className="mb-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/15 backdrop-blur transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                  <ArrowUpRight size={20} />
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
