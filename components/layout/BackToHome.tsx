import Link from "next/link";
import { ArrowLeft } from "@/lib/icons";

export function BackToHome() {
  return (
    <Link
      href="/"
      className="mb-8 inline-flex items-center gap-2 rounded-xl border border-brand-300 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-soft"
    >
      <ArrowLeft size={16} /> Kembali ke halaman utama
    </Link>
  );
}
