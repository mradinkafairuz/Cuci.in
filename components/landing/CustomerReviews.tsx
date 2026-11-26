import { CalendlyCarousel, type CarouselItem } from "@/components/ui/connected-carousel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LaundryDecor } from "@/components/landing/LaundryDecor";

const customerStories: CarouselItem[] = [
  {
    id: "review-1",
    stat: "Cucian kembali bersih dan wangi",
    quote: "Pesan jemputnya gampang. Hasil cuciannya bersih, wanginya juga enak dan tahan lama.",
    author: "Nadia Putri",
    role: "Cuci + Setrika",
    defaultImage: "https://images.unsplash.com/photo-1569925444984-9e2e5fc3d1fb?auto=format&fit=crop&w=1200&q=88",
    selectedImage: "https://images.pexels.com/photos/11213210/pexels-photo-11213210.jpeg?auto=compress&dpr=1&h=750&w=1260",
    alt: "Foto profil pelanggan",
    sceneAlt: "Deretan mesin cuci di dalam laundry tanpa papan nama toko",
  },
  {
    id: "review-2",
    stat: "Jemput dan antar sesuai jadwal",
    quote: "Suka karena nggak perlu keluar rumah. Kurirnya datang sesuai waktu yang dipilih.",
    author: "Rizky Pratama",
    role: "Cuci Kering",
    defaultImage: "https://images.unsplash.com/photo-1534399315465-2b91232de345?auto=format&fit=crop&w=1200&q=88",
    selectedImage: "https://images.unsplash.com/photo-1775210727386-4c798dfae209?auto=format&fit=crop&w=1800&q=88",
    alt: "Foto profil pelanggan",
    sceneAlt: "Deretan mesin cuci dalam ruang laundry yang terang",
  },
  {
    id: "review-3",
    stat: "Pakaian rapi tanpa repot",
    quote: "Kemeja dan pakaian kantor jadi rapi. Tinggal ambil, semuanya sudah dilipat dengan baik.",
    author: "Dewi Lestari",
    role: "Setrika Saja",
    defaultImage: "https://images.unsplash.com/flagged/photo-1573582677725-863b570e3c00?auto=format&fit=crop&w=1200&q=88",
    selectedImage: "https://images.unsplash.com/photo-1775210291224-f4d80141fbde?auto=format&fit=crop&w=1800&q=88",
    alt: "Foto profil pelanggan",
    sceneAlt: "Mesin cuci tersusun rapi di gerai yang terang",
  },
  {
    id: "review-4",
    stat: "Layanan kilat sangat membantu",
    quote: "Butuh baju untuk acara mendadak dan selesai tepat waktu. Proses pesan juga jelas.",
    author: "Fajar Ramadhan",
    role: "Kilat Express",
    defaultImage: "https://images.unsplash.com/photo-1551847812-f815b31ae67c?auto=format&fit=crop&w=1200&q=88",
    selectedImage: "https://images.unsplash.com/photo-1775380900537-51cbb8ea9888?auto=format&fit=crop&w=1800&q=88",
    alt: "Foto profil pelanggan",
    sceneAlt: "Deretan mesin laundry dengan pencahayaan terang",
  },
  {
    id: "review-5",
    stat: "Selimut bersih dan lembut lagi",
    quote: "Selimut tebal saya dicuci bersih dan terasa lembut. Senang bisa pesan dari rumah.",
    author: "Maya Sari",
    role: "Cuci Satuan",
    defaultImage: "https://images.unsplash.com/photo-1533030861215-66387403772f?auto=format&fit=crop&w=1200&q=88",
    selectedImage: "https://cdn.uc.assets.prezly.com/7adcee31-0129-46a8-8d32-5ab226659b42/pexels-darya-sannikova-2927523.jpg",
    alt: "Foto profil pelanggan",
    sceneAlt: "Seorang perempuan sedang melipat pakaian bersih di laundry",
  },
];

export function CustomerReviews() {
  return (
    <section className="relative isolate overflow-hidden bg-page px-4 py-14 sm:px-6 sm:py-18">
      <LaundryDecor variant={3} />
      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Cerita pelanggan"
          title="Laundry lebih ringan, hari lebih lega"
          subtitle="Pengalaman yang bikin urusan cucian terasa lebih sederhana."
        />
        <CalendlyCarousel items={customerStories} autoPlayInterval={6500} className="mx-auto max-w-[1080px]" />
      </div>
    </section>
  );
}
