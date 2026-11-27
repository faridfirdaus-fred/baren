"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";

import { cta, nav, site } from "@/content/baren";
import { BrandLogo } from "./brand-logo";
import { IconArrowUpRight, IconChevronDown, IconClose, IconMenu } from "./icon";

export type SiteHeaderProps = {
  brandName?: string;
  logoSrc?: string;
  accountSlot?: ReactNode;
};

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
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    menuRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-16 transition-all duration-200 sm:h-18 ${
        scrolled || menuOpen
          ? "border-b border-zinc-200/80 bg-white/95 shadow-xs backdrop-blur-md"
          : "border-b border-zinc-100 bg-white/85 backdrop-blur-md"
      }`}
    >
      <div className="container-baren flex h-full items-center justify-between gap-4 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Link
          href="/#top"
          className="flex min-w-0 items-center gap-2.5 justify-self-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
          aria-label={`${brandName} — kembali ke beranda`}
        >
          <BrandLogo src={logoSrc} size={30} className="shrink-0 rounded-lg" />
          <span className="truncate text-lg font-extrabold tracking-tight text-zinc-950">
            {brandName}
          </span>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden justify-self-center lg:block"
        >
          <ul className="flex items-center gap-0.5">
            {nav.map((n) => (
              <li key={n.label}>
                <Link
                  href={n.href}
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                  target={n.external ? "_blank" : undefined}
                  rel={n.external ? "noopener noreferrer" : undefined}
                >
                  {n.label}
                  {n.external ? (
                    <IconArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  ) : n.hasMenu ? (
                    <IconChevronDown className="h-3 w-3" aria-hidden="true" />
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2.5 justify-self-end">
          {accountSlot ?? (
            <Link
              href="/#wishlist"
              className="hidden rounded-full bg-[#c83820] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#a72d18] md:inline-flex"
            >
              {cta.joinWishlist}
            </Link>
          )}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="menu-seluler"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-700 transition-colors hover:bg-zinc-100 lg:hidden"
          >
            {menuOpen ? (
              <IconClose className="h-5 w-5" aria-hidden="true" />
            ) : (
              <IconMenu className="h-5 w-5" aria-hidden="true" />
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
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-zinc-200 bg-white focus:outline-none lg:hidden"
        >
          <div className="container-baren py-5">
            <ul className="flex flex-col gap-1">
              {nav.map((n) => (
                <li key={n.label}>
                  <Link
                    href={n.href}
                    onClick={closeMenu}
                    target={n.external ? "_blank" : undefined}
                    rel={n.external ? "noopener noreferrer" : undefined}
                    className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div
              className="mt-4 border-t border-zinc-100 pt-4"
              onClick={closeMenu}
            >
              {accountSlot ?? (
                <Link
                  href="/#wishlist"
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#c83820] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a72d18]"
                >
                  {cta.joinWishlist}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
