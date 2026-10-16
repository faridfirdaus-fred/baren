// E3-9: skema validasi Zod konten game (SRS FR-ADM-11..14/24/25).
// Strict anti-typo; media/ikon wajib https://; string kosong = null.
// Impor runtime hanya `zod` agar teruji via node:test.

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

const sortOrder = z.number().int().min(0).max(100000).optional();

export const aboutUpdateSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Judul wajib diisi.")
      .max(200, "Judul maksimal 200 karakter."),
    body: z
      .string()
      .trim()
      .min(1, "Deskripsi wajib diisi.")
      .max(5000, "Deskripsi maksimal 5000 karakter."),
    imageUrl: httpsUrl("URL gambar"),
  })
  .strict();

export type AboutUpdate = z.infer<typeof aboutUpdateSchema>;

export const featureCreateSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Judul fitur wajib diisi.")
      .max(150, "Judul fitur maksimal 150 karakter."),
    description: optionalText("Deskripsi fitur", 1000),
    iconUrl: httpsUrl("URL ikon"),
    sortOrder,
  })
  .strict();

export type FeatureCreate = z.infer<typeof featureCreateSchema>;

export const featureUpdateSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Judul fitur wajib diisi.")
      .max(150, "Judul fitur maksimal 150 karakter.")
      .optional(),
    description: optionalText("Deskripsi fitur", 1000),
    iconUrl: httpsUrl("URL ikon"),
    sortOrder,
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Minimal satu kolom harus diisi.");

export type FeatureUpdate = z.infer<typeof featureUpdateSchema>;

export const stepCreateSchema = z
  .object({
    step: z.number().int().min(1, "Nomor langkah minimal 1.").max(1000),
    title: z
      .string()
      .trim()
      .min(1, "Judul langkah wajib diisi.")
      .max(200, "Judul langkah maksimal 200 karakter."),
    description: optionalText("Deskripsi langkah", 2000),
    mediaUrl: httpsUrl("URL media"),
    sortOrder,
  })
  .strict();

export type StepCreate = z.infer<typeof stepCreateSchema>;

export const stepUpdateSchema = z
  .object({
    step: z
      .number()
      .int()
      .min(1, "Nomor langkah minimal 1.")
      .max(1000)
      .optional(),
    title: z
      .string()
      .trim()
      .min(1, "Judul langkah wajib diisi.")
      .max(200, "Judul langkah maksimal 200 karakter.")
      .optional(),
    description: optionalText("Deskripsi langkah", 2000),
    mediaUrl: httpsUrl("URL media"),
    sortOrder,
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Minimal satu kolom harus diisi.");

export type StepUpdate = z.infer<typeof stepUpdateSchema>;

export const videoUpdateSchema = z
  .object({
    videoUrl: z
      .string()
      .trim()
      .min(1, "URL video wajib diisi.")
      .max(URL_MAX, `URL video maksimal ${URL_MAX} karakter.`)
      .refine((v) => {
        try {
          return new URL(v).protocol === "https:";
        } catch {
          return false;
        }
      }, "URL video harus diawali https://."),
  })
  .strict();

export type VideoUpdate = z.infer<typeof videoUpdateSchema>;
