"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * E5-6 — Kerangka panel admin (milik Fondasi; isi milik CMS/E8).
 * - Sidebar + topbar + main; layar kecil: sidebar menjadi drawer dialog
 *   (<md) yang dapat dinavigasi keyboard/sentuh (target ≥44px, Escape,
 *   fokus kembali, scroll-lock).
 * - Tautan Keluar tersedia setelah E2 masuk (guard + sesi milik E2-4);
 *   layout ini tidak membuat halaman admin publik dan tidak mengunci rute.
 * - Boundary: CMS (E8) mengisi <main>; Fondasi hanya shell + navigasi dasar.
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

  const navItems = (
    <ul className="flex flex-col gap-1">
      <li>
        <Link
          href="/admin"
          onClick={closeNav}
          aria-current={pathname === "/admin" ? "page" : undefined}
          className="flex min-h-11 items-center rounded-none px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-sand transition-colors hover:bg-ink-700 hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          Dasbor
        </Link>
      </li>
      <li>
        <Link
          href="/admin/faq"
          onClick={closeNav}
          aria-current={pathname === "/admin/faq" ? "page" : undefined}
          className="flex min-h-11 items-center rounded-none px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-sand transition-colors hover:bg-ink-700 hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          FAQ
        </Link>
      </li>
      <li>
        <Link
          href="/admin/links"
          onClick={closeNav}
          aria-current={pathname === "/admin/links" ? "page" : undefined}
          className="flex min-h-11 items-center rounded-none px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-sand transition-colors hover:bg-ink-700 hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          Tautan & Kontak
        </Link>
      </li>
      <li>
        <Link
          href="/admin/gallery"
          onClick={closeNav}
          aria-current={pathname === "/admin/gallery" ? "page" : undefined}
          className="flex min-h-11 items-center rounded-none px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-sand transition-colors hover:bg-ink-700 hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          Galeri
        </Link>
      </li>
      <li>
        <Link
          href="/admin/wishlist"
          onClick={closeNav}
          aria-current={pathname === "/admin/wishlist" ? "page" : undefined}
          className="flex min-h-11 items-center rounded-none px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-sand transition-colors hover:bg-ink-700 hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          Wishlist
        </Link>
      </li>
      <li>
        <Link
          href="/"
          onClick={closeNav}
          className="flex min-h-11 items-center rounded-none px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-sand/75 transition-colors hover:bg-ink-700 hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          Lihat Situs
        </Link>
      </li>
      <li>
        {/* E2-1..4 akan mengganti dengan aksi keluar sesi sungguhan. */}
        <button
          type="button"
          disabled
          title="Tautan keluar aktif setelah autentikasi E2 masuk"
          className="flex min-h-11 w-full cursor-not-allowed items-center rounded-none px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.08em] text-sand/40 disabled:opacity-60"
        >
          Keluar (menyusul E2)
        </button>
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
          aria-controls="navigasi-admin"
          aria-label={navOpen ? "Tutup navigasi admin" : "Buka navigasi admin"}
          className="flex h-11 w-11 items-center justify-center rounded-none text-sand transition-colors hover:bg-ink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          {navOpen ? (
            <span aria-hidden="true" className="text-xl leading-none">
              ×
            </span>
          ) : (
            <span aria-hidden="true" className="text-xl leading-none">
              ☰
            </span>
          )}
        </button>
        <p className="truncate font-display text-lg uppercase tracking-wide">
          BAREN Admin
        </p>
        <span className="w-11" aria-hidden="true" />
      </header>

      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-700 bg-ink-800 md:flex">
        <p className="px-4 pb-2 pt-6 font-display text-xl uppercase tracking-wide">
          BAREN Admin
        </p>
        <p className="eyebrow px-4 text-sand/50">Panel Admin</p>
        <nav aria-label="Navigasi admin" className="mt-4 flex-1 px-2">
          {navItems}
        </nav>
        <p className="px-4 py-6 text-xs leading-5 text-sand/50">
          Guard rute dan sesi milik E2-4. Modul konten milik CMS (E8).
        </p>
      </aside>

      {/* Drawer seluler */}
      {navOpen && (
        <div
          ref={drawerRef}
          id="navigasi-admin"
          role="dialog"
          aria-modal="true"
          aria-label="Navigasi admin"
          tabIndex={-1}
          className="fixed inset-y-0 left-0 z-50 flex max-h-dvh w-72 max-w-[85vw] flex-col overflow-y-auto bg-ink-800 focus:outline-none md:hidden"
        >
          <div className="flex h-16 items-center justify-between border-b border-ink-700 px-4">
            <p className="font-display text-lg uppercase">BAREN Admin</p>
            <button
              type="button"
              onClick={closeNav}
              aria-label="Tutup navigasi admin"
              className="flex h-11 w-11 items-center justify-center rounded-none text-sand hover:bg-ink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              <span aria-hidden="true" className="text-xl leading-none">
                ×
              </span>
            </button>
          </div>
          <nav aria-label="Navigasi admin" className="flex-1 px-2 py-4">
            {navItems}
          </nav>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden items-center justify-between gap-4 border-b border-ink-700 bg-ink px-6 py-4 md:flex">
          <p className="eyebrow text-sand/50">Panel Admin</p>
          <p className="text-sm text-sand/60">
            Pengaturan akun dan keluar menyusul E2
          </p>
        </header>
        <main
          id="konten-admin"
          tabIndex={-1}
          className="min-w-0 flex-1 px-4 py-8 focus:outline-none md:px-6"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
