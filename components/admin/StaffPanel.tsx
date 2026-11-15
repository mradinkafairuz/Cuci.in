"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, RefreshCw } from "lucide-react";
import { OrdersPanel } from "@/components/admin/AdminPanel";
import { getOperationalRole } from "@/lib/admin/role";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

export function StaffPanel() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    try {
      const supabase = getBrowserSupabaseClient();
      const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
        if (!active) return;
        if (event === "INITIAL_SESSION") return;
        if (!session) {
          setToken("");
          setEmail("");
          router.replace("/login");
          return;
        }
        setToken(session.access_token);
        setEmail(session.user.email ?? "");
      });
      void (async () => {
        try {
          const { data, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          if (data.session) {
            const role = await getOperationalRole(data.session.user.id);
            if (!active) return;
            if (role === "admin") {
              router.replace("/admin");
            } else if (role !== "petugas") {
              router.replace("/login");
            } else {
              setToken(data.session.access_token);
              setEmail(data.session.user.email ?? "");
            }
          } else {
            router.replace("/login");
          }
        } catch (failure) {
          if (active) setError(failure instanceof Error ? failure.message : "Sesi petugas belum dapat diperiksa.");
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
        listener.subscription.unsubscribe();
      };
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Konfigurasi Supabase browser tidak ditemukan.");
      setLoading(false);
    }
  }, [router]);

  async function logout() {
    try {
      const { error: signOutError } = await getBrowserSupabaseClient().auth.signOut();
      if (signOutError) throw signOutError;
      router.replace("/login");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Anda belum berhasil keluar.");
    }
  }

  if (loading) return <div className="grid min-h-screen place-items-center text-sm text-muted">Memeriksa sesi petugas...</div>;
  if (!token) return <main className="grid min-h-screen place-items-center px-4">
    <div className="max-w-md text-center">
      {error
        ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        : <p className="text-sm text-muted">Mengalihkan ke halaman login...</p>}
      {error && <Link href="/login" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-brand-600 px-4 text-sm font-bold text-white">Buka halaman login</Link>}
    </div>
  </main>;

  return <main className="min-h-screen bg-page">
    <header className="border-b border-soft bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div><p className="text-sm font-bold text-brand-700">Cuci.in · Panel petugas</p><p className="text-xs text-muted">{email}</p></div>
        <button onClick={() => void logout()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-soft px-3 text-sm font-semibold text-ink"><LogOut size={15} /> Keluar</button>
      </div>
    </header>
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-sm font-semibold text-brand-700">Operasional laundry</p><h1 className="mt-1 text-2xl font-extrabold text-ink sm:text-3xl">Antrean pesanan</h1><p className="mt-1 text-sm text-muted">Ubah status pekerjaan, catat berat, dan perbarui pembayaran.</p></div>
        <button onClick={() => setRefreshKey((value) => value + 1)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-soft bg-white px-4 text-sm font-semibold text-ink"><RefreshCw size={15} /> Muat ulang</button>
      </div>
      <OrdersPanel token={token} canManageAll={false} refreshKey={refreshKey} />
    </div>
  </main>;
}
