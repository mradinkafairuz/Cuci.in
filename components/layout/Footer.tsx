import Image from "next/image";
import Link from "next/link";
import { Clock3, MapPin, Phone } from "@/lib/icons";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { getWhatsAppUrl, SITE_CONFIG } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-[#181818] pb-28 text-white md:pb-12">
      <WaveDivider topColor="#ECF8FC" bottomColor="#181818" className="-top-px" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 pb-10 pt-28 sm:grid-cols-2 sm:px-6 lg:grid-cols-12 lg:gap-8 md:pb-12">
        {/* Col 1: Brand + desc + social */}
        <div className="lg:col-span-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3"
            aria-label={`${SITE_CONFIG.brandName}, kembali ke beranda`}
          >
            <Image src="/images/icon.png" alt="" width={46} height={46} className="size-11 object-contain" />
            <span className="text-2xl font-extrabold tracking-tight">{SITE_CONFIG.brandName}</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
            Cucian bersih, wangi, dan tepat waktu. Pesan jemputan dan pantau pesanan langsung dari genggaman.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {/* Instagram */}
            <a
              href={SITE_CONFIG.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${SITE_CONFIG.brandName}`}
              className="grid size-9 place-items-center rounded-full bg-white/10 text-white/70 transition hover:bg-[#00AEEF] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D44C]"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4.5 fill-current">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.516 2.497 5.783 2.225 7.15 2.163 8.416 2.105 8.796 2.163 12 2.163zm0-2.163c-3.259 0-3.667.014-4.947.072-1.527.07-2.887.418-3.979 1.509C1.982 2.672 1.633 4.032 1.563 5.56 1.505 6.84 1.491 7.247 1.491 12c0 4.753.014 5.16.072 6.44.07 1.527.418 2.887 1.509 3.979 1.092 1.091 2.452 1.44 3.979 1.509 1.28.058 1.688.072 4.949.072s3.668-.014 4.948-.072c1.527-.07 2.887-.418 3.979-1.509 1.091-1.092 1.44-2.452 1.509-3.979.058-1.28.072-1.687.072-4.44 0-4.753-.014-5.16-.072-6.44-.07-1.527-.418-2.887-1.509-3.979C19.835.49 18.475.14 16.948.072 15.667.014 15.26 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </a>
            {/* WhatsApp */}
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp ${SITE_CONFIG.brandName}`}
              className="grid size-9 place-items-center rounded-full bg-white/10 text-white/70 transition hover:bg-[#00AEEF] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D44C]"
            >
              <svg viewBox="0 0 32 32" aria-hidden="true" className="size-4.5 fill-current">
                <path d="M16.02 3C8.86 3 3.04 8.79 3.04 15.92c0 2.28.6 4.5 1.75 6.46L3 29l6.82-1.78a13.1 13.1 0 0 0 6.19 1.57h.01C23.16 28.79 29 23 29 15.88 29 12.42 27.65 9.17 25.2 6.73A12.9 12.9 0 0 0 16.02 3Zm0 23.55h-.01a10.9 10.9 0 0 1-5.55-1.52l-.4-.24-4.05 1.06 1.08-3.94-.26-.41a10.7 10.7 0 0 1-1.65-5.58c0-5.98 4.88-10.85 10.88-10.85a10.8 10.8 0 0 1 7.7 3.19 10.74 10.74 0 0 1 3.19 7.66c0 5.98-4.89 10.84-10.93 10.84Zm5.98-8.12c-.33-.16-1.96-.96-2.26-1.07-.3-.11-.52-.16-.74.16-.22.33-.85 1.07-1.04 1.29-.19.22-.38.25-.71.08-.33-.16-1.39-.51-2.65-1.62-.98-.86-1.64-1.92-1.83-2.24-.19-.33-.02-.5.14-.66.15-.15.33-.38.49-.57.16-.19.22-.33.33-.55.11-.22.06-.41-.03-.57-.08-.16-.74-1.78-1.02-2.43-.27-.64-.54-.55-.74-.56-.19-.01-.41-.01-.63-.01s-.58.08-.88.41c-.3.33-1.15 1.12-1.15 2.74s1.18 3.18 1.34 3.4c.16.22 2.32 3.53 5.62 4.95.79.34 1.4.55 1.88.7.79.25 1.51.22 2.08.13.64-.1 1.96-.8 2.24-1.56.27-.77.27-1.43.19-1.56-.08-.14-.3-.22-.63-.39Z" />
              </svg>
            </a>
            {/* TikTok */}
            <a
              href={SITE_CONFIG.socials.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`TikTok ${SITE_CONFIG.brandName}`}
              className="grid size-9 place-items-center rounded-full bg-white/10 text-white/70 transition hover:bg-[#00AEEF] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D44C]"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4.5 fill-current">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.79 1.53V6.77a4.85 4.85 0 0 1-1.02-.08Z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Col 2: Navigasi */}
        <div className="lg:col-span-2">
          <h3 className="mb-3 font-bold">Navigasi</h3>
          <ul className="space-y-1 text-sm text-white/70">
            <li><Link href="/#panduan" className="inline-flex min-h-10 items-center transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D44C]">Cara Kerja</Link></li>
            <li><Link href="/#cuci-satuan" className="inline-flex min-h-10 items-center transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D44C]">Laundry Bar</Link></li>
            <li><Link href="/#tarif" className="inline-flex min-h-10 items-center transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D44C]">Layanan &amp; Harga</Link></li>
            <li><Link href="/#testimoni" className="inline-flex min-h-10 items-center transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D44C]">Testimoni</Link></li>
            <li><Link href="/#jam-operasional" className="inline-flex min-h-10 items-center transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D44C]">Jam Buka</Link></li>
          </ul>
        </div>

        {/* Col 3: Layanan & Akun */}
        <div className="lg:col-span-3">
          <h3 className="mb-3 font-bold">Layanan &amp; Akun</h3>
          <ul className="space-y-1 text-sm text-white/70">
            <li><Link href="/pesan" className="inline-flex min-h-10 items-center transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D44C]">Jadwalkan Jemput</Link></li>
            <li><Link href="/cek-status" className="inline-flex min-h-10 items-center transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D44C]">Lacak Pesanan</Link></li>
            <li><Link href="/akun/masuk" className="inline-flex min-h-10 items-center transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D44C]">Masuk Akun</Link></li>
            <li><Link href="/dashboard" className="inline-flex min-h-10 items-center transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D44C]">Dashboard Pelanggan</Link></li>
            <li><Link href="/peminjaman-alat" className="inline-flex min-h-10 items-center transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D44C]">Sewa Alat</Link></li>
          </ul>
        </div>

        {/* Col 4: Kontak & Operasional */}
        <div className="lg:col-span-3">
          <h3 className="mb-3 font-bold">Kontak &amp; Operasional</h3>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2.5">
              <MapPin size={17} className="mt-0.5 shrink-0 text-[#00AEEF]" />
              <span>
                {SITE_CONFIG.address.street},<br />
                {SITE_CONFIG.address.city} {SITE_CONFIG.address.postalCode}
                <span className="mt-1 block text-xs text-white/50">
                  Area: {SITE_CONFIG.serviceArea}
                </span>
              </span>
            </li>
            <li>
              <a
                href={getWhatsAppUrl()}
                className="flex items-center gap-2.5 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D44C]"
              >
                <Phone size={17} className="shrink-0 text-[#00AEEF]" />
                {SITE_CONFIG.whatsappDisplay}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock3 size={17} className="mt-0.5 shrink-0 text-[#00AEEF]" />
              <span>
                {SITE_CONFIG.operatingHours.weekdays}<br />
                {SITE_CONFIG.operatingHours.saturday}<br />
                {SITE_CONFIG.operatingHours.sunday}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-white/10 px-4 pt-6 pb-2 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 text-xs text-white/55 sm:flex-row sm:justify-between md:pr-44">
          <span>© {SITE_CONFIG.copyrightYear} {SITE_CONFIG.brandName}. Hak cipta dilindungi.</span>
          <div className="flex gap-4">
            <Link href="/membership" className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D44C]">
              Membership
            </Link>
            <Link href="/login?role=admin" className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D44C]">
              Login Staf
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
