"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/ui/useScrollReveal";

export function RevealCard({ children, className = "", delay = 0, reveal = true }: {
  children: ReactNode;
  className?: string;
  delay?: number;
  reveal?: boolean;
}) {
  const card = (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{
        y: { type: "spring", stiffness: 280, damping: 25 },
        scale: { type: "spring", stiffness: 320, damping: 24 },
      }}
      className="h-full"
    >
        <Card className={`h-full transition-[border-color,box-shadow] duration-300 hover:border-brand-300 hover:shadow-md ${className}`}>
          {children}
        </Card>
    </motion.div>
  );

  return reveal ? <ScrollReveal delay={delay} className="h-full">{card}</ScrollReveal> : card;
}
