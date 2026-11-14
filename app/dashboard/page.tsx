import Link from "next/link";
import { ArrowRight, PackageSearch, ShoppingBag, Wrench } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const actions = [
  { href: "/pesan", title: "Buat pesanan laundry", description: "Pilih layanan dan jadwalkan penjemputan cucian.", icon: ShoppingBag },
  { href: "/cek-status", title: "Cek status pesanan", description: "Lihat tahapan pengerjaan dengan kode pesanan Anda.", icon: PackageSearch },
  { href: "/peminjaman-alat", title: "Pinjam alat laundry", description: "Ajukan mesin cuci, setrika uap, dan alat lainnya.", icon: Wrench },
];

export default function CustomerDashboardPage() {
  return <><Navbar /><main className="min-h-[70vh] bg-soft/35 px-4 py-14 sm:px-6 sm:py-20"><div className="mx-auto max-w-4xl"><p className="text-sm font-bold text-brand-600">Area pelanggan</p><h1 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">Semua bisa dilakukan tanpa login</h1><p className="mt-3 max-w-2xl leading-7 text-muted">Pelanggan dapat langsung memesan laundry, melacak pesanan dengan kode, atau mengajukan peminjaman alat.</p><div className="mt-8 grid gap-4 md:grid-cols-3">{actions.map(({ href, title, description, icon: Icon }) => <Link key={href} href={href} className="group rounded-2xl border border-soft bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"><span className="grid size-11 place-items-center rounded-xl bg-brand-500/10 text-brand-700"><Icon size={21} /></span><h2 className="mt-4 font-bold text-ink">{title}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-muted">{description}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-700">Buka <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span></Link>)}</div></div></main><Footer /></>;
}
