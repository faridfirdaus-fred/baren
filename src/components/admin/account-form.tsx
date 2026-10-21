"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  updateAdminPasswordAction,
  updateAdminProfileAction,
} from "@/app/admin/account-actions";
import { adminButtonClass } from "./button-styles";
import {
  adminPasswordSchema,
  adminProfileSchema,
  type AdminPasswordInput,
  type AdminProfileInput,
} from "@/lib/auth-validation";

type AdminAccountFormProps = {
  name: string;
  email: string;
};

export function AdminAccountForm({ name, email }: AdminAccountFormProps) {
  const router = useRouter();
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const profileForm = useForm<AdminProfileInput>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: { name, email },
  });
  const passwordForm = useForm<AdminPasswordInput>({
    resolver: zodResolver(adminPasswordSchema),
  });

  async function submitProfile(values: AdminProfileInput) {
    setProfileMessage(null);
    const result = await updateAdminProfileAction(values);
    setProfileMessage(result.message);
    if (result.ok) router.refresh();
  }

  async function submitPassword(values: AdminPasswordInput) {
    setPasswordMessage(null);
    const result = await updateAdminPasswordAction(values);
    setPasswordMessage(result.message);
    if (result.ok) passwordForm.reset();
  }

  return (
    <div className="grid max-w-2xl gap-8">
      <section aria-labelledby="profil-heading">
        <h2 id="profil-heading">Profil akun</h2>
        <form
          className="mt-4 grid gap-4"
          noValidate
          onSubmit={profileForm.handleSubmit(submitProfile)}
        >
          <div>
            <label htmlFor="admin-name">Nama</label>
            <input
              id="admin-name"
              autoComplete="name"
              {...profileForm.register("name")}
              aria-invalid={Boolean(profileForm.formState.errors.name)}
            />
            {profileForm.formState.errors.name ? (
              <p role="alert">{profileForm.formState.errors.name.message}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="admin-email">Email akun</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              {...profileForm.register("email")}
              aria-invalid={Boolean(profileForm.formState.errors.email)}
            />
            {profileForm.formState.errors.email ? (
              <p role="alert">{profileForm.formState.errors.email.message}</p>
            ) : null}
          </div>
          {profileMessage ? (
            <p
              role={
                profileMessage.startsWith("Profil berhasil")
                  ? "status"
                  : "alert"
              }
            >
              {profileMessage}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={profileForm.formState.isSubmitting}
            className={adminButtonClass("primary", "md")}
          >
            {profileForm.formState.isSubmitting
              ? "Menyimpan..."
              : "Simpan profil"}
          </button>
        </form>
      </section>

      <section aria-labelledby="password-heading">
        <h2 id="password-heading">Ubah kata sandi</h2>
        <form
          className="mt-4 grid gap-4"
          noValidate
          onSubmit={passwordForm.handleSubmit(submitPassword)}
        >
          <div>
            <label htmlFor="current-password">Kata sandi saat ini</label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              {...passwordForm.register("currentPassword")}
              aria-invalid={Boolean(
                passwordForm.formState.errors.currentPassword,
              )}
            />
            {passwordForm.formState.errors.currentPassword ? (
              <p role="alert">
                {passwordForm.formState.errors.currentPassword.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="new-password">Kata sandi baru</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              {...passwordForm.register("newPassword")}
              aria-invalid={Boolean(passwordForm.formState.errors.newPassword)}
            />
            {passwordForm.formState.errors.newPassword ? (
              <p role="alert">
                {passwordForm.formState.errors.newPassword.message}
              </p>
            ) : null}
          </div>
          {passwordMessage ? (
            <p
              role={
                passwordMessage.startsWith("Kata sandi berhasil")
                  ? "status"
                  : "alert"
              }
            >
              {passwordMessage}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={passwordForm.formState.isSubmitting}
            className={adminButtonClass("primary", "md")}
          >
            {passwordForm.formState.isSubmitting
              ? "Mengubah..."
              : "Ubah kata sandi"}
          </button>
        </form>
      </section>
    </div>
  );
}
