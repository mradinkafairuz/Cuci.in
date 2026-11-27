import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { BackToHome } from "@/components/layout/BackToHome";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BookingForm } from "@/components/booking/BookingForm";
import { ServiceGuaranteeCard } from "@/components/landing/BookingAndTrackingSection";
import { OrderStatusForm } from "@/components/landing/OrderStatusForm";

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ layanan?: string }> }) {
  const { layanan } = await searchParams;
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-soft/40 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <BackToHome />
          <SectionHeading eyebrow="Pemesanan" title="Atur laundry dari rumah" subtitle="Pilih layanan, isi alamat jemput, dan temukan laundry terdekat dari lokasi Anda." />
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <BookingForm initialServiceId={layanan} />
            </div>
            <aside className="space-y-6 lg:sticky lg:top-24 lg:col-span-5">
              <OrderStatusForm compact />
              <ServiceGuaranteeCard />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
