"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { cta, nav, site } from "@/content/baren";
import { BrandLogo } from "./brand-logo";
import { IconArrowUpRight, IconChevronDown, IconClose, IconMenu } from "./icon";

export type SiteHeaderProps = {
  /** E5-1 — Fallback branding Indonesia; E5-2 mengganti via site_settings. */
  brandName?: string;
  logoSrc?: string;
  /** E11-4 — Slot akun pengunjung (AccountMenu) dari jalur Publik.
      Integrator memasang child setelah kedua sisi merge; default tombol login. */
  accountSlot?: ReactNode;
};

/**
 * E5-1/E5-3/E5-4/E12-6 — Header publik.
 * - Fixed h-20, transparan di hero → solid saat scroll (>24px).
 * - Kontras kedua keadaan: teks sand (16:1 di ink), hover/fokus ember
 *   (5.08:1 di ink); hero memakai overlay gradien ink agar video tidak
 *   menurunkan kontras. Fokus global `:focus-visible` ember (≥3:1).
 * - Nav anchor ke ID seksi kontrak: #top, #berita, #tentang, #fitur,
 *   #pemain, #arena, #faq, #galeri (E6), #kontak (E7), #daftar.
 *   Offset sticky via `[id]{scroll-margin-top}` di globals.css;
 *   smooth scroll + prefers-reduced-motion di sana.
 * - Menu lipat <768px (md breakpoint): aria-expanded/controls, label
 *   Indonesia, Escape menutup, link menutup, scroll-lock saat terbuka,
 *   fokus kembali ke tombol pemicu. Menu solid bg-ink (tak tertutup hero).
 */
export function SiteHeader({
  brandName = site.name,
  logoSrc = "/brand/baren-mark.svg",
  accountSlot,
}: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // E5-4 — Escape menutup + scroll-lock + kembalikan fokus ke pemicu.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    // Fokus ke menu saat dibuka agar pengguna keyboard langsung di dalam nav.
    menuRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const linkCls =
    "flex items-center gap-1 px-3 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-sand transition-colors hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-20 transition-colors duration-300 ${scrolled || menuOpen ? "border-b border-ink-700 bg-ink/95 backdrop-blur" : "bg-transparent"}`}
    >
      <div className="container-baren flex h-full items-center justify-between gap-6 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <a
          href="#top"
          className="flex min-w-0 items-center gap-3 justify-self-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          aria-label={`${brandName} — kembali ke atas`}
        >
          <BrandLogo src={logoSrc} size={32} className="shrink-0" />
          <span className="truncate font-display text-xl uppercase tracking-wide text-sand">
            {brandName}
          </span>
        </a>
        <nav
          aria-label="Navigasi utama"
          className="hidden justify-self-center md:block"
        >
          <ul className="flex items-center gap-1">
            {nav.map((n) => (
              <li key={n.label}>
                <a
                  href={n.href}
                  className={linkCls}
                  target={n.external ? "_blank" : undefined}
                  rel={n.external ? "noopener noreferrer" : undefined}
                >
                  {n.label}
                  {n.external ? (
                    <IconArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  ) : n.hasMenu ? (
                    <IconChevronDown className="h-3 w-3" aria-hidden="true" />
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3 justify-self-end">
          {accountSlot ?? (
            <a
              href="#wishlist"
              className="hidden rounded-none bg-ember-700 px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-sand transition-colors hover:bg-ember-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember md:inline-flex"
            >
              {cta.login}
            </a>
          )}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="menu-seluler"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            className="flex h-10 w-10 items-center justify-center rounded-none text-sand transition-colors hover:bg-ink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember md:hidden"
          >
            {menuOpen ? (
              <IconClose className="h-6 w-6" aria-hidden="true" />
            ) : (
              <IconMenu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div
          ref={menuRef}
          id="menu-seluler"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          tabIndex={-1}
          className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-ink-700 bg-ink focus:outline-none md:hidden"
        >
          <div className="container-baren py-6">
            <ul className="flex flex-col gap-1">
              {nav.map((n) => (
                <li key={n.label}>
                  <a
                    href={n.href}
                    onClick={closeMenu}
                    target={n.external ? "_blank" : undefined}
                    rel={n.external ? "noopener noreferrer" : undefined}
                    className="block py-3 text-sm font-semibold uppercase tracking-[0.08em] text-sand transition-colors hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4" onClick={closeMenu}>
              {accountSlot ?? (
                <a
                  href="#wishlist"
                  className="inline-flex w-full items-center justify-center rounded-none bg-ember-700 px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-sand transition-colors hover:bg-ember-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                >
                  {cta.login}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
