import { Clock3, PackageCheck, Shirt } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StaffQueue } from "@/components/dashboard/StaffQueue";
import { Card } from "@/components/ui/Card";

const stats = [
  { label: "Menunggu", icon: Clock3, tone: "bg-amber-100 text-amber-700" },
  { label: "Dalam proses", icon: Shirt, tone: "bg-brand-500/10 text-brand-700" },
  { label: "Siap diserahkan", icon: PackageCheck, tone: "bg-emerald-100 text-emerald-700" },
];

export default function StaffDashboardPage() {
  return <DashboardShell role="petugas">
    <div className="mb-6"><p className="text-sm font-semibold text-brand-600">Operasional laundry</p><h1 className="mt-1 text-2xl font-extrabold text-ink sm:text-3xl">Antrean pengerjaan</h1><p className="mt-1 text-sm text-muted">Periksa cucian masuk, masukkan berat, dan perbarui progres.</p></div>
    <div className="mb-6 grid gap-4 sm:grid-cols-3">{stats.map(({ label, icon: Icon, tone }) => <Card key={label} className="flex items-center gap-3 p-5"><span className={`rounded-xl p-3 ${tone}`}><Icon size={20} /></span><div><p className="text-sm text-muted">{label}</p><p className="text-2xl font-extrabold text-ink">—</p><p className="text-xs text-muted">Menunggu data Supabase</p></div></Card>)}</div>
    <StaffQueue />
  </DashboardShell>;
}
