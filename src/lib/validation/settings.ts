// E3-9: skema validasi Zod untuk endpoint settings (SRS FR-ADM-24/25).
// - Kolom opsional parsial (PUT menerima sebagian kolom), minimal satu kolom.
// - URL logo/favicon wajib https://, maks 2048 karakter; string kosong = null.
// - Email kontak format email (kosong = null); key tak dikenal DITOLAK
//   (strict) agar salah ketik terdeteksi, bukan dibuang diam-diam.
// Impor runtime hanya `zod` agar teruji via node:test.

import { z } from "zod";

const URL_MAX = 2048;

/** String kosong berarti mengosongkan kolom (konsisten semua kolom opsional). */
function emptyToNull(v: unknown): unknown {
  return v === "" ? null : v;
}

function httpsUrl(label: string) {
  return z.preprocess(
    emptyToNull,
    z
      .string()
      .trim()
      .max(URL_MAX, `${label} maksimal ${URL_MAX} karakter.`)
      .refine((v) => {
        try {
          return new URL(v).protocol === "https:";
        } catch {
          return false;
        }
      }, `${label} harus diawali https://.`)
      .nullable()
      .optional(),
  );
}

function requiredText(label: string, max: number) {
  return z
    .string()
    .trim()
    .min(1, `${label} wajib diisi.`)
    .max(max, `${label} maksimal ${max} karakter.`)
    .optional();
}

function optionalText(label: string, max: number) {
  return z.preprocess(
    emptyToNull,
    z
      .string()
      .trim()
      .max(max, `${label} maksimal ${max} karakter.`)
      .nullable()
      .optional(),
  );
}

export const settingsUpdateSchema = z
  .object({
    namaGame: z
      .string()
      .trim()
      .min(1, "Nama game wajib diisi.")
      .max(100, "Nama game maksimal 100 karakter.")
      .optional(),
    tagline: z.preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .max(200, "Tagline maksimal 200 karakter.")
        .nullable()
        .optional(),
    ),
    logoUrl: httpsUrl("URL logo"),
    faviconUrl: httpsUrl("URL favicon"),
    emailKontak: z.preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .max(320, "Email kontak maksimal 320 karakter.")
        .pipe(z.string().email("Masukkan alamat email yang valid."))
        .nullable()
        .optional(),
    ),
    featuresEyebrow: optionalText("Eyebrow fitur", 100),
    featuresTitle: requiredText("Judul fitur", 200),
    featuresEmptyMessage: optionalText("Pesan kosong fitur", 500),
    howToPlayTitle: requiredText("Judul cara bermain", 200),
    galleryEyebrow: optionalText("Eyebrow galeri", 100),
    galleryTitle: requiredText("Judul galeri", 200),
    galleryDescription: optionalText("Deskripsi galeri", 500),
    galleryEmptyTitle: optionalText("Judul kosong galeri", 200),
    galleryEmptyMessage: optionalText("Pesan kosong galeri", 500),
    newsTitle: requiredText("Judul artikel", 200),
    newsCtaLabel: requiredText("Label CTA artikel", 100),
    faqEyebrow: optionalText("Eyebrow FAQ", 100),
    faqTitle: requiredText("Judul FAQ", 200),
    commentsTitle: requiredText("Judul komentar", 200),
    commentsLoginPrompt: requiredText("Prompt login komentar", 500),
    commentsEmptyMessage: optionalText("Pesan kosong komentar", 500),
    commentsSubmitLabel: requiredText("Label kirim komentar", 100),
    commentsSubmitError: optionalText("Pesan gagal komentar", 500),
    contactEyebrow: optionalText("Eyebrow kontak", 100),
    contactTitle: requiredText("Judul kontak", 200),
    contactDescription: optionalText("Deskripsi kontak", 500),
    contactEmailLabel: requiredText("Label email kontak", 100),
    contactSocialTitle: requiredText("Judul sosial kontak", 200),
    contactSocialEmptyMessage: optionalText("Pesan sosial kosong", 500),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Minimal satu kolom harus diisi.");

export type SettingsUpdate = z.infer<typeof settingsUpdateSchema>;
