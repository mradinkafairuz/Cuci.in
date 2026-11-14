import Link from "next/link";
import { ArrowRight, Clock3, PackageCheck, Wallet } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardOrdersTable } from "@/components/dashboard/DashboardOrdersTable";
import { Card } from "@/components/ui/Card";

const stats = [
  { label: "Pesanan aktif", icon: PackageCheck },
  { label: "Menunggu diambil", icon: Clock3 },
  { label: "Total transaksi", icon: Wallet },
];

export default function CustomerDashboardPage() {
  return <DashboardShell role="pelanggan">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-sm font-semibold text-brand-600">Dashboard pelanggan</p><h1 className="mt-1 text-2xl font-extrabold text-ink sm:text-3xl">Ringkasan pesanan</h1><p className="mt-1 text-sm text-muted">Pantau laundry dan tagihan Anda di satu tempat.</p></div>
      <Link href="/pesan" className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-bold text-white hover:bg-brand-600">Buat pesanan <ArrowRight size={16} /></Link>
    </div>
    <div className="grid gap-4 sm:grid-cols-3">{stats.map(({ label, icon: Icon }) => <Card key={label} className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm text-muted">{label}</p><p className="mt-2 text-2xl font-extrabold text-ink">—</p><p className="mt-1 text-xs text-muted">Menunggu data Supabase</p></div><span className="rounded-xl bg-brand-500/10 p-2.5 text-brand-700"><Icon size={20} /></span></div></Card>)}</div>
    <Card className="mt-6 py-10 text-center"><PackageCheck size={34} className="mx-auto text-brand-300" /><h2 className="mt-3 font-bold text-ink">Belum ada data pesanan</h2><p className="mt-1 text-sm text-muted">Informasi pesanan akan tampil setelah Supabase terhubung.</p></Card>
    <section className="mt-8"><div className="mb-4"><h2 className="text-xl font-bold text-ink">Riwayat pesanan</h2><p className="mt-1 text-sm text-muted">Riwayat akan muncul setelah data tersedia.</p></div><DashboardOrdersTable customerOnly /></section>
  </DashboardShell>;
}
