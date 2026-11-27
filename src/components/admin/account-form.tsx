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
  adminErrorClass,
  adminInputClass,
  adminLabelClass,
} from "./form-styles";
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
    <div className="grid gap-6 md:grid-cols-2">
      <section
        aria-labelledby="profil-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"
      >
        <h2 id="profil-heading" className="text-sm font-semibold text-zinc-900">
          Profil Akun
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Perbarui nama tampilan dan alamat email administrator.
        </p>
        <form
          className="mt-4 grid gap-4"
          noValidate
          onSubmit={profileForm.handleSubmit(submitProfile)}
        >
          <div>
            <label htmlFor="admin-name" className={adminLabelClass}>
              Nama
            </label>
            <input
              id="admin-name"
              autoComplete="name"
              placeholder="Contoh: Tim Cikara Studio"
              className={adminInputClass}
              {...profileForm.register("name")}
              aria-invalid={Boolean(profileForm.formState.errors.name)}
            />
            {profileForm.formState.errors.name ? (
              <p role="alert" className={adminErrorClass}>
                {profileForm.formState.errors.name.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="admin-email" className={adminLabelClass}>
              Email akun
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              placeholder="admin@baren.game"
              className={adminInputClass}
              {...profileForm.register("email")}
              aria-invalid={Boolean(profileForm.formState.errors.email)}
            />
            {profileForm.formState.errors.email ? (
              <p role="alert" className={adminErrorClass}>
                {profileForm.formState.errors.email.message}
              </p>
            ) : null}
          </div>
          {profileMessage ? (
            <p
              className={
                profileMessage.startsWith("Profil berhasil")
                  ? "text-xs font-medium text-emerald-700"
                  : adminErrorClass
              }
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
            className={adminButtonClass("primary", "md", "justify-self-start")}
          >
            {profileForm.formState.isSubmitting
              ? "Menyimpan..."
              : "Simpan profil"}
          </button>
        </form>
      </section>

      <section
        aria-labelledby="password-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"
      >
        <h2
          id="password-heading"
          className="text-sm font-semibold text-zinc-900"
        >
          Ubah Kata Sandi
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Gunakan minimal 8 karakter yang berbeda dari kata sandi sebelumnya.
        </p>
        <form
          className="mt-4 grid gap-4"
          noValidate
          onSubmit={passwordForm.handleSubmit(submitPassword)}
        >
          <div>
            <label htmlFor="current-password" className={adminLabelClass}>
              Kata sandi saat ini
            </label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              placeholder="Masukkan kata sandi lama"
              className={adminInputClass}
              {...passwordForm.register("currentPassword")}
              aria-invalid={Boolean(
                passwordForm.formState.errors.currentPassword,
              )}
            />
            {passwordForm.formState.errors.currentPassword ? (
              <p role="alert" className={adminErrorClass}>
                {passwordForm.formState.errors.currentPassword.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="new-password" className={adminLabelClass}>
              Kata sandi baru
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              className={adminInputClass}
              {...passwordForm.register("newPassword")}
              aria-invalid={Boolean(passwordForm.formState.errors.newPassword)}
            />
            {passwordForm.formState.errors.newPassword ? (
              <p role="alert" className={adminErrorClass}>
                {passwordForm.formState.errors.newPassword.message}
              </p>
            ) : null}
          </div>
          {passwordMessage ? (
            <p
              className={
                passwordMessage.startsWith("Kata sandi berhasil")
                  ? "text-xs font-medium text-emerald-700"
                  : adminErrorClass
              }
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
            className={adminButtonClass("primary", "md", "justify-self-start")}
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
