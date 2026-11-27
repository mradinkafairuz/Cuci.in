import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { BackToHome } from "@/components/layout/BackToHome";
import { CuciSatuanOrderForm } from "@/components/booking/CuciSatuanOrderForm";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default async function CuciSatuanBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string; qty?: string }>;
}) {
  const { item, qty } = await searchParams;
  const parsedQty = qty ? Math.min(99, Math.max(1, Math.trunc(Number(qty) || 1))) : undefined;

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-soft/40 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <BackToHome />
          <SectionHeading
            eyebrow="Pemesanan Cuci Satuan"
            title="Pilih item dan jumlahnya"
            subtitle="Harga per item langsung dijumlahkan sesuai jenis pakaian dan jumlah yang Anda pesan."
          />
          <CuciSatuanOrderForm initialItemId={item} initialQuantity={parsedQty} />
        </div>
      </main>
      <Footer />
    </>
  );
}
