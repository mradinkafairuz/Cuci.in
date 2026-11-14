import Link from "next/link";
import { Mail, MapPin, Phone, Shirt } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-brand-700 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-lg font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <Shirt size={20} />
            </span>
            Cuci.in
          </div>
          <p className="mt-3 max-w-xs text-sm text-white/75">
            Cucian bersih, wangi, dan tepat waktu. Pesan dan pantau pesanan
            Anda kapan saja.
          </p>
        </div>

        <div>
          <h3 className="mb-3 font-semibold">Layanan</h3>
          <ul className="space-y-2 text-sm text-white/75">
            <li><Link href="/peminjaman-alat" className="inline-flex min-h-11 items-center hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Peminjaman alat laundry</Link></li>
          </ul>
        </div>

        <div className="md:justify-self-end">
          <h3 className="mb-3 font-semibold">Kontak</h3>
          <ul className="space-y-2 text-sm text-white/75">
            <li className="flex items-center gap-2"><MapPin size={16} /> Semarang, Jawa Tengah</li>
            <li className="flex items-center gap-2"><Phone size={16} /> 0812-3456-7890</li>
            <li className="flex items-center gap-2"><Mail size={16} /> halo@cuci.in</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15 px-4 pb-2 pt-6 text-center text-xs text-white/80">
        © 2026 Cuci.in. Sistem Informasi Layanan Laundry.
      </div>
    </footer>
  );
}
