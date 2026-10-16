import { z } from "zod";

/**
 * Waitlist query schema untuk pagination dan search.
 *
 * - page: default 1, harus integer positif
 * - search: optional, trim whitespace, ubah empty string ke undefined, max 320 karakter
 * - strict: tolak unknown keys
 */
export const waitlistQuerySchema = z
  .object({
    page: z.coerce
      .number()
      .int({ message: "page must be an integer" })
      .positive({ message: "page must be positive" })
      .default(1),
    search: z
      .string()
      .trim()
      .max(320, { message: "search query must not exceed 320 characters" })
      .transform((val) => (val === "" ? undefined : val))
      .optional(),
  })
  .strict();

export type WaitlistQuery = z.infer<typeof waitlistQuerySchema>;
