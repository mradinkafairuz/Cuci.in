import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CtaSection } from "@/components/landing/CtaSection";
import { CustomerReviews } from "@/components/landing/CustomerReviews";
import { Hero } from "@/components/landing/Hero";
import { LaundryCare } from "@/components/landing/LaundryCare";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { OperatingHours } from "@/components/landing/OperatingHours";
import { Pricing } from "@/components/landing/Pricing";
import { Services } from "@/components/landing/Services";

// Landing Page: hanya merangkai section-section yang sudah dipisah.
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <LaundryCare />
        <HowItWorks />
        <Pricing />
        <CustomerReviews />
        <OperatingHours />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
