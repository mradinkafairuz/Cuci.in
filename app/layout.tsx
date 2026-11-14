import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { RouteLoadingOverlay } from "@/components/layout/RouteLoadingOverlay";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cuci.in — Layanan Laundry Kiloan & Cuci Satuan Premium",
  description:
    "Solusi laundry profesional, cepat, bersih, dan higienis. Dilengkapi sistem tracking status pengerjaan real-time & galeri gantungan 3D interaktif.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${jakarta.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-page text-ink selection:bg-brand-500 selection:text-white min-h-screen">
        <RouteLoadingOverlay />
        {children}
      </body>
    </html>
  );
}

