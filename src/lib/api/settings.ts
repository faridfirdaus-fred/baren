// E3-2: logika baca/tulis settings di atas tabel key/value `site_settings`.
// Menerima store via injeksi (mudah dimock di test; route mengadaptasi Drizzle).
// Tanpa impor runtime (hanya `import type`) agar teruji via node:test.

import type { SettingsUpdate } from "../validation/settings";

export type SettingsRow = { key: string; value: string | null };

/** Antarmuka minimal yang dibutuhkan dari lapisan DB. */
export type SettingsStore = {
  list(): Promise<SettingsRow[]>;
  upsert(key: string, value: string | null): Promise<void>;
};

export type SettingsBranding = {
  namaGame: string | null;
  tagline: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  emailKontak: string | null;
};

/** Petakan kolom JSON camelCase ke key DB snake_case (SRS §3.5). */
const KEY_OF = {
  namaGame: "nama_game",
  tagline: "tagline",
  logoUrl: "logo_url",
  faviconUrl: "favicon_url",
  emailKontak: "email_kontak",
} as const;

type BrandingKey = keyof typeof KEY_OF;

const ORDER: BrandingKey[] = [
  "namaGame",
  "tagline",
  "logoUrl",
  "faviconUrl",
  "emailKontak",
];

/** Ubah baris key/value menjadi objek branding; key asing diabaikan. */
export function toBranding(rows: SettingsRow[]): SettingsBranding {
  const byKey = new Map(rows.map((r) => [r.key, r.value]));
  return {
    namaGame: byKey.get(KEY_OF.namaGame) ?? null,
    tagline: byKey.get(KEY_OF.tagline) ?? null,
    logoUrl: byKey.get(KEY_OF.logoUrl) ?? null,
    faviconUrl: byKey.get(KEY_OF.faviconUrl) ?? null,
    emailKontak: byKey.get(KEY_OF.emailKontak) ?? null,
  };
}

/** GET publik: seluruh branding, kolom hilang menjadi null. */
export async function readSettings(
  store: SettingsStore,
): Promise<SettingsBranding> {
  return toBranding(await store.list());
}

/**
 * PUT admin: upsert hanya kolom yang diberikan (undefined dilewati,
 * null mengosongkan), lalu baca ulang hasilnya.
 */
export async function writeSettings(
  store: SettingsStore,
  input: SettingsUpdate,
): Promise<SettingsBranding> {
  for (const field of ORDER) {
    const value = input[field];
    if (value !== undefined) {
      await store.upsert(KEY_OF[field], value);
    }
  }
  return readSettings(store);
}
