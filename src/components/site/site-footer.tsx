import { legalLinks, nav, site, social } from "@/content/baren";
import { BrandLogo } from "./brand-logo";
import {
  IconDiscord,
  IconInstagram,
  IconMail,
  IconTiktok,
  IconYoutube,
} from "./icon";

export type SiteFooterProps = {
  /** E5-1 — Fallback branding; E5-2 mengganti via site_settings. */
  brandName?: string;
  brandDescription?: string;
  contactEmail?: string;
  logoSrc?: string;
};

/**
 * E5-1 — Footer publik. Kontras: sand/75 (9.25:1), sand/60 (6.27:1),
 * sand/55 (5.43:1) di ink — semua ≥4.5:1 teks normal.
 */
export function SiteFooter({
  brandName = site.name,
  brandDescription = site.description,
  contactEmail = site.email,
  logoSrc = "/brand/baren-mark.svg",
}: SiteFooterProps) {
  const icons = {
    instagram: IconInstagram,
    youtube: IconYoutube,
    discord: IconDiscord,
    tiktok: IconTiktok,
  };

  return (
    <footer className="overflow-x-clip bg-ink text-sand">
      <div className="container-baren py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="min-w-0">
            <BrandLogo src={logoSrc} size={40} />
            <p className="mt-4 font-display text-2xl uppercase">{brandName}</p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-sand/60">
              {brandDescription}
            </p>
          </div>
          <nav aria-label="Navigasi bawah" className="min-w-0">
            <p className="eyebrow text-sand/50">Navigasi</p>
            <ul className="mt-4 space-y-2">
              {nav
                .filter((n) => n.href.startsWith("#"))
                .map((n) => (
                  <li key={n.label}>
                    <a
                      href={n.href}
                      className="text-sm text-sand/75 transition-colors hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                    >
                      {n.label}
                    </a>
                  </li>
                ))}
            </ul>
          </nav>
          <div className="min-w-0">
            <p className="eyebrow text-sand/50">Kontak</p>
            <a
              href={`mailto:${contactEmail}`}
              className="mt-4 inline-flex max-w-full items-center gap-2 break-words text-sm text-sand/75 transition-colors hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              <IconMail className="h-4 w-4 shrink-0" aria-hidden="true" />
              {contactEmail}
            </a>
          </div>
        </div>
        <ul className="mt-8 flex flex-wrap items-center gap-3">
          {social.map((s) => {
            const Icon = icons[s.icon];
            return (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-none bg-ink-700 text-sand transition-colors hover:bg-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ul>
        <div className="mt-12 border-t border-sand/15 pt-8">
          <p className="text-xs leading-6 text-sand/55">
            {"©"} 2026 {brandName}. Seluruh merek dagang adalah milik
            pemegangnya.
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="eyebrow text-sand/60 transition-colors hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
