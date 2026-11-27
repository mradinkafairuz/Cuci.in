"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "@/lib/icons";
import { getBrowserAccountSession } from "@/lib/auth/customer-browser";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { isValidIndonesianPhone } from "@/lib/utils/phone";

type CustomerAuthFormProps = { mode: "login" | "register" };

function getErrorMessage(error: unknown) {
  if (error instanceof Error && /NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY/.test(error.message)) {
    return "Akun pelanggan belum tersedia saat ini.";
  }
  return error instanceof Error ? error.message : "Permintaan belum berhasil. Silakan coba lagi.";
}

export function CustomerAuthForm({ mode }: CustomerAuthFormProps) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    async function checkSession() {
      try {
        const account = await getBrowserAccountSession();
        if (!active) return;
        if (account?.role === "pelanggan") {
          router.replace("/dashboard");
        } else if (account?.role === "admin" || account?.role === "petugas") {
          setError("Sesi ini adalah akun operasional. Gunakan halaman Login staf.");
        }
      } catch (failure) {
        if (active) setError(getErrorMessage(failure));
      } finally {
        if (active) setChecking(false);
      }
    }

    void checkSession();
    return () => { active = false; };
  }, [router]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setNotice("");

    if (isRegister && name.trim().length < 2) {
      setError("Nama lengkap minimal 2 karakter.");
      return;
    }
    if (isRegister && !isValidIndonesianPhone(phone)) {
      setError("Masukkan nomor WhatsApp Indonesia yang valid.");
      return;
    }
    if (password.length < 8) {
      setError("Kata sandi harus terdiri dari minimal 8 karakter.");
      return;
    }

    setBusy(true);
    try {
      const supabase = getBrowserSupabaseClient();
      if (isRegister) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim(), phone: phone.trim() },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setNotice("Pendaftaran berhasil. Periksa email Anda untuk konfirmasi, lalu masuk untuk membuka dashboard.");
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      }

      const account = await getBrowserAccountSession();
      if (account?.role !== "pelanggan") {
        await supabase.auth.signOut();
        throw new Error("Akun ini tidak memiliki akses pelanggan.");
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (failure) {
      setError(getErrorMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-lg rounded-2xl border border-soft bg-white p-6 sm:p-8">
      <p className="text-sm font-bold text-brand-700">Akun pelanggan</p>
      <h1 className="mt-2 text-2xl font-extrabold text-ink">
        {isRegister ? "Buat akun Cuci.in" : "Masuk ke akun"}
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        {isRegister
          ? "Simpan profil, alamat penjemputan, dan riwayat pesanan Anda."
          : "Lanjutkan ke dashboard untuk melihat pesanan dan alamat tersimpan."}
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {isRegister && (
          <>
            <label className="block text-sm font-semibold text-ink">
              Nama lengkap
              <input required minLength={2} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 min-h-12 w-full rounded-xl border border-soft px-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Nomor WhatsApp
              <input required type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="08xxxxxxxxxx" className="mt-1.5 min-h-12 w-full rounded-xl border border-soft px-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
            </label>
          </>
        )}
        <label className="block text-sm font-semibold text-ink">
          Email
          <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 min-h-12 w-full rounded-xl border border-soft px-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
        </label>
        <label className="block text-sm font-semibold text-ink">
          Kata sandi
          <input required type="password" minLength={8} autoComplete={isRegister ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 min-h-12 w-full rounded-xl border border-soft px-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
          {isRegister && <span className="mt-1 block text-xs font-normal text-muted">Minimal 8 karakter.</span>}
        </label>

        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}

        <button type="submit" disabled={checking || busy} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 font-bold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">
          {checking ? "Memeriksa sesi..." : busy ? "Memproses..." : isRegister ? "Buat akun" : "Masuk"}
          {!checking && !busy && <ArrowRight size={17} aria-hidden="true" />}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
        <Link href={isRegister ? "/akun/masuk" : "/akun/daftar"} className="font-bold text-brand-700 underline-offset-4 hover:underline">
          {isRegister ? "Masuk" : "Daftar"}
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-muted">
        Staf laundry? <Link href="/login?role=admin" className="font-semibold text-brand-700 hover:underline">Login staf</Link>
      </p>
    </section>
  );
}
