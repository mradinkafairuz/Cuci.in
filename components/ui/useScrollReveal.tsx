"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Reveals an element as it enters the viewport, then reverses on scroll back. */
export function useScrollReveal<T extends HTMLElement>(delay = 0): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Jeda singkat menjaga urutan kiri ke kanan tanpa membuat kartu menunggu scroll jauh.
    const startDelay = Math.min(delay, 0.24);
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: "top 96%",
          toggleActions: "play none none reverse",
        },
      });

      timeline.fromTo(
        element,
        { autoAlpha: 0, x: -12, y: 14 },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          ease: "power2.out",
          duration: 0.42,
        },
        startDelay,
      );

      const textElements = Array.from(
        element.querySelectorAll<HTMLElement>("h1, h2, h3, h4, p, small, button, a, label, li, span"),
      ).filter((textElement) =>
        Array.from(textElement.childNodes).some(
          (node) => node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim()),
        ),
      );
      textElements.forEach((textElement, index) => {
        const weight = Number.parseInt(window.getComputedStyle(textElement).fontWeight, 10) || 400;
        timeline.fromTo(
          textElement,
          { fontWeight: Math.max(400, weight - 100) },
          {
            fontWeight: Math.min(weight + 100, weight < 600 ? 500 : 800),
            ease: "power1.out",
            duration: 0.3,
          },
          startDelay + 0.08 + Math.min(index, 8) * 0.018,
        );
      });
    }, element);

    return () => context.revert();
  }, [delay]);

  return ref;
}

export function ScrollReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useScrollReveal<HTMLDivElement>(delay);

  return (
    <div ref={ref} className={`motion-safe:translate-x-3 motion-safe:translate-y-3 motion-safe:opacity-0 ${className}`}>
      {children}
    </div>
  );
}
