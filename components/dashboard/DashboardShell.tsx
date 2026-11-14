import Link from "next/link";
import { ArrowLeft, LayoutDashboard, LogOut, Shirt, Users, WashingMachine } from "lucide-react";

export type DashboardRole = "pelanggan" | "petugas" | "admin";

const roleInfo = {
  pelanggan: { title: "Dashboard Pelanggan", home: "/dashboard", icon: LayoutDashboard, links: [{ href: "/dashboard", label: "Ringkasan" }, { href: "/pesan", label: "Buat pesanan" }, { href: "/cek-status", label: "Lacak pesanan" }] },
  petugas: { title: "Dashboard Petugas", home: "/petugas", icon: WashingMachine, links: [{ href: "/petugas", label: "Antrean pesanan" }] },
  admin: { title: "Dashboard Admin", home: "/admin", icon: Users, links: [{ href: "/admin", label: "Ringkasan" }] },
} satisfies Record<DashboardRole, { title: string; home: string; icon: typeof LayoutDashboard; links: { href: string; label: string }[] }>;

export function DashboardShell({ role, children }: { role: DashboardRole; children: React.ReactNode }) {
  const info = roleInfo[role];
  const Icon = info.icon;
  return (
    <div className="min-h-screen bg-page">
      <header className="border-b border-soft bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-brand-700"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white"><Shirt size={19} /></span>Cuci.in</Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-brand-700"><ArrowLeft size={16} /> Kembali ke halaman utama</Link>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[230px_1fr] lg:py-8">
        <aside className="h-fit rounded-2xl border border-soft bg-white p-4">
          <div className="mb-4 flex items-center gap-3 border-b border-soft px-2 pb-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-700"><Icon size={20} /></span>
            <div><p className="text-xs text-muted">Area</p><p className="font-bold text-ink">{info.title}</p></div>
          </div>
          <nav aria-label={`Navigasi ${info.title}`} className="flex gap-2 overflow-x-auto lg:flex-col">
            {info.links.map((link) => <Link key={link.href} href={link.href} className="shrink-0 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted hover:bg-soft/60 hover:text-brand-700">{link.label}</Link>)}
          </nav>
          <div className="mt-5 hidden border-t border-soft pt-4 lg:block"><span className="flex items-center gap-2 px-3 py-2 text-sm text-muted"><LogOut size={15} /> Keluar (demo)</span></div>
        </aside>
        <main className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><strong>Mode pratinjau</strong><span>Data contoh; belum ada login dan pembatasan role. Perubahan belum tersimpan ke server.</span></div>
          {children}
        </main>
      </div>
    </div>
  );
}
