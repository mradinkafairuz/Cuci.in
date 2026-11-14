"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BadgeDollarSign, BookOpen, Clock3, House, MoreHorizontal, PackageSearch, Shirt, ShoppingBag, Sparkles, X } from "lucide-react";
import { LiquidNavbar, type LiquidNavItem } from "@/components/ui/liquid-glass-navbar";

const navItems: LiquidNavItem[] = [
  { label: "Beranda", href: "/", icon: <House size={18} strokeWidth={1.8} />, fx: "glow" },
  { label: "Layanan", href: "/#layanan", icon: <Sparkles size={18} strokeWidth={1.8} />, fx: "spin" },
  { label: "Tarif", href: "/#tarif", icon: <BadgeDollarSign size={18} strokeWidth={1.8} />, fx: "drop" },
  { label: "Cuci Satuan", href: "/#cuci-satuan", icon: <Shirt size={18} strokeWidth={1.8} />, fx: "wave" },
  { label: "Panduan", href: "/#panduan", icon: <BookOpen size={18} strokeWidth={1.8} />, fx: "spin" },
  { label: "Jam Operasional", href: "/#jam-operasional", icon: <Clock3 size={18} strokeWidth={1.8} />, fx: "pop" },
  { label: "Cek Status", href: "/cek-status", icon: <PackageSearch size={18} strokeWidth={1.8} />, fx: "drop" },
  { label: "Pesan", href: "/pesan", icon: <ShoppingBag size={18} strokeWidth={1.8} />, fx: "pop" },
];

const mobileNavItems = [navItems[0], navItems[1], navItems[2], navItems[7]];
const mobileMoreItems = [navItems[3], navItems[4], navItems[5], navItems[6]];

