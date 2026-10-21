"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminButtonClass } from "@/components/admin/button-styles";
import { adminSignOutAction } from "./account-actions";

/**
 * E5-6 — Kerangka panel admin (milik Fondasi; isi milik CMS/E8 & E14).
 * - Sidebar + topbar + main; layar kecil: sidebar menjadi drawer dialog
 *   (<md) yang dapat dinavigasi keyboard/sentuh (target ≥44px, Escape,
 *   fokus kembali, scroll-lock).
 * - Tautan Keluar tersedia setelah E2 masuk (guard + sesi milik E2-4).
 */
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNavOpen(false);
        toggleRef.current?.focus();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    drawerRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [navOpen]);

  const closeNav = () => setNavOpen(false);

  if (pathname === "/admin/login") return children;

  const navLinks = [
    { href: "/admin", label: "Dasbor" },
    { href: "/admin/landing", label: "Konten Landing" },
    { href: "/admin/hero", label: "Hero" },
    { href: "/admin/landing-cards", label: "Kartu Landing" },
    { href: "/admin/news", label: "Berita" },
    { href: "/admin/how-to-play", label: "Cara Bermain" },
    { href: "/admin/features", label: "Fitur" },
    { href: "/admin/branding", label: "Branding" },
    { href: "/admin/faq", label: "FAQ" },
    { href: "/admin/gallery", label: "Galeri" },
    { href: "/admin/links", label: "Tautan Sosial" },
    { href: "/admin/comments", label: "Komentar" },
    { href: "/admin/wishlist", label: "Wishlist" },
  ];

  const navItems = (
    <ul className="flex flex-col gap-1">
      {navLinks.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            onClick={closeNav}
            aria-current={pathname === link.href ? "page" : undefined}
            className="flex min-h-11 items-center rounded-none px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-sand transition-colors hover:bg-ink-700 hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            {link.label}
          </Link>
        </li>
      ))}
      <li className="mt-2 border-t border-ink-700 pt-2">
        <Link
          href="/"
          onClick={closeNav}
          className="flex min-h-11 items-center rounded-none px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-sand/75 transition-colors hover:bg-ink-700 hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          Lihat Situs
        </Link>
      </li>
      <li>
        <form action={adminSignOutAction}>
          <button
            type="submit"
            className="flex min-h-11 w-full items-center rounded-none px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.08em] text-sand/75 transition-colors hover:bg-ink-700 hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            Keluar
          </button>
        </form>
      </li>
    </ul>
  );

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-ink text-sand md:flex-row">
      <a
        href="#konten-admin"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-none focus:bg-sand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink focus:outline-2 focus:outline-offset-2 focus:outline-ember"
      >
        Lewati ke konten admin
      </a>

      {/* Topbar seluler */}
      <header className="flex h-16 items-center justify-between gap-4 border-b border-ink-700 bg-ink-800 px-4 md:hidden">
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setNavOpen((v) => !v)}
          aria-expanded={navOpen}
          aria-controls="navigasi-admin-drawer"
          className={adminButtonClass("ghost", "icon")}
        >
          <span className="sr-only">
            {navOpen ? "Tutup menu navigasi admin" : "Buka menu navigasi admin"}
          </span>
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <span className="font-display text-lg uppercase tracking-wider text-sand">
          Admin BAREN
        </span>
        <div className="w-11" aria-hidden="true" />
      </header>

      {/* Sidebar desktop — menempel saat halaman digulir, nav bergulir sendiri */}
      <aside
        id="navigasi-admin"
        aria-label="Navigasi admin"
        className="hidden w-64 shrink-0 flex-col border-r border-ink-700 bg-ink-800 md:sticky md:top-0 md:flex md:h-dvh md:self-start"
      >
        <div className="flex h-16 shrink-0 items-center border-b border-ink-700 px-6">
          <Link
            href="/admin"
            className="font-display text-xl uppercase tracking-wider text-sand hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            Admin BAREN
          </Link>
        </div>
        <nav
          aria-label="Menu admin desktop"
          className="admin-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
        >
          {navItems}
        </nav>
      </aside>

      {/* Drawer seluler */}
      {navOpen && (
        <div
          id="navigasi-admin-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi admin"
          className="fixed inset-0 z-50 flex md:hidden"
        >
          <div
            className="fixed inset-0 bg-ink/80 transition-opacity"
            onClick={closeNav}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            tabIndex={-1}
            className="relative flex w-full max-w-xs flex-1 flex-col bg-ink-800 p-4 shadow-xl focus:outline-none"
          >
            <div className="mb-4 flex items-center justify-between border-b border-ink-700 pb-4">
              <span className="font-display text-lg uppercase tracking-wider text-sand">
                Admin BAREN
              </span>
              <button
                type="button"
                onClick={closeNav}
                className={adminButtonClass("ghost", "icon")}
              >
                <span className="sr-only">Tutup menu admin</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <nav
              aria-label="Menu admin seluler"
              className="admin-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain"
            >
              {navItems}
            </nav>
          </div>
        </div>
      )}

      {/* Area konten */}
      <main
        id="konten-admin"
        tabIndex={-1}
        className="flex min-w-0 flex-1 flex-col p-6 outline-none md:p-8"
      >
        {children}
      </main>
    </div>
  );
}
