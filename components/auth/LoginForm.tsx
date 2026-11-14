"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Shirt } from "lucide-react";

export function LoginForm({ initialRole = "admin" }: { initialRole?: "admin" | "petugas" }) {
  const router = useRouter();
  const [role, setRole] = useState<"admin" | "petugas">(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, role }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Login gagal.");
      router.replace(role === "admin" ? "/admin" : "/petugas"); router.refresh();
    } catch (loginError) { setError(loginError instanceof Error ? loginError.message : "Login gagal. Coba lagi."); }
    finally { setLoading(false); }
  }

  return <main className="grid min-h-screen bg-page lg:grid-cols-2">
    <section className="relative hidden overflow-hidden bg-brand-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <Link href="/" className="flex w-fit items-center gap-3 text-xl font-extrabold"><span className="grid size-11 place-items-center rounded-2xl bg-white/15"><Shirt /></span>Cuci.in</Link>
      <div className="relative z-10 max-w-lg"><p className="text-sm font-bold uppercase tracking-[0.2em] text-white/65">Ruang kerja Cuci.in</p><h1 className="mt-4 text-5xl font-extrabold leading-tight">Operasional laundry, lebih teratur.</h1><p className="mt-5 text-lg leading-8 text-white/75">Masuk untuk mengelola pesanan dan memantau pekerjaan harian.</p></div>
      <p className="text-sm text-white/60">Dashboard khusus admin dan petugas.</p><span aria-hidden="true" className="absolute -bottom-40 -right-24 size-[34rem] rounded-full border-[5rem] border-white/5" />
    </section>
    <section className="flex items-center justify-center px-5 py-12 sm:px-10"><div className="w-full max-w-md">
      <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-brand-700"><ArrowLeft size={16} /> Kembali ke beranda</Link>
      <p className="text-sm font-bold text-brand-600">Dashboard staf</p><h2 className="mt-2 text-3xl font-extrabold text-ink">Selamat datang</h2><p className="mt-2 text-sm text-muted">Masuk dengan email dan kata sandi akun staf Anda.</p>
      <div className="mt-7 grid grid-cols-2 rounded-xl bg-soft/70 p-1" aria-label="Pilih role">{(["admin", "petugas"] as const).map((item) => <button key={item} type="button" onClick={() => setRole(item)} className={`rounded-lg px-4 py-2.5 text-sm font-bold capitalize transition ${role === item ? "bg-white text-brand-700 shadow-sm" : "text-muted"}`}>{item}</button>)}</div>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold text-ink">Email<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@gmail.com" className="mt-1.5 w-full rounded-xl border border-soft bg-white px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" /></label>
        <label className="block text-sm font-semibold text-ink">Kata sandi<span className="relative mt-1.5 block"><LockKeyhole size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan kata sandi" className="w-full rounded-xl border border-soft bg-white py-3 pl-10 pr-12 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <button disabled={loading} className="w-full rounded-xl bg-brand-500 px-5 py-3.5 font-bold text-white transition hover:bg-brand-600 disabled:opacity-60">{loading ? "Memeriksa akun…" : `Masuk sebagai ${role}`}</button>
      </form><p className="mt-6 text-center text-xs leading-5 text-muted">Pelanggan tidak perlu login. Anda dapat langsung membuat pesanan dan meminjam alat.</p>
    </div></section>
  </main>;
}
