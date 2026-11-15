"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Shirt } from "lucide-react";
import { getOperationalRole } from "@/lib/admin/role";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Login belum berhasil. Silakan coba lagi.";
}

export function OperationsLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function redirectExistingSession() {
      try {
        const { data, error: sessionError } = await getBrowserSupabaseClient().auth.getSession();
        if (sessionError) throw sessionError;
        if (!data.session) return;

        const role = await getOperationalRole(data.session.user.id);
        if (!active) return;
        if (role) {
          router.replace(role === "admin" ? "/admin" : "/petugas");
        } else {
          setError("Akun ini belum memiliki akses admin atau petugas.");
        }
      } catch (failure) {
        if (active) setError(getErrorMessage(failure));
      } finally {
        if (active) setChecking(false);
      }
    }

    void redirectExistingSession();
    return () => { active = false; };
  }, [router]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      const supabase = getBrowserSupabaseClient();
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (loginError) throw loginError;

      const role = await getOperationalRole(data.user.id);
      if (!role) {
        await supabase.auth.signOut();
        setError("Akun ini belum memiliki akses admin atau petugas.");
        return;
      }

      router.replace(role === "admin" ? "/admin" : "/petugas");
    } catch (failure) {
      setError(getErrorMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-soft/50 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-white bg-white p-6 shadow-xl shadow-brand-900/5 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-500 text-white">
            <Shirt size={24} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-brand-700">Cuci.in</p>
            <p className="text-xs text-muted">Area operasional</p>
          </div>
        </div>

        <h1 className="mt-8 text-2xl font-extrabold tracking-tight text-ink">Masuk ke panel</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Gunakan akun operasional. Panel admin atau petugas akan dibuka otomatis sesuai akses akun Anda.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-ink">
            Email
            <input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 min-h-12 w-full rounded-xl border border-soft px-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Kata sandi
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 min-h-12 w-full rounded-xl border border-soft px-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </label>

          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={checking || busy}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {checking ? "Memeriksa sesi..." : busy ? "Memverifikasi..." : "Masuk"}
            {!checking && !busy && <ArrowRight size={17} aria-hidden="true" />}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted">
          Akun harus memiliki role admin atau petugas yang ditetapkan di Supabase.
        </p>
      </section>
    </main>
  );
}
