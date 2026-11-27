"use client";

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
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
      { href: "/admin/landing", label: "Judul Seksi", icon: FileText },
      { href: "/admin/hero", label: "Hero", icon: Sparkles },
      { href: "/admin/characters", label: "Jagoan", icon: Users },
      { href: "/admin/features", label: "Fitur", icon: Gamepad2 },
      { href: "/admin/how-to-play", label: "Cara Bermain", icon: PlaySquare },
      { href: "/admin/gallery", label: "Galeri", icon: Image },
      { href: "/admin/news", label: "Berita & Event", icon: Newspaper },
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
    <div className="flex flex-col gap-5">
      {navGroups.map((group, groupIdx) => (
        <div key={group.title ?? `group-${groupIdx}`} className="flex flex-col">
          {group.title && (
            <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
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
                    className={`group flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 ${
                      isActive
                        ? "bg-zinc-100 font-semibold text-zinc-950"
                        : "font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-zinc-900"
                          : "text-zinc-400 group-hover:text-zinc-700"
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
    <div className="flex flex-col gap-1.5">
      <Link
        href="/"
        onClick={closeNav}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex min-h-10 items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 px-3 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
      >
        <span className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-zinc-500" aria-hidden="true" />
          <span>Lihat Situs</span>
        </span>
        <ExternalLink
          className="h-3.5 w-3.5 text-zinc-400 transition-colors group-hover:text-zinc-700"
          aria-hidden="true"
        />
      </Link>
      <form action={adminSignOutAction}>
        <button
          type="submit"
          className="group flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        >
          <LogOut
            className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-red-600"
            aria-hidden="true"
          />
          <span>Keluar</span>
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-zinc-50/70 text-zinc-900 md:flex-row">
      <a
        href="#konten-admin"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-zinc-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-2 focus:outline-offset-2 focus:outline-zinc-900"
      >
        Lewati ke konten admin
      </a>

      {/* Topbar seluler */}
      <header className="flex h-14 items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4 md:hidden">
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setNavOpen((v) => !v)}
          aria-expanded={navOpen}
          aria-controls="navigasi-admin-drawer"
          className="rounded-lg p-2 text-zinc-700 hover:bg-zinc-100"
        >
          <span className="sr-only">
            {navOpen ? "Tutup menu navigasi admin" : "Buka menu navigasi admin"}
          </span>
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          <NextImage
            src="/brand/baren-mark.svg"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 rounded-md"
          />
          <span className="text-sm font-bold tracking-tight text-zinc-900">
            BAREN Admin
          </span>
        </div>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title="Buka Website Utama"
          aria-label="Buka Website Utama"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
        </Link>
      </header>

      {/* Sidebar desktop putih bersih */}
      <aside
        id="navigasi-admin"
        aria-label="Navigasi admin"
        className="hidden w-60 shrink-0 flex-col border-r border-zinc-200 bg-white md:sticky md:top-0 md:flex md:h-dvh md:self-start"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-100 px-4">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 text-sm font-bold tracking-tight text-zinc-900"
          >
            <NextImage
              src="/brand/baren-mark.svg"
              alt=""
              width={26}
              height={26}
              className="h-6.5 w-6.5 rounded-md"
            />
            <span>BAREN</span>
            <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500">
              Admin
            </span>
          </Link>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Lihat Website Utama"
            aria-label="Lihat Website Utama"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
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
        <div className="shrink-0 border-t border-zinc-100 p-3">
          {navFooterActions}
        </div>
      </aside>

      {/* Drawer seluler putih */}
      {navOpen && (
        <div
          id="navigasi-admin-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi admin"
          className="fixed inset-0 z-50 flex md:hidden"
        >
          <div
            className="fixed inset-0 bg-zinc-950/30 backdrop-blur-xs transition-opacity"
            onClick={closeNav}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            tabIndex={-1}
            className="relative flex w-full max-w-xs flex-1 flex-col bg-white shadow-xl focus:outline-none"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-100 px-4">
              <div className="flex items-center gap-2">
                <NextImage
                  src="/brand/baren-mark.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-md"
                />
                <span className="text-sm font-bold text-zinc-900">
                  BAREN Admin
                </span>
              </div>
              <button
                type="button"
                onClick={closeNav}
                className={adminButtonClass("ghost", "icon-sm")}
              >
                <span className="sr-only">Tutup menu admin</span>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <nav
              aria-label="Menu admin seluler"
              className="admin-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-3"
            >
              {navItems}
            </nav>
            <div className="shrink-0 border-t border-zinc-100 p-3">
              {navFooterActions}
            </div>
          </div>
        </div>
      )}

      {/* Area konten */}
      <main
        id="konten-admin"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-6xl min-w-0 flex-1 flex-col p-5 outline-none sm:p-7 lg:p-8"
      >
        {children}
      </main>
    </div>
  );
}
