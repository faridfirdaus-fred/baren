import { z } from "zod";

import type { ApiResult } from "./response";

function zodFields(error: z.ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key =
      issue.path.length > 0 ? issue.path.map(String).join(".") : "(data)";
    (fields[key] ??= []).push(issue.message);
  }
  return fields;
}

const wishlistQuerySchema = z
  .object({
    page: z
      .string()
      .regex(/^[1-9]\d*$/, "Halaman tidak valid.")
      .optional()
      .transform((value) => (value === undefined ? 1 : Number(value)))
      .refine(Number.isSafeInteger, "Halaman tidak valid."),
    search: z
      .string()
      .trim()
      .max(320, "Pencarian maksimal 320 karakter.")
      .optional()
      .transform((value) => value || undefined),
  })
  .strict();

export type WishlistQuery = { page: number; search?: string };

export function parseWishlistQuery(raw: unknown): ApiResult<WishlistQuery> {
  const parsed = wishlistQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Validasi gagal. Periksa kembali kolom yang ditandai.",
      fields: zodFields(parsed.error),
    };
  }
  const { page, search } = parsed.data;
  return { ok: true, data: search ? { page, search } : { page } };
}
