// E1-7: skema validasi Zod komentar landing. Teks polos 1..500 karakter,
// tanpa HTML (dirender sebagai teks). Strict anti-typo. Impor runtime
// hanya `zod`.

import { z } from "zod";

export const commentCreateSchema = z
  .object({
    body: z
      .string()
      .trim()
      .min(1, "Komentar tidak boleh kosong.")
      .max(500, "Komentar maksimal 500 karakter.")
      .refine((v) => !/<[a-z][\s\S]*>/i.test(v), "HTML tidak diizinkan."),
  })
  .strict();

export type CommentCreate = z.infer<typeof commentCreateSchema>;
