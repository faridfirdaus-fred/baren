"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { adminLoginSchema, type AdminLoginInput } from "@/lib/auth-validation";
import { loginAdminAction } from "@/app/admin/login/actions";

export function AdminLoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginInput>({ resolver: zodResolver(adminLoginSchema) });

  async function onSubmit(values: AdminLoginInput) {
    setServerError(null);
    const result = await loginAdminAction(values);
    // Pesan generik (FR-ADM-01): tidak menyebut kolom yang salah.
    if (!result.ok) {
      setServerError("Email atau kata sandi salah.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Formulir masuk admin"
    >
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          {...register("email")}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? <p role="alert">{errors.email.message}</p> : null}
      </div>
      <div>
        <label htmlFor="password">Kata sandi</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password ? <p role="alert">{errors.password.message}</p> : null}
      </div>
      {serverError ? <p role="alert">{serverError}</p> : null}
      <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? "Memeriksa..." : "Masuk"}
      </button>
    </form>
  );
}
