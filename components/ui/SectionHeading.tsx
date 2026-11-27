"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// IntersectionObserver mengikuti posisi aktual setelah konten dinamis selesai dimuat.
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const heading = headingRef.current;
    if (!container || !heading || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const words = heading.querySelectorAll<HTMLElement>("[data-heading-word]");
    let observer: IntersectionObserver | undefined;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ paused: true });

      const eyebrowElement = container.querySelector<HTMLElement>("[data-heading-eyebrow]");
      const subtitleElement = container.querySelector<HTMLElement>("[data-heading-subtitle]");

      if (eyebrowElement) {
        const style = window.getComputedStyle(eyebrowElement);
        const weight = Number.parseInt(style.fontWeight, 10) || 600;
        timeline.fromTo(
          eyebrowElement,
          { autoAlpha: 0, y: 3, fontWeight: Math.max(400, weight - 100) },
          { autoAlpha: 1, y: 0, fontWeight: Math.min(800, weight + 100), duration: 0.24, ease: "power2.out" },
          0,
        );
      }

      const headingStyle = window.getComputedStyle(heading);
      const headingWeight = Number.parseInt(headingStyle.fontWeight, 10) || 700;
      timeline.fromTo(
        words,
        { autoAlpha: 0, y: 5, fontWeight: Math.max(600, headingWeight - 100) },
        { autoAlpha: 1, y: 0, fontWeight: Math.min(800, headingWeight + 100), duration: 0.28, stagger: 0.018, ease: "power2.out" },
        eyebrowElement ? 0.04 : 0,
      );

      if (subtitleElement) {
        const style = window.getComputedStyle(subtitleElement);
        const weight = Number.parseInt(style.fontWeight, 10) || 400;
        timeline.fromTo(
          subtitleElement,
          { autoAlpha: 0, y: 3, fontWeight: Math.max(400, weight - 100) },
          { autoAlpha: 1, y: 0, fontWeight: Math.min(700, weight + 100), duration: 0.24, ease: "power2.out" },
          0.03,
        );
      }

      if ("IntersectionObserver" in window) {
        observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return;
            timeline.play(0);
            observer?.disconnect();
          },
          { rootMargin: "0px", threshold: 0.01 },
        );
        observer.observe(container);
      }

      timeline.play(0);
    }, container);

    return () => {
      observer?.disconnect();
      context.revert();
    };
  }, [title]);

  return (
    <div ref={containerRef} className="mx-auto mb-12 max-w-2xl text-center">
      {eyebrow && (
        <p data-heading-eyebrow className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-500 motion-safe:translate-y-2 motion-safe:opacity-0">
          {eyebrow}
        </p>
      )}
      <h2 ref={headingRef} aria-label={title} className="text-3xl font-bold text-ink sm:text-4xl">
        {title.split(/\s+/).map((word, index) => (
          <span
            key={`${word}-${index}`}
            data-heading-word
            aria-hidden="true"
            className="mr-[0.22em] inline-block last:mr-0 motion-safe:translate-y-3 motion-safe:opacity-0"
          >
            {word}
          </span>
        ))}
      </h2>
      {subtitle && <p data-heading-subtitle className="mt-3 text-muted motion-safe:translate-y-2 motion-safe:opacity-0">{subtitle}</p>}
    </div>
  );
}
