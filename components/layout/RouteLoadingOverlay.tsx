"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Shirt } from "@/lib/icons";

export function RouteLoadingOverlay() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (previousPath.current !== pathname) {
      previousPath.current = pathname;
      setLoading(false);
      if (timeout.current) clearTimeout(timeout.current);
    }
  }, [pathname]);

  useEffect(() => {
    function handleNavigation(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;

      setLoading(true);
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setLoading(false), 1800);
    }

    document.addEventListener("click", handleNavigation, true);
    return () => {
      document.removeEventListener("click", handleNavigation, true);
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  if (!loading) return null;

  return (
    <div role="status" aria-live="polite" aria-label="Memuat halaman" className="fixed inset-0 z-[100] flex items-center justify-center bg-page/95 backdrop-blur-md animate-[routeFadeIn_180ms_ease-out]">
      <div className="flex flex-col items-center">
        <span className="relative flex h-[76px] w-[76px] items-center justify-center rounded-[24px] bg-brand-600 text-white shadow-xl shadow-brand-700/20">
          <span className="absolute -inset-2 rounded-[30px] border border-brand-500/35 animate-ping [animation-duration:1.6s]" />
          <Shirt size={35} strokeWidth={1.8} className="relative animate-pulse" />
        </span>
        <span className="mt-4 text-lg font-bold tracking-tight text-ink">Cuci.in</span>
        <span className="mt-1 text-sm text-muted">Sebentar, ya…</span>
      </div>
    </div>
  );
}
