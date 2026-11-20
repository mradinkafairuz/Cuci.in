import { BackToHome } from "@/components/layout/BackToHome";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { MembershipForm } from "@/components/membership/MembershipForm";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function MembershipPage() {
  return <>
    <Navbar />
    <main className="min-h-[70vh] bg-soft/40 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <BackToHome />
        <SectionHeading
          eyebrow="Membership Cuci.in"
          title="Pilih membership yang cocok"
          subtitle="Pilih paket terlebih dahulu. Setelah itu, isi data diri untuk mengajukan membership. Kode member adalah ID unik untuk mengenali pendaftaran Anda."
        />
        <MembershipForm />
      </div>
    </main>
    <Footer />
  </>;
}
