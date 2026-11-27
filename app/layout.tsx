import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { RouteLoadingOverlay } from "@/components/layout/RouteLoadingOverlay";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import "lenis/dist/lenis.css";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cuci.in | Laundry Antar Jemput Gunungpati, Semarang",
  description:
    "Laundry kiloan dan cuci satuan dengan layanan antar-jemput di Gunungpati, Semarang. Cuci.in — mudah, transparan, tepat waktu.",
  icons: {
    icon: "/images/icon.png",
    apple: "/images/icon.png",
  },
  openGraph: {
    title: "Cuci.in | Laundry Antar Jemput Gunungpati, Semarang",
    description:
      "Laundry kiloan dan cuci satuan dengan layanan antar-jemput di Gunungpati, Semarang. Cuci.in — mudah, transparan, tepat waktu.",
    locale: "id_ID",
    siteName: "Cuci.in",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="font-sans antialiased bg-page text-ink selection:bg-brand-500 selection:text-white min-h-screen">
        <SmoothScrollProvider>
          <RouteLoadingOverlay />
          {children}
          <WhatsAppButton />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

