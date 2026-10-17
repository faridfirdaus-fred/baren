"use client";

import type { ReactNode } from "react";

import { useScrollReveal } from "@/lib/use-scroll-reveal";

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * E12-7 — Client wrapper untuk scroll-reveal animation (DG-07).
 * Membungkus server component section agar bisa pakai Intersection Observer.
 */
export function ScrollRevealWrapper({ children, className = "" }: Props) {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <div ref={ref} className={`scroll-reveal ${className}`.trim()}>
      {children}
    </div>
  );
}
