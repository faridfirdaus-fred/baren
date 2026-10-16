// E3-9: skema validasi Zod galeri (SRS FR-ADM-15/16/24/25).
// kind: screenshot/artwork/banner/video/image; fileUrl https (key/URL hasil
// uploader R2 — bukan presigned kedaluwarsa). Strict anti-typo.

import { z } from "zod";

const URL_MAX = 2048;

export const galleryKinds = [
  "image",
  "screenshot",
  "artwork",
  "banner",
  "video",
] as const;

export type GalleryKind = (typeof galleryKinds)[number];

function httpsUrl(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} wajib diisi.`)
    .max(URL_MAX, `${label} maksimal ${URL_MAX} karakter.`)
    .refine((v) => {
      try {
        return new URL(v).protocol === "https:";
      } catch {
        return false;
      }
    }, `${label} harus diawali https://.`);
}

function optionalText(label: string, max: number) {
  return z.preprocess(
    (v) => (v === "" ? null : v),
    z
      .string()
      .trim()
      .max(max, `${label} maksimal ${max} karakter.`)
      .nullable()
      .optional(),
  );
}

const sortOrder = z.number().int().min(0).max(100000).optional();

export const galleryCreateSchema = z
  .object({
    kind: z.enum(
      galleryKinds,
      `Jenis harus salah satu: ${galleryKinds.join(", ")}.`,
    ),
    title: optionalText("Judul", 200),
    fileUrl: httpsUrl("URL berkas"),
    sortOrder,
  })
  .strict();

export type GalleryCreate = z.infer<typeof galleryCreateSchema>;

export const galleryUpdateSchema = z
  .object({
    kind: z
      .enum(galleryKinds, `Jenis harus salah satu: ${galleryKinds.join(", ")}.`)
      .optional(),
    title: optionalText("Judul", 200),
    fileUrl: httpsUrl("URL berkas").optional(),
    sortOrder,
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Minimal satu kolom harus diisi.");

export type GalleryUpdate = z.infer<typeof galleryUpdateSchema>;
