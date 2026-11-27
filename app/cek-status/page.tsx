import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { BackToHome } from "@/components/layout/BackToHome";
import { OrderStatusForm } from "@/components/landing/OrderStatusForm";

export default async function OrderStatusPage({ searchParams }: { searchParams: Promise<{ kode?: string; hp?: string }> }) {
  const { kode, hp } = await searchParams;
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-soft/40 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <BackToHome />
        </div>
        <OrderStatusForm initialCode={kode} initialPhoneLast4={hp} />
      </main>
      <Footer />
    </>
  );
}
