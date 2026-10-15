"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import { adminLoginSchema } from "@/lib/auth-validation";

export async function loginAdminAction(raw: unknown): Promise<{ ok: boolean }> {
  const parsed = adminLoginSchema.safeParse(raw);
  if (!parsed.success) return { ok: false };
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) return { ok: false };
    throw error;
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/admin/login" });
}
