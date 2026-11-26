"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Shirt } from "@/lib/icons";
import { getOperationalRole } from "@/lib/admin/role";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

const localTestAccounts = process.env.NODE_ENV !== "production"
  ? {
      admin: {
        email: process.env.NEXT_PUBLIC_LOCAL_ADMIN_EMAIL,
        password: process.env.NEXT_PUBLIC_LOCAL_ADMIN_PASSWORD,
      },
      operator: {
        email: process.env.NEXT_PUBLIC_LOCAL_OPERATOR_EMAIL,
        password: process.env.NEXT_PUBLIC_LOCAL_OPERATOR_PASSWORD,
      },
    }
  : undefined;
const showLocalTestAccounts = Boolean(
  localTestAccounts?.admin.email && localTestAccounts.admin.password &&
  localTestAccounts.operator.email && localTestAccounts.operator.password,
);

function getErrorMessage(error: unknown) {
  if (error instanceof Error && /NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY/.test(error.message)) {
    return "Login belum tersedia saat ini.";
  }
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
        // Missing local Supabase config should not show a technical error before
        // the user tries to sign in.
        if (active && !(failure instanceof Error && /NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY/.test(failure.message))) {
          setError(getErrorMessage(failure));
        }
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
      <div className={`grid w-full items-center gap-6 ${showLocalTestAccounts ? "max-w-5xl lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-8" : "max-w-md"}`}>
      {showLocalTestAccounts && localTestAccounts && <aside className="order-2 rounded-3xl border border-white/80 bg-white/90 p-5 shadow-lg shadow-brand-900/5 backdrop-blur-sm sm:p-6 lg:order-1">
        <h2 className="mt-2 text-xl font-extrabold text-ink">Akun untuk masuk</h2>
        <p className="mt-1 text-sm leading-6 text-muted">Pilih salah satu akun uji di bawah.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-[#9fc9c6] bg-[#cde8e5] p-4">
            <h3 className="text-sm font-extrabold text-ink">Login Admin</h3>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-2"><dt className="font-semibold text-muted">Email</dt><dd className="break-all font-mono text-xs font-bold tracking-tight text-brand-700">{localTestAccounts.admin.email}</dd></div>
              <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-2"><dt className="font-semibold text-muted">Password</dt><dd className="font-mono font-bold text-ink">{localTestAccounts.admin.password}</dd></div>
            </dl>
          </div>
          <div className="rounded-2xl border border-[#c7dce7] bg-[#eef7ff] p-4">
            <h3 className="text-sm font-extrabold text-ink">Login Operator</h3>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-2"><dt className="font-semibold text-muted">Email</dt><dd className="break-all font-mono text-xs font-bold tracking-tight text-brand-700">{localTestAccounts.operator.email}</dd></div>
              <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-2"><dt className="font-semibold text-muted">Password</dt><dd className="font-mono font-bold text-ink">{localTestAccounts.operator.password}</dd></div>
            </dl>
          </div>
        </div>
      </aside>}
      <section className={`order-1 w-full max-w-md justify-self-center rounded-3xl border border-white bg-white p-6 shadow-xl shadow-brand-900/5 sm:p-8 ${showLocalTestAccounts ? "lg:order-2" : ""}`}>
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-700/20 ring-2 ring-brand-500/10">
            <Shirt size={21} strokeWidth={2.1} aria-hidden="true" />
          </span>
          <div>
            <p className="text-lg font-extrabold leading-none tracking-tight text-brand-700 sm:text-xl">Cuci.in</p>
            <p className="mt-1 text-xs text-muted">Area operasional</p>
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
      </div>
    </main>
  );
}
