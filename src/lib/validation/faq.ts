// E3-9: skema validasi Zod FAQ (SRS FR-ADM-20/24).
// Strict anti-typo. Impor runtime hanya `zod`.

import { z } from "zod";

const sortOrder = z.number().int().min(0).max(100000).optional();

export const faqCreateSchema = z
  .object({
    question: z
      .string()
      .trim()
      .min(1, "Pertanyaan wajib diisi.")
      .max(500, "Pertanyaan maksimal 500 karakter."),
    answer: z
      .string()
      .trim()
      .min(1, "Jawaban wajib diisi.")
      .max(5000, "Jawaban maksimal 5000 karakter."),
    sortOrder,
  })
  .strict();

export type FaqCreate = z.infer<typeof faqCreateSchema>;

export const faqUpdateSchema = z
  .object({
    question: z
      .string()
      .trim()
      .min(1, "Pertanyaan wajib diisi.")
      .max(500, "Pertanyaan maksimal 500 karakter.")
      .optional(),
    answer: z
      .string()
      .trim()
      .min(1, "Jawaban wajib diisi.")
      .max(5000, "Jawaban maksimal 5000 karakter.")
      .optional(),
    sortOrder,
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Minimal satu kolom harus diisi.");

export type FaqUpdate = z.infer<typeof faqUpdateSchema>;
