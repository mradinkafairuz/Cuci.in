import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { BookingAndTrackingSection } from "@/components/landing/BookingAndTrackingSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { CustomerReviews } from "@/components/landing/CustomerReviews";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LaundryBar } from "@/components/landing/LaundryBar";
import { LaundryCare } from "@/components/landing/LaundryCare";
import { OperatingHours } from "@/components/landing/OperatingHours";
import { Pricing } from "@/components/landing/Pricing";
import { SITE_CONFIG } from "@/lib/site-config";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "DryCleaningOrLaundry",
  name: SITE_CONFIG.brandName,
  telephone: `+${SITE_CONFIG.whatsappNumber}`,
  priceRange: "Rp4.000-Rp25.000",
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE_CONFIG.address.street,
    addressLocality: "Gunungpati",
    addressRegion: "Jawa Tengah",
    postalCode: SITE_CONFIG.address.postalCode,
    addressCountry: "ID",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "07:00",
      closes: "20:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "07:00",
      closes: "18:00",
    },
  ],
};

// Landing Page: hanya merangkai section-section yang sudah dipisah.
export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema).replace(/</g, "\\u003c"),
        }}
      />
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <LaundryCare />
        <LaundryBar />
        <Pricing />
        <BookingAndTrackingSection />
        <CustomerReviews />
        <OperatingHours />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