export function Navbar() {
  const pathname = usePathname();
  const routeActive = pathname === "/pesan-satuan" ? 3 : pathname === "/pesan" ? 7 : pathname === "/cek-status" ? 6 : 0;
  const headerRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(routeActive);
  const [isPastHeader, setIsPastHeader] = useState(pathname !== "/");
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const isNavbarVisible = isPastHeader && !isFooterVisible;

  useEffect(() => {
    const header = headerRef.current;
    const footer = document.querySelector("footer");
    setIsPastHeader(pathname !== "/");
    setIsFooterVisible(false);

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === header) {
          setIsPastHeader(!entry.isIntersecting);
        } else if (entry.target === footer) {
          setIsFooterVisible(entry.isIntersecting);
        }
      }
    });
    if (pathname === "/" && header) observer.observe(header);
    if (footer) observer.observe(footer);

    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    setIsMoreOpen(false);
    const anchorIndex: Record<string, number> = {
      "#layanan": 1,
      "#tarif": 2,
      "#cuci-satuan": 3,
      "#panduan": 4,
      "#jam-operasional": 5,
    };
    setActive(anchorIndex[window.location.hash] ?? routeActive);
  }, [pathname, routeActive]);

  useEffect(() => {
    const targets = pathname === "/"
      ? [
          { id: "layanan", index: 1 },
          { id: "tarif", index: 2 },
          { id: "cuci-satuan", index: 3 },
          { id: "panduan", index: 4 },
          { id: "jam-operasional", index: 5 },
          { id: "cta", index: 7 },
        ]
      : pathname === "/cek-status"
        ? [{ id: "cek-status", index: 6 }]
        : [];

    if (targets.length === 0) return;

    let frame = 0;
    const updateActiveSection = () => {
      frame = 0;
      const activationLine = window.innerHeight * 0.35;
      let nextActive = pathname === "/cek-status" ? 6 : 0;

      for (const target of targets) {
        const element = document.getElementById(target.id);
        if (element && element.getBoundingClientRect().top <= activationLine) {
          nextActive = target.index;
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

  return (
    <>
    <header ref={headerRef} className="border-b border-soft bg-white/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3 text-brand-700">
          <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-700/20 ring-4 ring-brand-500/10 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
            <Shirt size={24} strokeWidth={2.1} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-2xl font-extrabold leading-none tracking-tight sm:text-[1.7rem]">Cuci.in</span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-muted sm:text-[11px]">Laundry jemput-antar</span>
          </span>
        </Link>
        <div className="hidden items-center gap-3 rounded-2xl border border-brand-500/10 bg-brand-500/5 px-4 py-2.5 sm:flex">
          <span className="grid size-9 place-items-center rounded-xl bg-white text-brand-600 shadow-sm">
            <Sparkles size={18} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-xs font-extrabold text-brand-700">Lebih praktis</span>
            <span className="mt-0.5 block text-[11px] font-medium text-muted">Bersih, wangi, tepat waktu</span>
          </span>
        </div>
      </div>
    </header>
    <div className="pointer-events-none fixed inset-x-0 bottom-12 z-50 flex justify-center px-3 sm:bottom-14 sm:px-6">
      <div
        aria-hidden={!isNavbarVisible}
        className={`w-full transition-[opacity,transform,visibility] duration-500 ease-out motion-reduce:transition-none ${
          isNavbarVisible
            ? "visible translate-y-0 opacity-100"
            : "invisible translate-y-8 opacity-0"
        }`}
      >
        <div className="hidden min-[1025px]:flex min-[1025px]:justify-center">
          <LiquidNavbar
            items={navItems}
            active={active}
            onChange={(index) => setActive(index)}
            compact={false}
            className={`pointer-events-auto mx-auto ${isNavbarVisible ? "" : "pointer-events-none"}`}
          />
        </div>
        <nav
          aria-label="Navigasi utama"
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsMoreOpen(false);
          }}
          className={`relative mx-auto w-full max-w-[26rem] rounded-2xl border border-white/80 bg-white/95 p-2 shadow-lg backdrop-blur-md min-[1025px]:hidden ${
            isNavbarVisible ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <div className="grid grid-cols-5 gap-1">
            {mobileNavItems.map((item) => {
              const index = navItems.indexOf(item);
              return (
                <a
                  key={item.label}
                  href={item.href}
                  aria-current={active === index ? "page" : undefined}
                  onClick={() => setActive(index)}
                  className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                    active === index ? "bg-brand-500/10 text-brand-700" : "text-muted hover:bg-soft/60 hover:text-brand-700"
                  }`}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span className="max-w-full truncate">{item.label}</span>
                </a>
              );
            })}
            <button
              type="button"
              aria-expanded={isMoreOpen}
              aria-controls="mobile-nav-more"
              aria-label={isMoreOpen ? "Tutup menu lainnya" : "Buka menu lainnya"}
              onClick={() => setIsMoreOpen((open) => !open)}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                isMoreOpen || mobileMoreItems.some((item) => navItems.indexOf(item) === active)
                  ? "bg-brand-500/10 text-brand-700"
                  : "text-muted hover:bg-soft/60 hover:text-brand-700"
              }`}
            >
              {isMoreOpen ? <X size={18} aria-hidden="true" /> : <MoreHorizontal size={18} aria-hidden="true" />}
              <span>Lainnya</span>
            </button>
          </div>
          <div
            id="mobile-nav-more"
            className={`absolute bottom-full right-2 mb-2 w-56 gap-1 rounded-2xl border border-soft bg-white p-2 shadow-xl ${
              isMoreOpen ? "grid" : "hidden"
            }`}
          >
            {mobileMoreItems.map((item) => {
              const index = navItems.indexOf(item);
              return (
                <a
                  key={item.label}
                  href={item.href}
                  aria-current={active === index ? "page" : undefined}
                  onClick={() => {
                    setActive(index);
                    setIsMoreOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                    active === index ? "bg-brand-500/10 text-brand-700" : "text-muted hover:bg-soft/60 hover:text-brand-700"
                  }`}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
    </>
  );
}
