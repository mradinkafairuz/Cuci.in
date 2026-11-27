"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Pause, Play } from "@/lib/icons";
import { cn } from "@/lib/utils/cn";

export interface CarouselItem {
  id: string | number;
  stat: string;
  quote: string;
  author: string;
  role: string;
  defaultImage: string;
  selectedImage: string;
  alt?: string;
  sceneAlt?: string;
}

export interface CalendlyCarouselProps extends HTMLAttributes<HTMLDivElement> {
  items: CarouselItem[];
  autoPlayInterval?: number;
  pauseOnHover?: boolean;
}

export function CalendlyCarousel({
  items,
  autoPlayInterval = 6000,
  pauseOnHover = true,
  className,
  ...props
}: CalendlyCarouselProps) {
  const pauseControlRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const total = items.length;

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPrefersReducedMotion(motionPreference.matches);
    updateMotionPreference();
    motionPreference.addEventListener("change", updateMotionPreference);
    return () => motionPreference.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    setProgress(0);
    if (!total || isPaused || isFocused || prefersReducedMotion || (pauseOnHover && isHovered)) return;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setProgress(Math.min((elapsed / autoPlayInterval) * 100, 100));
      if (elapsed >= autoPlayInterval) {
        window.clearInterval(timer);
        setActiveIndex((current) => (current + 1) % total);
      }
    }, 50);
    return () => window.clearInterval(timer);
  }, [activeIndex, autoPlayInterval, isFocused, isHovered, isPaused, pauseOnHover, prefersReducedMotion, total]);

  const move = useCallback((step: number) => {
    setProgress(0);
    setActiveIndex((current) => (current + step + total) % total);
  }, [total]);

  const select = useCallback((index: number) => {
    setProgress(0);
    setActiveIndex(index);
  }, []);

  if (!total) return null;
  const activeItem = items[activeIndex] ?? items[0];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Ulasan pelanggan Cuci.in"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") move(-1);
        if (event.key === "ArrowRight") move(1);
      }}
      onFocus={(event) => {
        if (!pauseControlRef.current?.contains(event.target as Node)) setIsFocused(true);
      }}
      onBlur={(event) => {
        const nextTarget = event.relatedTarget;
        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget) || pauseControlRef.current?.contains(nextTarget)) {
          setIsFocused(false);
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return;
        const touchEndX = event.changedTouches[0]?.clientX;
        if (touchEndX === undefined) return;
        const distance = touchEndX - touchStartX.current;
        if (distance && Math.abs(distance) > 45) move(distance < 0 ? 1 : -1);
        touchStartX.current = null;
      }}
      className={cn("relative mx-auto flex w-full flex-col items-center py-2 outline-none", className)}
      {...props}
    >
      <div className="relative flex w-full items-center justify-center md:px-16">
        <button
          type="button"
          aria-label="Ulasan sebelumnya"
          onClick={() => move(-1)}
          className="hidden md:grid absolute left-0 top-1/2 z-10 size-11 -translate-y-1/2 place-items-center rounded-full bg-white text-[#0079A8] shadow-md transition hover:scale-105 hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AEEF]"
        >
          <ArrowLeft size={19} aria-hidden="true" />
        </button>

        <div className="w-full max-w-2xl text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="flex min-h-[15.5rem] flex-col items-center justify-center px-1 sm:min-h-[14.5rem]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 44 32"
                className="h-8 w-11 text-[#00AEEF]"
                fill="currentColor"
              >
                <path d="M18.4 0C8.8 3.6 2.8 11.4 2.8 21.4c0 6.1 3.9 10.6 9.3 10.6 4.7 0 8.2-3.4 8.2-8.1 0-4.5-3.2-7.8-7.6-7.8-.9 0-1.9.2-2.6.5.8-4.5 4.2-8.7 9.5-11.2L18.4 0Zm22.8 0C31.6 3.6 25.6 11.4 25.6 21.4c0 6.1 3.9 10.6 9.3 10.6 4.7 0 8.2-3.4 8.2-8.1 0-4.5-3.2-7.8-7.6-7.8-.9 0-1.9.2-2.6.5.8-4.5 4.2-8.7 9.5-11.2L41.2 0Z" />
              </svg>

              <p className="mt-3 text-base tracking-[0.22em] text-[#C99700]" aria-label="Rating 5 dari 5 bintang">
                ★★★★★
              </p>

              <blockquote className="mt-4 text-xl font-semibold leading-relaxed text-[#181818] md:text-2xl">
                “{activeItem.quote}”
              </blockquote>

              <div className="mt-6 flex items-center justify-center gap-3.5">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-full ring-4 ring-white shadow-md sm:size-14">
                  <Image
                    src={activeItem.defaultImage}
                    alt={`Foto profil ${activeItem.author}`}
                    fill
                    sizes="56px"
                    draggable={false}
                    className="object-cover"
                  />
                </span>
                <div className="text-left">
                  <p className="text-base font-bold text-[#181818]">{activeItem.author}</p>
                  <p className="text-xs font-semibold text-[#536773] sm:text-sm">
                    {activeItem.role} · {activeItem.stat}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          aria-label="Ulasan berikutnya"
          onClick={() => move(1)}
          className="hidden md:grid absolute right-0 top-1/2 z-10 size-11 -translate-y-1/2 place-items-center rounded-full bg-white text-[#0079A8] shadow-md transition hover:scale-105 hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AEEF]"
        >
          <ArrowRight size={19} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-7 flex items-center justify-center gap-3">
        <button
          type="button"
          aria-label="Ulasan sebelumnya"
          onClick={() => move(-1)}
          className="grid size-10 place-items-center rounded-full bg-white text-[#0079A8] shadow-md transition hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AEEF] md:hidden"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <div role="tablist" aria-label="Pilih ulasan" className="flex items-center gap-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Ulasan ${index + 1}: ${item.author}`}
              onClick={() => select(index)}
              className={cn(
                "relative h-2 overflow-hidden rounded-full transition-all",
                index === activeIndex ? "w-14 bg-white/80" : "w-2 bg-white/60 hover:bg-white",
              )}
            >
              {index === activeIndex && <span className="absolute inset-y-0 left-0 rounded-full bg-[#00AEEF]" style={{ width: `${progress}%` }} />}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Ulasan berikutnya"
          onClick={() => move(1)}
          className="grid size-10 place-items-center rounded-full bg-white text-[#0079A8] shadow-md transition hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AEEF] md:hidden"
        >
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>

      {prefersReducedMotion ? (
        <p className="mt-3 text-xs font-medium text-[#536773]">Putar otomatis nonaktif mengikuti preferensi gerakan perangkat.</p>
      ) : (
        <button
          ref={pauseControlRef}
          type="button"
          aria-pressed={isPaused}
          onClick={() => setIsPaused((paused) => !paused)}
          className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-full bg-white/75 px-4 py-1.5 text-xs font-bold text-[#005B75] shadow-xs transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0079A8]"
        >
          {isPaused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          {isPaused ? "Lanjutkan putar otomatis" : "Jeda putar otomatis"}
        </button>
      )}
    </div>
  );
}
