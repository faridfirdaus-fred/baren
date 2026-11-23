import Link from "next/link";

import { legalLinks, nav, site } from "@/content/baren";
import { externalLinkProps } from "@/lib/external-link";
import type { SocialItemResolved } from "@/lib/links-content";
import { BrandLogo } from "./brand-logo";
import { BatikDivider } from "./batik-divider";
import {
  IconDiscord,
  IconGlobe,
  IconInstagram,
  IconMail,
  IconTiktok,
  IconYoutube,
} from "./icon";

export type SiteFooterProps = {
  brandName?: string;
  brandDescription?: string;
  contactEmail?: string;
  logoSrc?: string;
  socialLinks?: SocialItemResolved[] | null;
};

export function SiteFooter({
  brandName = site.name,
  brandDescription = site.description,
  contactEmail = site.email,
  logoSrc = "/brand/baren-mark.svg",
  socialLinks,
}: SiteFooterProps) {
  const icons = {
    instagram: IconInstagram,
    youtube: IconYoutube,
    discord: IconDiscord,
    tiktok: IconTiktok,
    other: IconGlobe,
  };

  const listSocial = socialLinks && socialLinks.length > 0 ? socialLinks : [];

  return (
    <footer className="relative overflow-x-clip bg-[#2f180a] text-[#faf6ee]">
      {/* Pita Ornamen Batik Pemisah Atas */}
      <BatikDivider />

      <div className="container-baren py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <BrandLogo src={logoSrc} size={42} />
              <span className="font-black text-2xl uppercase tracking-wider text-[#faf6ee]">
                {brandName}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#faf6ee]/75">
              {brandDescription}
            </p>
            {/* Social Icons */}
            <ul className="mt-6 flex flex-wrap items-center gap-3">
              {listSocial.map((s) => {
                const Icon = icons[s.icon] ?? IconGlobe;
                return (
                  <li key={s.label}>
                    <a
                      href={s.url}
                      {...externalLinkProps(s.url)}
                      aria-label={s.label}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c83820] text-white transition-transform hover:scale-110 hover:bg-[#a72d18] shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f59e0b]"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <nav aria-label="Navigasi bawah" className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wider text-[#f59e0b] mb-4">
              Jelajahi
            </p>
            <ul className="space-y-2.5">
              {nav
                .filter((n) => n.href.startsWith("#"))
                .map((n) => (
                  <li key={n.label}>
                    <a
                      href={n.href}
                      className="text-sm font-semibold text-[#faf6ee]/80 transition-colors hover:text-[#f59e0b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f59e0b]"
                    >
                      {n.label}
                    </a>
                  </li>
                ))}
            </ul>
          </nav>

          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wider text-[#f59e0b] mb-4">
              Kontak
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex max-w-full items-center gap-2 break-words text-sm font-medium text-[#faf6ee]/80 transition-colors hover:text-[#f59e0b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f59e0b]"
            >
              <IconMail
                className="h-4 w-4 shrink-0 text-[#f59e0b]"
                aria-hidden="true"
              />
              {contactEmail}
            </a>
          </div>
        </div>

        <div className="mt-14 border-t border-[#422310] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[#faf6ee]/60">
          <p>
            {"©"} 2026 {brandName}. Seluruh hak cipta dilindungi.
          </p>
          <p className="text-[#f59e0b] font-bold">
            Dibuat dengan semangat Nusantara 🇮🇩
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="hover:text-[#f59e0b] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f59e0b]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
