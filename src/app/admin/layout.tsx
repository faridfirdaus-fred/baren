"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookmarkCheck,
  ExternalLink,
  FileText,
  Gamepad2,
  Globe,
  HelpCircle,
  Image,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Newspaper,
  Palette,
  PlaySquare,
  Share2,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { adminButtonClass } from "@/components/admin/button-styles";
import { adminSignOutAction } from "./account-actions";

/**
 * E5-6 & E18 — Kerangka panel admin.
 * - Sidebar terorganisir per kategori (Utama, Konten Landing, Komunitas, Pengaturan).
 * - Akses langsung ke Homepage biasa dari header sidebar & footer navigasi.
 * - Navigasi aktif ditandai secara visual dengan aksen ember.
 * - Layar kecil: drawer dialog (<md) dengan kontrol keyboard & sentuh (Escape, trap/scroll-lock).
 */

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
  }>;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    items: [{ href: "/admin", label: "Dasbor", icon: LayoutDashboard }],
  },
  {
    title: "Konten Landing",
    items: [
      { href: "/admin/landing", label: "Konten Landing", icon: FileText },
      { href: "/admin/hero", label: "Hero", icon: Sparkles },
      { href: "/admin/characters", label: "Jagoan", icon: Users },
      { href: "/admin/features", label: "Fitur", icon: Gamepad2 },
      { href: "/admin/how-to-play", label: "Cara Bermain", icon: PlaySquare },
      { href: "/admin/gallery", label: "Galeri", icon: Image },
      { href: "/admin/news", label: "Berita", icon: Newspaper },
      { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
      { href: "/admin/landing-cards", label: "Kartu Tambahan", icon: Layers },
    ],
  },
  {
    title: "Komunitas",
    items: [
      { href: "/admin/wishlist", label: "Wishlist", icon: BookmarkCheck },
      { href: "/admin/comments", label: "Komentar", icon: MessageSquare },
    ],
  },
  {
    title: "Pengaturan",
    items: [
      { href: "/admin/branding", label: "Branding", icon: Palette },
      { href: "/admin/links", label: "Tautan Sosial", icon: Share2 },
    ],
  },
];

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
    <div className="flex flex-col gap-4">
      {navGroups.map((group, groupIdx) => (
        <div key={group.title ?? `group-${groupIdx}`} className="flex flex-col">
          {group.title && (
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sand-600/70">
              {group.title}
            </div>
          )}
          <ul className="flex flex-col gap-0.5">
            {group.items.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeNav}
                    aria-current={isActive ? "page" : undefined}
                    className={`group flex min-h-11 items-center gap-3 px-3.5 py-2.5 text-xs font-bold uppercase tracking-[0.08em] rounded-xl transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f59e0b] ${
                      isActive
                        ? "bg-[#f59e0b] text-[#2f180a] shadow-md font-black"
                        : "text-[#faf6ee]/80 hover:bg-white/10 hover:text-[#faf6ee]"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-[#2f180a]"
                          : "text-[#8c7b6d] group-hover:text-[#faf6ee]"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );

  const navFooterActions = (
    <div className="flex flex-col gap-2">
      <Link
        href="/"
        onClick={closeNav}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex min-h-11 items-center justify-between border border-line bg-ink-900/60 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-sand transition-colors hover:border-ember hover:bg-ink-700 hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
      >
        <span className="flex items-center gap-2.5">
          <Globe className="h-4 w-4 text-ember" aria-hidden="true" />
          <span>Lihat Situs</span>
        </span>
        <ExternalLink
          className="h-3.5 w-3.5 text-sand-600 transition-colors group-hover:text-ember"
          aria-hidden="true"
        />
      </Link>
      <form action={adminSignOutAction}>
        <button
          type="submit"
          className="group flex min-h-11 w-full items-center gap-2.5 border border-transparent px-3.5 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-sand-600 transition-colors hover:bg-ember/10 hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          <LogOut
            className="h-4 w-4 text-sand-600 transition-colors group-hover:text-ember"
            aria-hidden="true"
          />
          <span>Keluar</span>
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-[#faf6ee] text-[#2f180a] md:flex-row">
      <a
        href="#konten-admin"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-none focus:bg-[#2f180a] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-2 focus:outline-offset-2 focus:outline-[#f59e0b]"
      >
        Lewati ke konten admin
      </a>

      {/* Topbar seluler */}
      <header className="flex h-16 items-center justify-between gap-4 border-b border-[#422310] bg-[#2f180a] px-4 md:hidden text-white">
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setNavOpen((v) => !v)}
          aria-expanded={navOpen}
          aria-controls="navigasi-admin-drawer"
          className="text-[#faf6ee] p-2 hover:bg-white/10 rounded-xl"
        >
          <span className="sr-only">
            {navOpen ? "Tutup menu navigasi admin" : "Buka menu navigasi admin"}
          </span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        <span className="font-black text-lg uppercase tracking-wider text-[#faf6ee]">
          BAREN PANEL ADMIN
        </span>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title="Buka Website Utama"
          aria-label="Buka Website Utama"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#f59e0b] hover:bg-white/20"
        >
          <Globe className="h-5 w-5" aria-hidden="true" />
        </Link>
      </header>

      {/* Sidebar desktop — menempel saat halaman digulir, nav bergulir sendiri */}
      <aside
        id="navigasi-admin"
        aria-label="Navigasi admin"
        className="hidden w-64 shrink-0 flex-col border-r border-[#422310] bg-[#2f180a] text-white md:sticky md:top-0 md:flex md:h-dvh md:self-start"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#422310] px-5">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-black text-lg uppercase tracking-wider text-[#f59e0b] hover:text-white transition-colors"
          >
            <span>● BAREN</span>
            <span className="text-[10px] text-white/60 font-bold tracking-normal">
              PANEL
            </span>
          </Link>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Lihat Website Utama (Buka di Tab Baru)"
            aria-label="Lihat Website Utama"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-[#f59e0b] hover:bg-white/20 transition-colors"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <nav
          aria-label="Menu admin desktop"
          className="admin-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-3"
        >
          {navItems}
        </nav>
        <div className="shrink-0 border-t border-ink-700 p-3">
          {navFooterActions}
        </div>
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
            className="relative flex w-full max-w-xs flex-1 flex-col bg-ink-800 shadow-xl focus:outline-none"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink-700 px-5">
              <span className="font-display text-lg uppercase tracking-wider text-sand">
                Admin BAREN
              </span>
              <button
                type="button"
                onClick={closeNav}
                className={adminButtonClass("ghost", "icon")}
              >
                <span className="sr-only">Tutup menu admin</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <nav
              aria-label="Menu admin seluler"
              className="admin-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-3"
            >
              {navItems}
            </nav>
            <div className="shrink-0 border-t border-ink-700 p-3">
              {navFooterActions}
            </div>
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
