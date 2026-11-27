import Link from "next/link";

import { legalLinks, nav, site } from "@/content/baren";
import { externalLinkProps } from "@/lib/external-link";
import type { SocialItemResolved } from "@/lib/links-content";
import { BrandLogo } from "./brand-logo";
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
    <footer
      id="kontak"
      className="border-t border-zinc-200 bg-zinc-50/70 text-zinc-700"
    >
      <div className="container-baren py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <BrandLogo src={logoSrc} size={34} className="rounded-lg" />
              <span className="text-xl font-extrabold tracking-tight text-zinc-950">
                {brandName}
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500">
              {brandDescription}
            </p>
            {listSocial.length > 0 && (
              <ul className="mt-5 flex flex-wrap items-center gap-2.5">
                {listSocial.map((s) => {
                  const Icon = icons[s.icon] ?? IconGlobe;
                  return (
                    <li key={s.label}>
                      <a
                        href={s.url}
                        {...externalLinkProps(s.url)}
                        aria-label={s.label}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-900 hover:text-white"
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <nav aria-label="Navigasi bawah" className="min-w-0">
            <p className="mb-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Jelajahi
            </p>
            <ul className="grid grid-cols-2 gap-2">
              {nav.map((n) => (
                <li key={n.label}>
                  <Link
                    href={n.href}
                    className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0">
            <p className="mb-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Kontak Resmi
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex max-w-full items-center gap-2 break-words text-sm font-medium text-zinc-700 transition-colors hover:text-[#c83820]"
            >
              <IconMail
                className="h-4 w-4 shrink-0 text-zinc-400"
                aria-hidden="true"
              />
              {contactEmail}
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-200/80 pt-6 text-xs text-zinc-500 sm:flex-row">
          <p>
            {"©"} 2026 {brandName}. Seluruh hak cipta dilindungi.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="transition-colors hover:text-zinc-900"
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
