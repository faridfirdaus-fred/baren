"use client";

import { useEffect, useRef } from "react";

/**
 * E12-7 — Scroll-reveal animation hook (DG-07).
 * Menambahkan class `is-visible` saat elemen masuk viewport.
 * Animasi fade-in-up di globals.css respects prefers-reduced-motion.
 */
export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
