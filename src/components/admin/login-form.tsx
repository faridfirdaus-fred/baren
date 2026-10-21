"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";

import { adminLoginSchema, type AdminLoginInput } from "@/lib/auth-validation";
import { loginAdminAction } from "@/app/admin/login/actions";

export function AdminLoginForm({
  accessDenied = false,
}: {
  accessDenied?: boolean;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [dismissAccessDenied, setDismissAccessDenied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginInput>({ resolver: zodResolver(adminLoginSchema) });

  async function onSubmit(values: AdminLoginInput) {
    setServerError(null);
    setDismissAccessDenied(true);
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
      className="space-y-4"
    >
      {accessDenied && !dismissAccessDenied && !serverError ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-sand"
        >
          <ShieldAlert
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold uppercase tracking-wider text-amber-400">
              Akses Ditolak
            </p>
            <p className="mt-0.5 text-sand-600">
              Akun Anda tidak memiliki izin administrator. Silakan masuk
              menggunakan akun admin.
            </p>
          </div>
        </div>
      ) : null}

      {serverError ? (
        <div
          role="alert"
          className="flex items-center gap-2 border border-ember/50 bg-ember/15 p-3 text-xs font-medium text-sand"
        >
          <AlertCircle
            className="h-4 w-4 shrink-0 text-ember"
            aria-hidden="true"
          />
          <span>{serverError}</span>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-xs font-semibold uppercase tracking-wider text-sand-600"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="admin@baren.id"
          {...register("email")}
          aria-invalid={Boolean(errors.email)}
          className="w-full rounded-none border border-line bg-ink px-3.5 py-2.5 text-sm text-sand placeholder:text-sand/30 transition-colors focus:border-ember focus:bg-ink-700/50 focus:outline-none focus:ring-1 focus:ring-ember"
        />
        {errors.email ? (
          <p role="alert" className="text-xs text-ember">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-xs font-semibold uppercase tracking-wider text-sand-600"
        >
          Kata sandi
        </label>
        <div className="relative flex items-center">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            {...register("password")}
            aria-invalid={Boolean(errors.password)}
            className="w-full rounded-none border border-line bg-ink px-3.5 py-2.5 pr-11 text-sm text-sand placeholder:text-sand/30 transition-colors focus:border-ember focus:bg-ink-700/50 focus:outline-none focus:ring-1 focus:ring-ember"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={
              showPassword ? "Sembunyikan sandi" : "Perlihatkan sandi"
            }
            aria-pressed={showPassword}
            className="absolute right-2 flex h-7 w-7 items-center justify-center text-sand-600 transition-colors hover:bg-ink-700 hover:text-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password ? (
          <p role="alert" className="text-xs text-ember">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-none bg-ember-700 px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.1em] text-sand transition-all duration-150 hover:bg-ember-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Memeriksa...</span>
          </>
        ) : (
          "Masuk"
        )}
      </button>
    </form>
  );
}
