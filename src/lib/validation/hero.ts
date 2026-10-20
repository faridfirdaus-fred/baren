// E3-9: skema validasi Zod hero & banners (SRS FR-ADM-09/10/24/25).
// URL latar/CTA wajib https://; strict agar salah ketik terdeteksi.
// Impor runtime hanya `zod` agar teruji via node:test.

import { z } from "zod";

const URL_MAX = 2048;

function emptyToNull(v: unknown): unknown {
  return v === "" ? null : v;
}

function httpsUrl(label: string, max = URL_MAX) {
  return z.preprocess(
    emptyToNull,
    z
      .string()
      .trim()
      .max(max, `${label} maksimal ${max} karakter.`)
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

function httpsOrAnchorUrl(label: string, max = URL_MAX) {
  return z.preprocess(
    emptyToNull,
    z
      .string()
      .trim()
      .max(max, `${label} maksimal ${max} karakter.`)
      .refine((v) => {
        if (v.startsWith("#")) {
          return /^#[a-z0-9_-]+$/i.test(v);
        }
        try {
          return new URL(v).protocol === "https:";
        } catch {
          return false;
        }
      }, `${label} harus diawali https:// atau ID anchor valid (contoh: #wishlist).`)
      .nullable()
      .optional(),
  );
}

const ctaLabel = (label: string) =>
  z.preprocess(
    emptyToNull,
    z
      .string()
      .trim()
      .min(1, `${label} wajib diisi.`)
      .max(100, `${label} maksimal 100 karakter.`)
      .nullable()
      .optional(),
  );

export const heroUpdateSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Judul hero wajib diisi.")
      .max(200, "Judul hero maksimal 200 karakter."),
    subtitle: z.preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .max(300, "Subjudul maksimal 300 karakter.")
        .nullable()
        .optional(),
    ),
    backgroundUrl: httpsUrl("URL latar"),
    videoUrl: httpsUrl("URL video"),
    primaryCtaLabel: ctaLabel("Label CTA utama"),
    primaryCtaUrl: httpsOrAnchorUrl("URL CTA utama"),
    secondaryCtaLabel: ctaLabel("Label CTA kedua"),
    secondaryCtaUrl: httpsOrAnchorUrl("URL CTA kedua"),
    isPublished: z.boolean().optional(),
  })
  .strict();

export type HeroUpdate = z.infer<typeof heroUpdateSchema>;

export const bannerCreateSchema = z
  .object({
    imageUrl: z
      .string()
      .trim()
      .min(1, "URL gambar wajib diisi.")
      .max(URL_MAX, `URL gambar maksimal ${URL_MAX} karakter.`)
      .refine((v) => {
        try {
          return new URL(v).protocol === "https:";
        } catch {
          return false;
        }
      }, "URL gambar harus diawali https://."),
    sortOrder: z.number().int().min(0).max(100000).optional(),
  })
  .strict();

export type BannerCreate = z.infer<typeof bannerCreateSchema>;

export const bannerUpdateSchema = z
  .object({
    imageUrl: z
      .string()
      .trim()
      .min(1, "URL gambar wajib diisi.")
      .max(URL_MAX, `URL gambar maksimal ${URL_MAX} karakter.`)
      .refine((v) => {
        try {
          return new URL(v).protocol === "https:";
        } catch {
          return false;
        }
      }, "URL gambar harus diawali https://.")
      .optional(),
    sortOrder: z.number().int().min(0).max(100000).optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Minimal satu kolom harus diisi.");

export type BannerUpdate = z.infer<typeof bannerUpdateSchema>;
