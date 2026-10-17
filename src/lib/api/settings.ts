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
  featuresEyebrow: string | null;
  featuresTitle: string | null;
  featuresEmptyMessage: string | null;
  howToPlayTitle: string | null;
  galleryEyebrow: string | null;
  galleryTitle: string | null;
  galleryDescription: string | null;
  galleryEmptyTitle: string | null;
  galleryEmptyMessage: string | null;
  newsTitle: string | null;
  newsCtaLabel: string | null;
  faqEyebrow: string | null;
  faqTitle: string | null;
  commentsTitle: string | null;
  commentsLoginPrompt: string | null;
  commentsEmptyMessage: string | null;
  commentsSubmitLabel: string | null;
  commentsSubmitError: string | null;
  contactEyebrow: string | null;
  contactTitle: string | null;
  contactDescription: string | null;
  contactEmailLabel: string | null;
  contactSocialTitle: string | null;
  contactSocialEmptyMessage: string | null;
};

export type LandingSettings = SettingsBranding;

const KEY_OF = {
  namaGame: "nama_game",
  tagline: "tagline",
  logoUrl: "logo_url",
  faviconUrl: "favicon_url",
  emailKontak: "email_kontak",
  featuresEyebrow: "features_eyebrow",
  featuresTitle: "features_title",
  featuresEmptyMessage: "features_empty_message",
  howToPlayTitle: "how_to_play_title",
  galleryEyebrow: "gallery_eyebrow",
  galleryTitle: "gallery_title",
  galleryDescription: "gallery_description",
  galleryEmptyTitle: "gallery_empty_title",
  galleryEmptyMessage: "gallery_empty_message",
  newsTitle: "news_title",
  newsCtaLabel: "news_cta_label",
  faqEyebrow: "faq_eyebrow",
  faqTitle: "faq_title",
  commentsTitle: "comments_title",
  commentsLoginPrompt: "comments_login_prompt",
  commentsEmptyMessage: "comments_empty_message",
  commentsSubmitLabel: "comments_submit_label",
  commentsSubmitError: "comments_submit_error",
  contactEyebrow: "contact_eyebrow",
  contactTitle: "contact_title",
  contactDescription: "contact_description",
  contactEmailLabel: "contact_email_label",
  contactSocialTitle: "contact_social_title",
  contactSocialEmptyMessage: "contact_social_empty_message",
} as const;

type SettingsKey = keyof typeof KEY_OF;

const ORDER: SettingsKey[] = Object.keys(KEY_OF) as SettingsKey[];

/** Ubah baris key/value menjadi objek branding; key asing diabaikan. */
export function toBranding(rows: SettingsRow[]): SettingsBranding {
  const byKey = new Map(rows.map((r) => [r.key, r.value]));
  return Object.fromEntries(
    ORDER.map((field) => [field, byKey.get(KEY_OF[field]) ?? null]),
  ) as SettingsBranding;
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
