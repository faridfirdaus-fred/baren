// E3-9: skema validasi Zod untuk endpoint settings (SRS FR-ADM-24/25).
// - Kolom opsional parsial (PUT menerima sebagian kolom), minimal satu kolom.
// - URL logo/favicon wajib https://, maks 2048 karakter; string kosong = null.
// - Email kontak format email (kosong = null); key tak dikenal DITOLAK
//   (strict) agar salah ketik terdeteksi, bukan dibuang diam-diam.
// Impor runtime hanya `zod` agar teruji via node:test.

import { z } from "zod";

const URL_MAX = 2048;

/** String kosong berarti mengosongkan kolom (konsisten semua kolom opsional). */
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

export const settingsUpdateSchema = z
  .object({
    namaGame: z
      .string()
      .trim()
      .min(1, "Nama game wajib diisi.")
      .max(100, "Nama game maksimal 100 karakter.")
      .optional(),
    tagline: z.preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .max(200, "Tagline maksimal 200 karakter.")
        .nullable()
        .optional(),
    ),
    logoUrl: httpsUrl("URL logo"),
    faviconUrl: httpsUrl("URL favicon"),
    emailKontak: z.preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .max(320, "Email kontak maksimal 320 karakter.")
        .pipe(z.string().email("Masukkan alamat email yang valid."))
        .nullable()
        .optional(),
    ),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Minimal satu kolom harus diisi.");

export type SettingsUpdate = z.infer<typeof settingsUpdateSchema>;
