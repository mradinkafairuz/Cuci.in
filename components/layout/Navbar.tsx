"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BadgeDollarSign, House, PackageSearch, ShoppingBag, Sparkles } from "lucide-react";
import { getBrowserAccountSession } from "@/lib/auth/customer-browser";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

const navItems = [
  { label: "Beranda", shortLabel: "Beranda", href: "/", icon: House },
  { label: "Layanan", shortLabel: "Layanan", href: "/#layanan", icon: Sparkles },
  { label: "Tarif", shortLabel: "Tarif", href: "/#tarif", icon: BadgeDollarSign },
  { label: "Pesan", shortLabel: "Pesan", href: "/pesan", icon: ShoppingBag },
  { label: "Cek Status", shortLabel: "Status", href: "/cek-status", icon: PackageSearch },
];

export function Navbar() {
  const pathname = usePathname();
  const [active, setActive] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCustomerSignedIn, setIsCustomerSignedIn] = useState(false);

  useEffect(() => {
    let activeEffect = true;
    let subscription: { unsubscribe: () => void } | null = null;
    let roleCheckTimeout: number | undefined;

    async function watchCustomerSession() {
      try {
        const supabase = getBrowserSupabaseClient();
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!session) {
            setIsCustomerSignedIn(false);
            return;
          }
          if (roleCheckTimeout !== undefined) window.clearTimeout(roleCheckTimeout);
          roleCheckTimeout = window.setTimeout(() => {
            void getBrowserAccountSession()
              .then((account) => { if (activeEffect) setIsCustomerSignedIn(account?.role === "pelanggan"); })
              .catch(() => { if (activeEffect) setIsCustomerSignedIn(false); });
          }, 0);
        });
        subscription = data.subscription;
        const account = await getBrowserAccountSession();
        if (activeEffect) setIsCustomerSignedIn(account?.role === "pelanggan");
      } catch {
        if (activeEffect) setIsCustomerSignedIn(false);
      }
    }

    void watchCustomerSession();
    return () => {
      activeEffect = false;
      subscription?.unsubscribe();
      if (roleCheckTimeout !== undefined) window.clearTimeout(roleCheckTimeout);
    };
  }, []);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 16);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    const routeActive = pathname === "/cek-status"
      ? 4
      : pathname === "/pesan" || pathname.startsWith("/pesan/")
        ? 3
        : 0;
    const hashActive: Record<string, number> = {
      "#layanan": 1,
      "#cuci-satuan": 1,
      "#tarif": 2,
    };
    setActive(pathname === "/" ? hashActive[window.location.hash] ?? 0 : routeActive);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") return;

    let frame = 0;
    const sections = [
      { id: "cuci-satuan", index: 1 },
      { id: "tarif", index: 2 },
    ];
    const updateActiveSection = () => {
      frame = 0;
      const activationLine = window.innerHeight * 0.35;
      let nextActive = 0;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= activationLine) {
          nextActive = section.index;
        }
      }
      setActive((current) => current === nextActive ? current : nextActive);
    };
    const scheduleUpdate = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [pathname]);

  const accountHref = isCustomerSignedIn ? "/dashboard" : "/akun/masuk";

  return (
    <>
      <header className={`relative z-50 border-b transition-colors duration-300 md:sticky md:top-0 ${
        isScrolled
          ? "border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md"
          : "border-transparent bg-[#D9F2FB]"
      }`}>
        <div className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-[min-height,padding] duration-300 sm:px-6 ${
          isScrolled ? "min-h-14 py-2 md:py-1.5" : "min-h-14 py-2.5 md:min-h-[5.5rem] md:py-4"
        }`}>
          <Link href="/" aria-label="Cuci.in, kembali ke beranda" className="group flex shrink-0 items-center gap-2.5">
            <Image
              src="/images/icon.png"
              alt=""
              width={42}
              height={42}
              priority
              className={`object-contain transition-transform group-hover:rotate-[-5deg] ${isScrolled ? "size-9" : "size-9 md:size-10"}`}
            />
            <span className="text-xl font-extrabold tracking-tight text-[#181818] sm:text-2xl">Cuci.in</span>
          </Link>

          <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = active === index;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setActive(index)}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AEEF] ${
                    isActive
                      ? isScrolled
                        ? "bg-[#D9F2FB]/80 text-[#006F91]"
                        : "bg-white text-[#0079A8] shadow-xs"
                      : isScrolled
                        ? "text-slate-700 hover:bg-slate-100/80 hover:text-[#0079A8]"
                        : "text-slate-700 hover:bg-white/60 hover:text-[#0079A8]"
                  }`}
                >
                  <Icon size={17} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link href={accountHref} className="rounded-full border border-[#0083AA]/20 bg-white/85 px-3.5 py-1.5 text-sm font-bold text-[#006F91] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AEEF] md:py-2">
              <span className="sm:hidden">{isCustomerSignedIn ? "Akun" : "Masuk"}</span>
              <span className="hidden sm:inline">{isCustomerSignedIn ? "Dashboard" : "Masuk"}</span>
            </Link>
            {!isCustomerSignedIn && (
              <Link href="/akun/daftar" className="hidden rounded-full bg-[#F7D44C] px-4 py-2 text-sm font-extrabold text-[#181818] transition hover:bg-[#efc52d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0079A8] sm:inline-flex">
                Daftar
              </Link>
            )}
          </div>
        </div>
      </header>

      <nav aria-label="Navigasi utama mobile" className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_28px_rgba(15,35,48,0.08)] backdrop-blur-md md:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  aria-current={active === index ? "page" : undefined}
                  onClick={() => setActive(index)}
                  className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-[10px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AEEF] ${
                    active === index ? "bg-[#D9F2FB] text-[#006F91]" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={19} aria-hidden="true" />
                  <span>{item.shortLabel}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
