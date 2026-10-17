"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { auth, db, normalizeEmail, signOut } from "@/auth";
import { users } from "@/db/schema";
import { adminPasswordSchema, adminProfileSchema } from "@/lib/auth-validation";

export async function updateAdminProfileAction(
  raw: unknown,
): Promise<{ ok: boolean; message: string }> {
  const session = await auth();
  const sessionUser = session?.user as
    { id?: string; role?: string } | undefined;
  if (!sessionUser?.id)
    return { ok: false, message: "Anda belum masuk. Silakan masuk kembali." };
  if (sessionUser.role !== "admin")
    return { ok: false, message: "Akses ditolak." };
  const parsed = adminProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Masukan tidak valid.",
    };
  }
  const database = db();
  const existing = await database
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);
  if (existing[0] && existing[0].id !== sessionUser.id) {
    return { ok: false, message: "Email sudah digunakan akun lain." };
  }
  try {
    await database
      .update(users)
      .set({ name: parsed.data.name, email: parsed.data.email })
      .where(eq(users.id, sessionUser.id));
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return { ok: false, message: "Email sudah digunakan akun lain." };
    }
    throw error;
  }
  return { ok: true, message: "Profil berhasil diperbarui." };
}

export async function updateAdminPasswordAction(
  raw: unknown,
): Promise<{ ok: boolean; message: string }> {
  const session = await auth();
  const sessionUser = session?.user as
    { id?: string; role?: string } | undefined;
  if (!sessionUser?.id)
    return { ok: false, message: "Anda belum masuk. Silakan masuk kembali." };
  if (sessionUser.role !== "admin")
    return { ok: false, message: "Akses ditolak." };
  const parsed = adminPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Masukan tidak valid.",
    };
  }
  const database = db();
  const rows = await database
    .select()
    .from(users)
    .where(eq(users.id, sessionUser.id))
    .limit(1);
  const current = rows[0];
  if (!current?.passwordHash)
    return { ok: false, message: "Akun ini tidak memakai kata sandi." };
  const matches = await bcrypt.compare(
    parsed.data.currentPassword,
    current.passwordHash,
  );
  if (!matches) return { ok: false, message: "Kata sandi saat ini salah." };
  const same = await bcrypt.compare(
    parsed.data.newPassword,
    current.passwordHash,
  );
  if (same)
    return {
      ok: false,
      message: "Kata sandi baru harus berbeda dari kata sandi lama.",
    };
  const nextHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await database
    .update(users)
    .set({ passwordHash: nextHash })
    .where(eq(users.id, sessionUser.id));
  return { ok: true, message: "Kata sandi berhasil diubah." };
}

export async function normalizeEmailAction(value: string): Promise<string> {
  return normalizeEmail(value);
}

export async function adminSignOutAction(): Promise<void> {
  await signOut({ redirectTo: "/admin/login" });
}
