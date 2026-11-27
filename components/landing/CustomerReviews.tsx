import Image from "next/image";
import { CalendlyCarousel, type CarouselItem } from "@/components/ui/connected-carousel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WaveDivider } from "@/components/ui/WaveDivider";

const customerStories: CarouselItem[] = [
  {
    id: "review-1",
    stat: "Cucian kembali bersih dan wangi",
    quote: "Pesan jemputnya gampang. Hasil cuciannya bersih, wanginya juga enak dan tahan lama.",
    author: "Nadia Putri",
    role: "Cuci + Setrika",
    defaultImage: "/images/Avatar-2.webp",
    selectedImage: "/images/hero-visual.webp",
    alt: "Avatar Nadia Putri",
    sceneAlt: "Ilustrasi staf Cuci.in menangani cucian bersih",
  },
  {
    id: "review-2",
    stat: "Jemput dan antar sesuai jadwal",
    quote: "Suka karena nggak perlu keluar rumah. Kurirnya datang sesuai waktu yang dipilih.",
    author: "Rizky Pratama",
    role: "Cuci Kering",
    defaultImage: "/images/Avatar-1.webp",
    selectedImage: "/images/hero-visual.webp",
    alt: "Avatar Rizky Pratama",
    sceneAlt: "Ilustrasi staf Cuci.in menangani cucian bersih",
  },
  {
    id: "review-3",
    stat: "Pakaian rapi tanpa repot",
    quote: "Kemeja dan pakaian kantor jadi rapi. Tinggal ambil, semuanya sudah dilipat dengan baik.",
    author: "Dewi Lestari",
    role: "Setrika Saja",
    defaultImage: "/images/Avatar-3.webp",
    selectedImage: "/images/hero-visual.webp",
    alt: "Avatar Dewi Lestari",
    sceneAlt: "Ilustrasi staf Cuci.in menangani cucian bersih",
  },
  {
    id: "review-4",
    stat: "Layanan kilat sangat membantu",
    quote: "Butuh baju untuk acara mendadak dan selesai tepat waktu. Proses pesan juga jelas.",
    author: "Fajar Ramadhan",
    role: "Kilat Express",
    defaultImage: "/images/Avatar-4.webp",
    selectedImage: "/images/hero-visual.webp",
    alt: "Avatar Fajar Ramadhan",
    sceneAlt: "Ilustrasi staf Cuci.in menangani cucian bersih",
  },
];

const decorativeAvatars = [
  { src: "/images/Avatar-1.webp", className: "left-[2.5%] top-[24%] w-14 h-14 lg:left-[4%] lg:w-16 lg:h-16 xl:left-[7%]" },
  { src: "/images/Avatar-2.webp", className: "left-[4%] bottom-[17%] w-12 h-12 lg:left-[8%] lg:w-14 lg:h-14 xl:left-[12%]" },
  { src: "/images/Avatar-3.webp", className: "right-[2.5%] top-[22%] w-12 h-12 lg:right-[4%] lg:w-14 lg:h-14 xl:right-[7%]" },
  { src: "/images/Avatar-4.webp", className: "right-[4%] bottom-[17%] w-14 h-14 lg:right-[8%] lg:w-16 lg:h-16 xl:right-[12%]" },
];

export function CustomerReviews() {
  return (
    <section id="testimoni" className="relative isolate scroll-mt-20 overflow-hidden bg-[#FDF0B3] px-4 pb-28 pt-24 sm:px-6 sm:pt-28">
      <WaveDivider topColor="#FFFFFF" bottomColor="#FDF0B3" className="-top-px" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
        {decorativeAvatars.map(({ src, className }) => (
          <Image
            key={src}
            src={src}
            alt=""
            width={72}
            height={72}
            className={`absolute rounded-full object-cover ring-4 ring-white shadow-md ${className}`}
          />
        ))}
      </div>
      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Cerita pelanggan"
          title="Laundry lebih ringan, hari lebih lega"
          subtitle="Pengalaman yang bikin urusan cucian terasa lebih sederhana."
        />
        <CalendlyCarousel items={customerStories} autoPlayInterval={6500} className="mx-auto md:max-w-lg lg:max-w-2xl" />
      </div>
      <WaveDivider topColor="#FDF0B3" bottomColor="#ECF8FC" className="-bottom-px" />
    </section>
  );
}
