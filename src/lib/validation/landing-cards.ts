// E1-6: skema validasi Zod kartu fleksibel landing (pengganti
// Event/About/Agents/Maps statis). Strict anti-typo. CTA label+url wajib
// berpasangan; URL boleh https:// atau anchor internal #... Impor runtime
// hanya `zod`.

import { z } from "zod";

const httpsOrAnchor = z
  .string()
  .trim()
  .min(1, "Tautan tidak boleh kosong.")
  .max(2048, "Tautan maksimal 2048 karakter.")
  .refine((v) => v.startsWith("https://") || v.startsWith("#"), {
    message: "Tautan harus diawali https:// atau #.",
  });

const tone = z.enum(["dark", "light", "ember"]);

const sortOrder = z.number().int().min(0).max(100000).optional();

const base = {
  slot: z
    .string()
    .trim()
    .min(1, "Slot wajib diisi.")
    .max(32, "Slot maksimal 32 karakter.")
    .optional(),
  eyebrow: z
    .string()
    .trim()
    .max(80, "Eyebrow maksimal 80 karakter.")
    .optional(),
  title: z
    .string()
    .trim()
    .min(1, "Judul wajib diisi.")
    .max(120, "Judul maksimal 120 karakter."),
  subtitle: z
    .string()
    .trim()
    .max(160, "Subjudul maksimal 160 karakter.")
    .optional(),
  body: z.string().trim().max(2000, "Isi maksimal 2000 karakter.").optional(),
  imageUrl: z
    .string()
    .trim()
    .max(2048, "URL gambar maksimal 2048 karakter.")
    .optional(),
  ctaLabel: z
    .string()
    .trim()
    .max(60, "Label tombol maksimal 60 karakter.")
    .optional(),
  ctaUrl: httpsOrAnchor.optional(),
  tone: tone.optional(),
  sortOrder,
  isPublished: z.union([z.literal(0), z.literal(1)]).optional(),
};

const ctaPair = (v: { ctaLabel?: string; ctaUrl?: string }) =>
  (!!v.ctaLabel && !!v.ctaUrl) || (!v.ctaLabel && !v.ctaUrl);

export const landingCardCreateSchema = z
  .object(base)
  .strict()
  .refine(ctaPair, "Label dan tautan tombol harus diisi bersamaan.");

export type LandingCardCreate = z.infer<typeof landingCardCreateSchema>;

export const landingCardUpdateSchema = z
  .object({
    ...base,
    title: base.title.optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Minimal satu kolom harus diisi.")
  .refine(ctaPair, "Label dan tautan tombol harus diisi bersamaan.");

export type LandingCardUpdate = z.infer<typeof landingCardUpdateSchema>;

export const landingCardReorderSchema = z
  .object({
    ids: z
      .array(z.number().int().positive("ID tidak valid."))
      .min(1, "Daftar ID tidak boleh kosong.")
      .max(100, "Daftar ID maksimal 100."),
  })
  .strict();

export type LandingCardReorder = z.infer<typeof landingCardReorderSchema>;
