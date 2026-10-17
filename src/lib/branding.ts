// E5-2 — Branding dinamis situs publik (HANYA sisi server).
// Mengonsumsi kontrak E3-2/API (`site_settings`: nama_game, tagline,
// logo_url, favicon_url, email_kontak) langsung via Drizzle sesuai aturan
// peta "query lewat Drizzle/Neon Workers". Jangan diimpor komponen klien.
// Perubahan admin tayang ≤60 detik via `revalidate = 60` pada
// `src/app/(site)/layout.tsx` (sejalan E3-10). Selalu ada fallback
// Indonesia bila DB kosong/gagal (termasuk build tanpa env).

import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { toBranding } from "@/lib/api/settings";
import { isEmail } from "@/lib/validation/email";
import { site } from "@/content/baren";

export type SiteBranding = {
  brandName: string;
  tagline: string;
  logoSrc: string;
  faviconUrl: string;
  contactEmail: string;
};

const FALLBACK_BRANDING: SiteBranding = {
  brandName: site.name,
  tagline: site.tagline,
  logoSrc: "/brand/baren-mark.svg",
  faviconUrl: "/favicon.ico",
  contactEmail: site.email,
};

function isHttpsUrl(value: string | null): value is string {
  if (!value) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Baca branding dari `site_settings`. Tidak pernah melempar: gagal
 * (env hilang, DB mati) atau kolom kosong → fallback Indonesia.
 */
export async function getSiteBranding(): Promise<SiteBranding> {
  try {
    const db = getDb();
    const rows = await db
      .select({ key: siteSettings.key, value: siteSettings.value })
      .from(siteSettings);
    const branding = toBranding(
      rows.map((r) => ({ key: r.key, value: r.value })),
    );
    const namaGame = branding.namaGame?.trim();
    const tagline = branding.tagline?.trim();
    return {
      brandName: namaGame ? namaGame : FALLBACK_BRANDING.brandName,
      tagline: tagline ? tagline : FALLBACK_BRANDING.tagline,
      logoSrc: isHttpsUrl(branding.logoUrl)
        ? branding.logoUrl
        : FALLBACK_BRANDING.logoSrc,
      faviconUrl: isHttpsUrl(branding.faviconUrl)
        ? branding.faviconUrl
        : FALLBACK_BRANDING.faviconUrl,
      contactEmail: isEmail(branding.emailKontak)
        ? branding.emailKontak
        : FALLBACK_BRANDING.contactEmail,
    };
  } catch {
    return FALLBACK_BRANDING;
  }
}
