// E3-9: skema validasi Zod social & download links (FR-ADM-21/22/23/25).
// URL wajib https:// (tautan keluar dibuka tab baru di UI — E7-6).
// Strict anti-typo. Impor runtime hanya `zod`.

import { z } from "zod";

const URL_MAX = 2048;

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

const platform = z
  .string()
  .trim()
  .min(1, "Platform wajib diisi.")
  .max(60, "Platform maksimal 60 karakter.");

const sortOrder = z.number().int().min(0).max(100000).optional();

export const socialCreateSchema = z
  .object({ platform, url: httpsUrl("URL"), sortOrder })
  .strict();

export type SocialCreate = z.infer<typeof socialCreateSchema>;

export const socialUpdateSchema = z
  .object({
    platform: platform.optional(),
    url: httpsUrl("URL").optional(),
    sortOrder,
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Minimal satu kolom harus diisi.");

export type SocialUpdate = z.infer<typeof socialUpdateSchema>;

export const downloadCreateSchema = z
  .object({
    platform,
    label: z
      .string()
      .trim()
      .min(1, "Label wajib diisi.")
      .max(100, "Label maksimal 100 karakter."),
    url: httpsUrl("URL"),
    sortOrder,
  })
  .strict();

export type DownloadCreate = z.infer<typeof downloadCreateSchema>;

export const downloadUpdateSchema = z
  .object({
    platform: platform.optional(),
    label: z
      .string()
      .trim()
      .min(1, "Label wajib diisi.")
      .max(100, "Label maksimal 100 karakter.")
      .optional(),
    url: httpsUrl("URL").optional(),
    sortOrder,
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Minimal satu kolom harus diisi.");

export type DownloadUpdate = z.infer<typeof downloadUpdateSchema>;
