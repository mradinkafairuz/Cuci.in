"use client";

import { useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { MotionConfig } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ReactLenis
        root
        options={{
          autoRaf: false,
          anchors: true,
          lerp: 0.1,
          respectReducedMotion: true,
        }}
      >
        <LenisGsapSync />
        {children}
      </ReactLenis>
    </MotionConfig>
  );
}

function LenisGsapSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const syncScrollTrigger = () => ScrollTrigger.update();
    const updateLenis = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", syncScrollTrigger);
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", syncScrollTrigger);
      gsap.ticker.remove(updateLenis);
    };
  }, [lenis]);

  return null;
}
