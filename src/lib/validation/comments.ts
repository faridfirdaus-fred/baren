import { z } from "zod";

/**
 * Comment body validation - teks polos 1-500 karakter, tanpa HTML
 */
export const commentBodySchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, { message: "Komentar tidak boleh kosong" })
    .max(500, { message: "Komentar maksimal 500 karakter" })
    .refine((val) => !/<[^>]*>/.test(val), {
      message: "Komentar tidak boleh mengandung HTML",
    }),
});

export type CommentBody = z.infer<typeof commentBodySchema>;
