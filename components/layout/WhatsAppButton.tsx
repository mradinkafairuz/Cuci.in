"use client";

import { usePathname } from "next/navigation";

const WHATSAPP_NUMBER = "6285211981471";

function createMessage(pathname: string) {
  const form = document.querySelector<HTMLFormElement>("[data-wa-order-type]");
  if (form) {
    const value = (name: string) => String(new FormData(form).get(name) ?? "").trim();
    const orderType = form.dataset.waOrderType;
    const lines = [
      "Halo Cuci.in, saya ingin meminta penjemputan laundry.",
      `Pesanan saya: ${orderType === "SATUAN" ? "Cuci satuan" : "Cuci kiloan"} — ${form.dataset.waSelection || "layanan belum dipilih"}`,
    ];
    if (orderType === "SATUAN") lines.push(`Jumlah: ${form.dataset.waQuantity || "1"} item`);
    const name = value("name");
    const phone = value("phone");
    const address = value("address");
    if (name) lines.push(`Nama: ${name}`);
    if (phone) lines.push(`Nomor WhatsApp: ${phone}`);
    if (address) lines.push(`Alamat penjemputan: ${address}`);
    lines.push("Mohon konfirmasi harga dan jadwal penjemputan. Terima kasih.");
    return lines.join("\n");
  }

  if (pathname === "/cek-status") {
    const code = document.querySelector<HTMLInputElement>('input[aria-label="Kode pesanan"]')?.value.trim();
    return code
      ? `Halo Cuci.in, saya ingin menanyakan status pesanan dengan kode ${code}.`
      : "Halo Cuci.in, saya ingin menanyakan status pesanan saya. Mohon bantuannya.";
  }
  if (pathname === "/peminjaman-alat") return "Halo Cuci.in, saya ingin bertanya tentang peminjaman alat. Mohon informasinya.";
  return "Halo Cuci.in, saya ingin bertanya tentang layanan laundry. Mohon informasinya.";
}

export function WhatsAppButton() {
  const pathname = usePathname();

  if (["/login", "/admin", "/petugas", "/dashboard"].some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return null;
  }

  function openWhatsApp() {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(createMessage(pathname))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return <button type="button" onClick={openWhatsApp} aria-label="Hubungi Cuci.in melalui WhatsApp" className="fixed bottom-24 right-5 z-[60] grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-900/25 transition hover:scale-105 hover:bg-[#1fbd5b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 sm:bottom-7 sm:right-7">
    <svg viewBox="0 0 32 32" aria-hidden="true" className="size-8 fill-current"><path d="M16.02 3C8.86 3 3.04 8.79 3.04 15.92c0 2.28.6 4.5 1.75 6.46L3 29l6.82-1.78a13.1 13.1 0 0 0 6.19 1.57h.01C23.16 28.79 29 23 29 15.88 29 12.42 27.65 9.17 25.2 6.73A12.9 12.9 0 0 0 16.02 3Zm0 23.55h-.01a10.9 10.9 0 0 1-5.55-1.52l-.4-.24-4.05 1.06 1.08-3.94-.26-.41a10.7 10.7 0 0 1-1.65-5.58c0-5.98 4.88-10.85 10.88-10.85a10.8 10.8 0 0 1 7.7 3.19 10.74 10.74 0 0 1 3.19 7.66c0 5.98-4.89 10.84-10.93 10.84Zm5.98-8.12c-.33-.16-1.96-.96-2.26-1.07-.3-.11-.52-.16-.74.16-.22.33-.85 1.07-1.04 1.29-.19.22-.38.25-.71.08-.33-.16-1.39-.51-2.65-1.62-.98-.86-1.64-1.92-1.83-2.24-.19-.33-.02-.5.14-.66.15-.15.33-.38.49-.57.16-.19.22-.33.33-.55.11-.22.06-.41-.03-.57-.08-.16-.74-1.78-1.02-2.43-.27-.64-.54-.55-.74-.56-.19-.01-.41-.01-.63-.01s-.58.08-.88.41c-.3.33-1.15 1.12-1.15 2.74s1.18 3.18 1.34 3.4c.16.22 2.32 3.53 5.62 4.95.79.34 1.4.55 1.88.7.79.25 1.51.22 2.08.13.64-.1 1.96-.8 2.24-1.56.27-.77.27-1.43.19-1.56-.08-.14-.3-.22-.63-.39Z" /></svg>
  </button>;
}
