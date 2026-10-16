// E7-5 — Seksi kontak situs publik (Server Component).
// Surel kontak dibaca dari `site_settings` (`email_kontak`, E3-2) dan tautan
// media sosial dari tabel `social_links` (E3-8). DB gagal dibaca → fallback
// statis Indonesia agar seksi tidak pernah blank; DB berhasil tapi medsos
// kosong → hanya surel yang tampil beserta catatan menyusul. Tautan medsos
// adalah tautan keluar sehingga memakai `target="_blank"`
// `rel="noopener noreferrer"` (E7-6/EI-07); `mailto:` dan anchor internal
// tidak memakai atribut tab baru.

import { getDb } from "@/db";
import { siteSettings, socialLinks } from "@/db/schema";
import { toBranding } from "@/lib/api/settings";
import {
  readSocialLinks,
  type SocialRow,
} from "@/lib/api/links";
import { site, social as fallbackSocial } from "@/content/baren";
import {
  IconArrowUpRight,
  IconDiscord,
  IconInstagram,
  IconMail,
  IconTiktok,
  IconYoutube,
} from "./icon";
import { SectionShell } from "./section-shell";

export type ContactSocialItem = {
  platform: string;
  url: string;
};

export type ContactSectionProps = {
  /** Override dari integrator. `undefined` = baca DB di sini. */
  contactEmail?: string;
  socials?: ContactSocialItem[];
};

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isEmail(value: string | null): value is string {
  return !!value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function SocialIcon({
  platform,
  className = "h-5 w-5",
}: {
  platform: string;
  className?: string;
}) {
  const name = platform.toLowerCase();
  if (name.includes("instagram")) {
    return <IconInstagram className={className} />;
  }
  if (name.includes("youtube") || name.includes("youtu")) {
    return <IconYoutube className={className} />;
  }
  if (name.includes("discord")) {
    return <IconDiscord className={className} />;
  }
  if (name.includes("tiktok") || name.includes("tik tok")) {
    return <IconTiktok className={className} />;
  }
  return <IconArrowUpRight className={className} />;
}

/** Baca surel + medsos dari DB. Gagal → surel fallback dan medsos null. */
async function getContactFromDb(): Promise<{
  email: string;
  socials: ContactSocialItem[] | null;
}> {
  try {
    const db = getDb();
    const [settingRows, socialRows] = await Promise.all([
      db.select({ key: siteSettings.key, value: siteSettings.value }).from(siteSettings),
      db.select().from(socialLinks),
    ]);
    const branding = toBranding(
      settingRows.map((r) => ({ key: r.key, value: r.value })),
    );
    const email = isEmail(branding.emailKontak)
      ? branding.emailKontak
      : site.email;
    const lister = {
      list: async (): Promise<SocialRow[]> =>
        socialRows.map((r) => ({
          id: r.id,
          platform: r.platform,
          url: r.url,
          sortOrder: r.sortOrder,
        })),
    };
    const ordered = await readSocialLinks(lister);
    return {
      email,
      socials: ordered
        .filter((r) => isHttpsUrl(r.url))
        .map((r) => ({ platform: r.platform, url: r.url })),
    };
  } catch {
    return { email: site.email, socials: null };
  }
}

export async function ContactSection({
  contactEmail,
  socials,
}: ContactSectionProps) {
  const needsFetch = contactEmail === undefined || socials === undefined;
  const fetched = needsFetch ? await getContactFromDb() : null;

  const email =
    contactEmail ?? fetched?.email ?? site.email;
  const list: ContactSocialItem[] =
    socials ??
    fetched?.socials ??
    fallbackSocial
      .filter((s) => isHttpsUrl(s.href))
      .map((s) => ({ platform: s.label, url: s.href }));

  return (
    <SectionShell id="kontak" tone="light">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="min-w-0">
          <p className="eyebrow text-ember-700">Kontak</p>
          <h2 className="display-lg mt-4 text-ink">Hubungi Kami</h2>
          <p className="mt-4 max-w-xl leading-7 text-ink/75">
            Ada pertanyaan, masukan, atau kebutuhan kerja sama? Kirim surel ke
            alamat di bawah atau ikuti media sosial resmi Baren.
          </p>
          <p className="eyebrow mt-8 text-ink/60">Surel kontak</p>
          <a
            href={`mailto:${email}`}
            aria-label={`Kirim surel ke ${email}`}
            className="mt-3 inline-flex max-w-full items-center gap-2 break-words text-lg font-medium text-ember-700 transition-colors hover:text-ember-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            <IconMail className="h-5 w-5 shrink-0" aria-hidden="true" />
            {email}
          </a>
        </div>

        <nav aria-label="Media sosial Baren" className="min-w-0">
          <p className="eyebrow text-ink/60">Ikuti Baren</p>
          {list.length > 0 ? (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {list.map((item) => (
                <li key={`${item.platform}-${item.url}`} className="min-w-0">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${item.platform} Baren (membuka tab baru)`}
                    className="flex min-w-0 items-center gap-3 border border-ink/15 bg-sand px-4 py-3 text-ink transition-colors hover:border-ember-700 hover:text-ember-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center bg-ink text-sand"
                    >
                      <SocialIcon platform={item.platform} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold uppercase tracking-[0.08em]">
                      {item.platform}
                    </span>
                    <IconArrowUpRight
                      className="h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 leading-7 text-ink/75">
              Tautan media sosial resmi belum tersedia. Pantau kembali halaman
              ini.
            </p>
          )}
        </nav>
      </div>
    </SectionShell>
  );
}
