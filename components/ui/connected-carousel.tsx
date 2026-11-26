"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const pauseControlRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [width, setWidth] = useState(1000);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const total = items.length;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

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

  const activeWidth = Math.min(762, Math.max(290, width - 40));
  const sideWidth = width < 768 ? 56 : 112;
  const stageHeight = width < 768 ? 485 : 430;

  if (!total) return null;

  return (
    <div
      ref={containerRef}
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
      className={cn("relative mx-auto flex w-full flex-col items-center overflow-hidden py-3 outline-none", className)}
      {...props}
    >
      <div className="relative flex w-full items-center justify-center" style={{ height: stageHeight }}>
        {items.map((item, index) => {
          const rawOffset = (index - activeIndex + total) % total;
          const offset = rawOffset > total / 2 ? rawOffset - total : rawOffset;
          const active = offset === 0;
          const visible = Math.abs(offset) <= 1;
          const cardWidth = active ? activeWidth : sideWidth;
          const x = active ? 0 : offset * (activeWidth / 2 + sideWidth / 2 - 22);
          return (
            <div
              key={item.id}
              data-offset={offset}
              onClick={() => !active && select(index)}
              aria-hidden={!visible}
              className={cn(
                "absolute left-1/2 top-1/2 overflow-hidden rounded-[28px] bg-white text-ink shadow-[0_16px_45px_rgba(31,58,68,0.16)] transition-[transform,opacity,width,height] duration-700 ease-[cubic-bezier(.22,1,.36,1)]",
                active ? "z-20" : "z-10 cursor-pointer",
                !visible && "pointer-events-none"
              )}
              style={{
                width: cardWidth,
                height: active ? stageHeight - 22 : Math.min(345, stageHeight - 90),
                opacity: active ? 1 : visible ? 0.82 : 0,
                transform: `translate(calc(-50% + ${x}px), -50%) scale(${active ? 1 : 0.92})`,
              }}
            >
              {active ? (
                <div className="flex h-full flex-col lg:flex-row">
                  <div className="flex min-w-0 flex-1 flex-col justify-between p-5 text-center sm:p-7 lg:text-left">
                    <div>
                      <span className="text-sm tracking-[0.18em] text-amber-500" aria-label="Rating pelanggan">★★★★★</span>
                      <h3 className="mt-3 text-xl font-bold leading-tight text-ink sm:text-2xl">{item.stat}</h3>
                    </div>
                    <p className="my-3 font-serif text-sm leading-relaxed text-muted sm:text-base">“{item.quote}”</p>
                    <div className="flex items-center justify-center gap-3 lg:justify-start">
                      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-sm">
                        <Image src={item.defaultImage} alt={`Foto profil ${item.author}`} fill unoptimized sizes="44px" draggable={false} className="object-cover" />
                      </span>
                      <span className="min-w-0 text-left">
                        <span className="block truncate text-sm font-semibold text-ink">{item.author}</span>
                        <span className="mt-0.5 block text-xs text-muted">{item.role}</span>
                      </span>
                    </div>
                  </div>
                  <div className="relative mx-4 mb-4 min-h-0 flex-1 overflow-hidden rounded-2xl bg-soft sm:mx-6 sm:mb-6 lg:mx-0 lg:my-5 lg:mr-5 lg:w-[42%] lg:flex-none">
                    <Image src={item.selectedImage} alt={item.sceneAlt || "Suasana laundry"} fill unoptimized sizes="(max-width: 768px) 90vw, 330px" draggable={false} className="object-cover" />
                  </div>
                </div>
              ) : (
                <div className="relative h-full w-full bg-soft">
                  <Image src={item.defaultImage} alt={item.alt || "Suasana laundry"} fill unoptimized sizes="120px" draggable={false} className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                  <span className="absolute inset-x-1 bottom-3 truncate text-center text-[10px] font-semibold text-white">{item.author}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div role="tablist" aria-label="Pilih ulasan" className="mt-3 flex items-center gap-2">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={`Ulasan ${index + 1}: ${item.author}`}
            onClick={() => select(index)}
            className={cn("relative h-2 overflow-hidden rounded-full transition-all", index === activeIndex ? "w-16 bg-brand-300" : "w-2 bg-brand-300/50 hover:bg-brand-300")}
          >
            {index === activeIndex && <span className="absolute inset-y-0 left-0 rounded-full bg-brand-600" style={{ width: `${progress}%` }} />}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">Pilih titik, klik kartu samping, atau geser untuk melihat ulasan lain.</p>
      {prefersReducedMotion ? (
        <p className="mt-3 text-xs text-muted">Putar otomatis nonaktif mengikuti preferensi gerakan perangkat.</p>
      ) : (
        <button
          ref={pauseControlRef}
          type="button"
          aria-pressed={isPaused}
          onClick={() => setIsPaused((paused) => !paused)}
          className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
        >
          {isPaused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
          {isPaused ? "Lanjutkan putar otomatis" : "Jeda putar otomatis"}
        </button>
      )}
    </div>
  );
}
