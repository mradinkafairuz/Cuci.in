import { Button } from "@/components/ui/Button";
import { LaundryDecor } from "@/components/landing/LaundryDecor";

export function CtaSection() {
  return (
    <section id="cta" className="relative isolate scroll-mt-20 overflow-hidden pb-20">
      <LaundryDecor variant={0} />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="rounded-3xl bg-brand-500 px-6 py-12 text-center text-white shadow-lg">
        <h2 className="text-3xl font-bold">Siap mencuci tanpa repot?</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/85">
          Pilih layanan dan jadwalkan penjemputan cucian Anda.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/pesan" className="bg-white !text-brand-700 hover:bg-soft">
            Pesan Laundry
          </Button>
          <Button href="/cek-status" variant="outline" className="!border-white !text-white hover:!bg-white/10">
            Lacak Pesanan
          </Button>
        </div>
      </div>
      </div>
    </section>
  );
}
