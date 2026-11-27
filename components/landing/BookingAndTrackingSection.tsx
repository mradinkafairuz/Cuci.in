import { Clock3, MapPin, Scale, ShieldCheck, Truck } from "lucide-react";
import { BookingForm } from "@/components/booking/BookingForm";
import { OrderStatusForm } from "@/components/landing/OrderStatusForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SITE_CONFIG } from "@/lib/site-config";

const serviceGuarantees = [
  {
    icon: Truck,
    title: "Gratis Jemput-Antar",
    desc: "Kurir kami menjemput dan mengantar langsung tanpa biaya tambahan di area layanan.",
  },
  {
    icon: Scale,
    title: "Timbang Transparan Sebelum Proses",
    desc: "Berat aktual ditimbang jujur dan total biaya menunggu persetujuan Anda terlebih dahulu.",
  },
  {
    icon: ShieldCheck,
    title: "Garansi Cuci Ulang 24 Jam",
    desc: "Kurang bersih atau kurang wangi? Hubungi kami dalam 24 jam untuk cuci ulang gratis.",
  },
];

export function ServiceGuaranteeCard() {
  return (
    <div className="rounded-3xl border border-slate-200/90 bg-[#EEF9FE]/65 p-6">
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-[#00AEEF]" />
        <h3 className="text-base font-extrabold text-[#0F172A]">
          Jaminan Layanan {SITE_CONFIG.brandName}
        </h3>
      </div>

      <ul className="mt-4 space-y-4">
        {serviceGuarantees.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.title} className="flex items-start gap-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[#0079A8] shadow-xs ring-1 ring-slate-200/60">
                <Icon size={17} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-[#0F172A]">{item.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 space-y-2 border-t border-slate-200/80 pt-4 text-xs text-slate-600">
        <p className="flex items-start gap-2">
          <Clock3 size={14} className="mt-0.5 shrink-0 text-[#0079A8]" aria-hidden="true" />
          <span>
            <strong className="font-semibold text-[#0F172A]">Jam Layanan:</strong>{" "}
            {SITE_CONFIG.operatingHours.weekdays} · {SITE_CONFIG.operatingHours.saturday}
          </span>
        </p>
        <p className="flex items-start gap-2">
          <MapPin size={14} className="mt-0.5 shrink-0 text-[#0079A8]" aria-hidden="true" />
          <span>
            <strong className="font-semibold text-[#0F172A]">Area Jemput:</strong>{" "}
            {SITE_CONFIG.serviceArea}
          </span>
        </p>
      </div>
    </div>
  );
}

export function BookingAndTrackingSection() {
  return (
    <section id="pemesanan" className="relative isolate scroll-mt-20 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Pemesanan & Lacak"
          title="Jadwalkan jemput atau pantau cucian"
          subtitle="Isi formulir penjemputan di kiri, atau langsung cek progres dan persetujuan harga pesanan Anda di sisi kanan."
        />

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left column: Booking form */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.04)] sm:p-7 lg:col-span-7">
            <div className="mb-5 border-b border-slate-100 pb-4">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0079A8]">
                Form Penjemputan
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-[#0F172A]">
                Jadwalkan Jemput Sekarang
              </h3>
            </div>
            <BookingForm />
          </div>

          {/* Right column: Sticky Tracking + Service Guarantee */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:col-span-5">
            <OrderStatusForm compact />
            <ServiceGuaranteeCard />
          </aside>
        </div>
      </div>
    </section>
  );
}
