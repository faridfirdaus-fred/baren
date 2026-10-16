// E3-9: skema validasi Zod berita (SRS FR-ADM-18/19/24/25).
// Slug unik format slug-case; status draf/terbit; URL sampul https.
// Strict anti-typo. Impor runtime hanya `zod`.

import { z } from "zod";

const URL_MAX = 2048;

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

export const newsStatuses = ["draft", "published"] as const;

export type NewsStatus = (typeof newsStatuses)[number];

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Slug wajib diisi.")
  .max(160, "Slug maksimal 160 karakter.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug hanya huruf kecil, angka, dan tanda hubung.",
  )
  // Slug murni angka dilarang agar tak ambigu dengan ID numerik pada rute [key].
  .refine((s) => !/^\d+$/.test(s), "Slug tidak boleh murni angka.");

const publishedAt = z.preprocess(
  emptyToNull,
  z.string().datetime("Format waktu tidak valid.").nullable().optional(),
);

export const newsCreateSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Judul berita wajib diisi.")
      .max(200, "Judul berita maksimal 200 karakter."),
    slug,
    excerpt: z.preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .max(500, "Ringkasaan maksimal 500 karakter.")
        .nullable()
        .optional(),
    ),
    body: z
      .string()
      .trim()
      .min(1, "Isi berita wajib diisi.")
      .max(20000, "Isi berita maksimal 20000 karakter."),
    coverUrl: httpsUrl("URL sampul"),
    status: z.enum(newsStatuses).optional(),
    publishedAt,
  })
  .strict();

export type NewsCreate = z.infer<typeof newsCreateSchema>;

export const newsUpdateSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Judul berita wajib diisi.")
      .max(200, "Judul berita maksimal 200 karakter.")
      .optional(),
    slug: slug.optional(),
    excerpt: z.preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .max(500, "Ringkasaan maksimal 500 karakter.")
        .nullable()
        .optional(),
    ),
    body: z
      .string()
      .trim()
      .min(1, "Isi berita wajib diisi.")
      .max(20000, "Isi berita maksimal 20000 karakter.")
      .optional(),
    coverUrl: httpsUrl("URL sampul"),
    status: z.enum(newsStatuses).optional(),
    publishedAt,
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Minimal satu kolom harus diisi.");

export type NewsUpdate = z.infer<typeof newsUpdateSchema>;
