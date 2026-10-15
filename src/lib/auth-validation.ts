import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.string().email("Masukkan alamat email yang valid.")),
  password: z.string().min(1, "Masukkan kata sandi."),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const adminProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama tidak boleh kosong.")
    .max(100, "Nama maksimal 100 karakter."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.string().email("Masukkan alamat email yang valid.")),
});

export type AdminProfileInput = z.infer<typeof adminProfileSchema>;

export const adminPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Masukkan kata sandi saat ini."),
  newPassword: z
    .string()
    .min(8, "Kata sandi baru minimal 8 karakter.")
    .max(128, "Kata sandi baru maksimal 128 karakter."),
});

export type AdminPasswordInput = z.infer<typeof adminPasswordSchema>;
