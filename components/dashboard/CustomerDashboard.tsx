"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserAccountSession } from "@/lib/auth/customer-browser";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { formatRupiah } from "@/lib/utils/format";
import type { Database } from "@/types/database.types";

type CustomerAddress = Database["public"]["Tables"]["customer_addresses"]["Row"];
type CustomerOrder = Pick<
  Database["public"]["Tables"]["orders"]["Row"],
  "id" | "order_code" | "order_type" | "process_status" | "total_price" | "pickup_at" | "created_at" | "contact_phone"
>;
type OrderStatus = Database["public"]["Enums"]["process_status"];

const orderStatusLabels: Record<OrderStatus, string> = {
  MENUNGGU: "Menunggu konfirmasi",
  DITERIMA: "Diterima",
  DIPROSES: "Diproses",
  DICUCI: "Sedang dicuci",
  DISETRIKA: "Sedang disetrika",
  SIAP_DIAMBIL: "Siap diambil",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

function formatOrderDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: "Asia/Jakarta",
  }).format(new Date(date));
}

export function CustomerDashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [pageError, setPageError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState("");
  const [editingAddressId, setEditingAddressId] = useState("");
  const [addressLabel, setAddressLabel] = useState("Rumah");
  const [recipientName, setRecipientName] = useState("");
  const [addressPhone, setAddressPhone] = useState("");
  const [addressText, setAddressText] = useState("");

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      setLoading(true);
      setPageError("");
      try {
        const account = await getBrowserAccountSession();
        if (!account) {
          router.replace("/akun/masuk");
          return;
        }
        if (account.role === "admin" || account.role === "petugas") {
          router.replace(account.role === "admin" ? "/admin" : "/petugas");
          return;
        }
        if (account.role !== "pelanggan") {
          router.replace("/akun/masuk");
          return;
        }

        const supabase = getBrowserSupabaseClient();
        const customerId = account.session.user.id;
        const [profileResult, addressResult, orderResult] = await Promise.all([
          supabase.from("profiles").select("full_name, phone").eq("id", customerId).single(),
          supabase.from("customer_addresses").select("*").eq("customer_id", customerId).order("created_at", { ascending: false }),
          supabase.from("orders").select("id, order_code, order_type, process_status, total_price, pickup_at, created_at, contact_phone").eq("customer_id", customerId).order("created_at", { ascending: false }),
        ]);
        if (profileResult.error) throw profileResult.error;
        if (addressResult.error) throw addressResult.error;
        if (orderResult.error) throw orderResult.error;
        if (!active) return;

        setUserId(customerId);
        setEmail(account.session.user.email ?? "");
        setProfileName(profileResult.data.full_name);
        setProfilePhone(profileResult.data.phone ?? "");
        setAddresses(addressResult.data);
        setOrders(orderResult.data);
      } catch (failure) {
        if (active) {
          setPageError(failure instanceof Error ? failure.message : "Dashboard belum dapat dimuat. Coba lagi.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();
    return () => { active = false; };
  }, [router, reloadKey]);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId || savingProfile) return;
    if (profileName.trim().length < 2) {
      setProfileError("Nama lengkap minimal 2 karakter.");
      return;
    }
    setSavingProfile(true);
    setProfileError("");
    try {
      const { error } = await getBrowserSupabaseClient()
        .from("profiles")
        .update({ full_name: profileName.trim(), phone: profilePhone.trim() || null })
        .eq("id", userId);
      if (error) throw error;
      setProfileName(profileName.trim());
      setProfilePhone(profilePhone.trim());
    } catch (failure) {
      setProfileError(failure instanceof Error ? failure.message : "Profil belum dapat disimpan.");
    } finally {
      setSavingProfile(false);
    }
  }

  function resetAddressForm() {
    setEditingAddressId("");
    setAddressLabel("Rumah");
    setRecipientName(profileName);
    setAddressPhone(profilePhone);
    setAddressText("");
  }

  async function saveAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId || savingAddress) return;
    setSavingAddress(true);
    setAddressError("");
    try {
      const supabase = getBrowserSupabaseClient();
      const values = {
        label: addressLabel.trim() || "Alamat",
        recipient_name: recipientName.trim(),
        phone: addressPhone.trim(),
        address: addressText.trim(),
      };
      if (editingAddressId) {
        const { data, error } = await supabase.from("customer_addresses").update(values).eq("id", editingAddressId).eq("customer_id", userId).select().single();
        if (error) throw error;
        setAddresses((current) => current.map((address) => address.id === data.id ? data : address));
      } else {
        const { data, error } = await supabase.from("customer_addresses").insert({ ...values, customer_id: userId }).select().single();
        if (error) throw error;
        setAddresses((current) => [data, ...current]);
      }
      resetAddressForm();
    } catch (failure) {
      setAddressError(failure instanceof Error ? failure.message : "Alamat belum dapat disimpan.");
    } finally {
      setSavingAddress(false);
    }
  }

  function editAddress(address: CustomerAddress) {
    setEditingAddressId(address.id);
    setAddressLabel(address.label);
    setRecipientName(address.recipient_name);
    setAddressPhone(address.phone);
    setAddressText(address.address);
  }

  async function deleteAddress(address: CustomerAddress) {
    if (!window.confirm(`Hapus alamat "${address.label}"?`)) return;
    setDeletingAddressId(address.id);
    setAddressError("");
    try {
      const { error } = await getBrowserSupabaseClient()
        .from("customer_addresses")
        .delete()
        .eq("id", address.id)
        .eq("customer_id", userId);
      if (error) throw error;
      setAddresses((current) => current.filter((entry) => entry.id !== address.id));
      if (editingAddressId === address.id) resetAddressForm();
    } catch (failure) {
      setAddressError(failure instanceof Error ? failure.message : "Alamat belum dapat dihapus.");
    } finally {
      setDeletingAddressId("");
    }
  }

  async function signOut() {
    setLogoutError("");
    try {
      const { error } = await getBrowserSupabaseClient().auth.signOut();
      if (error) throw error;
      router.replace("/");
      router.refresh();
    } catch (failure) {
      setLogoutError(failure instanceof Error ? failure.message : "Anda belum dapat keluar.");
    }
  }

  const activeOrders = orders.filter((order) => order.process_status !== "SELESAI" && order.process_status !== "DIBATALKAN");
  const pastOrders = orders.filter((order) => order.process_status === "SELESAI" || order.process_status === "DIBATALKAN");

  if (loading) {
    return <div aria-busy="true" aria-label="Memuat dashboard pelanggan" className="mx-auto max-w-5xl space-y-4">
      <div className="h-8 w-1/3 animate-pulse rounded bg-soft" />
      <div className="h-40 animate-pulse rounded-2xl bg-soft" />
      <div className="h-56 animate-pulse rounded-2xl bg-soft" />
    </div>;
  }

  if (pageError) {
    return <section className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-6 text-center">
      <h1 className="text-xl font-bold text-ink">Dashboard belum dapat dimuat</h1>
      <p role="alert" className="mt-2 text-sm text-red-700">{pageError}</p>
      <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="mt-5 min-h-11 rounded-xl bg-brand-600 px-5 font-semibold text-white hover:bg-brand-700">Coba lagi</button>
    </section>;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-brand-700">Area pelanggan</p>
          <h1 className="mt-1 text-3xl font-extrabold text-ink">Halo, {profileName || "Pelanggan"}</h1>
          <p className="mt-2 text-sm text-muted">{email}</p>
        </div>
        <button type="button" onClick={() => void signOut()} className="min-h-11 rounded-xl border border-soft px-4 text-sm font-semibold text-ink hover:bg-white">Keluar</button>
      </header>
      {logoutError && <p role="alert" className="mt-3 text-sm text-red-700">{logoutError}</p>}

      <section className="mt-8 rounded-2xl border border-soft bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Pesanan aktif</h2>
            <p className="mt-1 text-sm text-muted">Pesanan yang dibuat saat masuk akan otomatis tersimpan di sini.</p>
          </div>
          <Link href="/pesan" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700">Buat pesanan</Link>
        </div>
        {activeOrders.length === 0 ? (
          <div className="mt-5 rounded-xl bg-soft/40 px-4 py-6 text-center">
            <p className="font-semibold text-ink">Belum ada pesanan aktif</p>
            <p className="mt-1 text-sm text-muted">Pesan layanan untuk mulai melihat progres cucian di dashboard.</p>
          </div>
        ) : (
          <ul className="mt-5 divide-y divide-soft">
            {activeOrders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div>
                  <p className="font-mono font-bold text-brand-700">{order.order_code}</p>
                  <p className="mt-1 text-sm text-ink">{order.order_type === "KILOAN" ? "Cuci kiloan" : "Cuci satuan"} · {orderStatusLabels[order.process_status]}</p>
                  <p className="mt-1 text-xs text-muted">Dibuat {formatOrderDate(order.created_at)}{order.total_price !== null ? ` · ${formatRupiah(order.total_price)}` : ""}</p>
                </div>
                <Link href={`/cek-status?kode=${encodeURIComponent(order.order_code)}&hp=${encodeURIComponent(order.contact_phone.replace(/\D/g, "").slice(-4))}`} className="min-h-11 rounded-xl border border-brand-200 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">Lacak status</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-soft bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold text-ink">Profil pelanggan</h2>
          <p className="mt-1 text-sm text-muted">Perbarui nama dan nomor yang digunakan untuk penjemputan.</p>
          <form onSubmit={saveProfile} className="mt-4 space-y-4">
            <label className="block text-sm font-semibold text-ink">Nama lengkap
              <input required minLength={2} autoComplete="name" value={profileName} onChange={(event) => setProfileName(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-soft px-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
            </label>
            <label className="block text-sm font-semibold text-ink">Nomor WhatsApp
              <input type="tel" inputMode="tel" autoComplete="tel" value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-soft px-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
            </label>
            {profileError && <p role="alert" className="text-sm text-red-700">{profileError}</p>}
            <button type="submit" disabled={savingProfile} className="min-h-11 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">{savingProfile ? "Menyimpan..." : "Simpan profil"}</button>
          </form>
        </section>

        <section className="rounded-2xl border border-soft bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold text-ink">Alamat penjemputan tersimpan</h2>
          <p className="mt-1 text-sm text-muted">Simpan beberapa alamat agar mudah digunakan saat memesan.</p>
          {addresses.length > 0 && <ul className="mt-4 space-y-3">
            {addresses.map((address) => (
              <li key={address.id} className="rounded-xl border border-soft p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{address.label} · {address.recipient_name}</p>
                    <p className="mt-1 text-xs text-muted">{address.phone}</p>
                    <p className="mt-2 break-words text-sm text-ink">{address.address}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => editAddress(address)} className="min-h-10 rounded-lg px-2 text-xs font-bold text-brand-700 hover:bg-brand-50">Ubah</button>
                    <button type="button" disabled={deletingAddressId === address.id} onClick={() => void deleteAddress(address)} className="min-h-10 rounded-lg px-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50">{deletingAddressId === address.id ? "..." : "Hapus"}</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>}
          <form onSubmit={saveAddress} className="mt-4 space-y-3 border-t border-soft pt-4">
            <h3 className="font-semibold text-ink">{editingAddressId ? "Ubah alamat" : "Tambah alamat"}</h3>
            <label className="block text-sm font-medium text-ink">Label alamat
              <input required maxLength={60} value={addressLabel} onChange={(event) => setAddressLabel(event.target.value)} placeholder="Rumah, kantor..." className="mt-1 w-full rounded-xl border border-soft px-3 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-ink">Nama penerima
                <input required minLength={2} value={recipientName} onChange={(event) => setRecipientName(event.target.value)} className="mt-1 w-full rounded-xl border border-soft px-3 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
              </label>
              <label className="block text-sm font-medium text-ink">Nomor WhatsApp
                <input required type="tel" inputMode="tel" value={addressPhone} onChange={(event) => setAddressPhone(event.target.value)} className="mt-1 w-full rounded-xl border border-soft px-3 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
              </label>
            </div>
            <label className="block text-sm font-medium text-ink">Alamat lengkap
              <textarea required minLength={8} rows={3} value={addressText} onChange={(event) => setAddressText(event.target.value)} className="mt-1 w-full resize-y rounded-xl border border-soft px-3 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="Jalan, nomor rumah, kecamatan, dan patokan" />
            </label>
            {addressError && <p role="alert" className="text-sm text-red-700">{addressError}</p>}
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={savingAddress} className="min-h-11 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">{savingAddress ? "Menyimpan..." : editingAddressId ? "Simpan perubahan" : "Simpan alamat"}</button>
              {editingAddressId && <button type="button" onClick={resetAddressForm} className="min-h-11 rounded-xl border border-soft px-4 text-sm font-semibold text-ink hover:bg-soft/40">Batal</button>}
            </div>
          </form>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-soft bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-ink">Riwayat pesanan</h2>
        {pastOrders.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Pesanan yang selesai atau dibatalkan akan muncul di sini.</p>
        ) : (
          <ul className="mt-3 divide-y divide-soft">
            {pastOrders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-mono text-sm font-bold text-ink">{order.order_code}</p>
                  <p className="mt-1 text-xs text-muted">{orderStatusLabels[order.process_status]} · {formatOrderDate(order.created_at)}</p>
                </div>
                <Link href={`/cek-status?kode=${encodeURIComponent(order.order_code)}&hp=${encodeURIComponent(order.contact_phone.replace(/\D/g, "").slice(-4))}`} className="text-sm font-semibold text-brand-700 hover:underline">Lihat detail</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
