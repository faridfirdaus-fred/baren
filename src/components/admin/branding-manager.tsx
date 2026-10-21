"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { adminInputClass, adminLabelClass } from "./form-styles";

import { AssetUploader } from "@/components/admin/asset-uploader";
import { adminButtonClass } from "@/components/admin/button-styles";
import {
  fetchBranding,
  saveBranding,
  toBrandingFormValues,
  toBrandingUpdatePayload,
  type BrandingFormValues,
} from "@/lib/admin-branding-client";
import type { UploadedAsset } from "@/lib/assets-client";

const brandingFormSchema = z.object({
  namaGame: z
    .string()
    .trim()
    .min(1, "Nama game wajib diisi.")
    .max(100, "Nama game maksimal 100 karakter."),
  tagline: z.string().trim().max(200, "Tagline maksimal 200 karakter."),
  logoUrl: z
    .string()
    .trim()
    .max(2048, "URL logo maksimal 2048 karakter.")
    .refine(
      (v) => !v || v.startsWith("https://"),
      "URL logo harus diawali https://.",
    ),
  faviconUrl: z
    .string()
    .trim()
    .max(2048, "URL favicon maksimal 2048 karakter.")
    .refine(
      (v) => !v || v.startsWith("https://"),
      "URL favicon harus diawali https://.",
    ),
});

const DEFAULT_LOGO = "/brand/baren-mark.svg";
const DEFAULT_FAVICON = "/favicon.ico";

export function AdminBrandingManager() {
  const router = useRouter();
  const requestVersion = useRef(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingFormSchema),
    defaultValues: {
      namaGame: "",
      tagline: "",
      logoUrl: "",
      faviconUrl: "",
    },
  });

  const watchedLogoUrl = useWatch({ control, name: "logoUrl" });
  const watchedFaviconUrl = useWatch({ control, name: "faviconUrl" });
  const watchedNamaGame = useWatch({ control, name: "namaGame" });

  const loadData = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    setLoadError(null);
    try {
      const result = await fetchBranding();
      if (version !== requestVersion.current) return;
      if (!result.ok) {
        setLoadError(result.error.message);
        return;
      }
      reset(toBrandingFormValues(result.data));
    } catch {
      if (version === requestVersion.current) {
        setLoadError("Pengaturan branding tidak dapat dimuat. Coba lagi.");
      }
    } finally {
      if (version === requestVersion.current) {
        setLoading(false);
      }
    }
  }, [reset]);

  useEffect(() => {
    const controller = new AbortController();
    const version = ++requestVersion.current;
    void fetchBranding(fetch, controller.signal)
      .then((result) => {
        if (controller.signal.aborted || version !== requestVersion.current)
          return;
        if (!result.ok) {
          setLoadError(result.error.message);
          return;
        }
        reset(toBrandingFormValues(result.data));
      })
      .catch(() => {
        if (!controller.signal.aborted && version === requestVersion.current) {
          setLoadError("Pengaturan branding tidak dapat dimuat. Coba lagi.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted && version === requestVersion.current) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [reset]);

  async function onSubmit(values: BrandingFormValues) {
    setSuccessMessage(null);
    clearErrors("root");

    const payload = toBrandingUpdatePayload(values);
    const result = await saveBranding(payload);

    if (!result.ok) {
      if (result.error.fields) {
        if (result.error.fields.namaGame?.[0]) {
          setError("namaGame", {
            type: "server",
            message: result.error.fields.namaGame[0],
          });
        }
        if (result.error.fields.tagline?.[0]) {
          setError("tagline", {
            type: "server",
            message: result.error.fields.tagline[0],
          });
        }
        if (result.error.fields.logoUrl?.[0]) {
          setError("logoUrl", {
            type: "server",
            message: result.error.fields.logoUrl[0],
          });
        }
        if (result.error.fields.faviconUrl?.[0]) {
          setError("faviconUrl", {
            type: "server",
            message: result.error.fields.faviconUrl[0],
          });
        }
      }
      setError("root", { type: "server", message: result.error.message });
      return;
    }

    reset(toBrandingFormValues(result.data));
    setSuccessMessage("Pengaturan branding berhasil disimpan.");
    router.refresh();
  }

  const handleLogoUploaded = (asset: UploadedAsset) => {
    setValue("logoUrl", asset.publicUrl, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setSuccessMessage(
      "Logo baru berhasil diunggah ke R2. Klik 'Simpan Branding' untuk menerapkan perubahan.",
    );
  };

  const handleFaviconUploaded = (asset: UploadedAsset) => {
    setValue("faviconUrl", asset.publicUrl, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setSuccessMessage(
      "Favicon baru berhasil diunggah ke R2. Klik 'Simpan Branding' untuk menerapkan perubahan.",
    );
  };

  const activeLogoSrc = watchedLogoUrl?.trim() || DEFAULT_LOGO;
  const activeFaviconSrc = watchedFaviconUrl?.trim() || DEFAULT_FAVICON;

  return (
    <div className="grid max-w-4xl gap-8">
      <header className="border-b border-line pb-4">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-sand">
          Kelola Branding
        </h1>
        <p className="mt-1 text-sm text-sand-600">
          Ubah nama game, tagline, logo, dan favicon situs publik (FR-ADM-08).
        </p>
      </header>

      {loading ? (
        <div className="border border-line bg-ink-800 p-6 text-sand-600">
          <p>Memuat pengaturan branding…</p>
        </div>
      ) : null}

      {loadError ? (
        <div
          role="alert"
          className="border border-ember/30 bg-ember/10 p-4 text-sm text-ember"
        >
          <p className="font-semibold">{loadError}</p>
          <button
            type="button"
            onClick={() => void loadData()}
            className={adminButtonClass("secondary", "sm", "mt-3")}
          >
            Coba Lagi
          </button>
        </div>
      ) : null}

      {!loading && !loadError ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="grid gap-8"
        >
          {successMessage ? (
            <div
              role="status"
              className="border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300"
            >
              {successMessage}
            </div>
          ) : null}

          {errors.root ? (
            <div
              role="alert"
              className="border border-ember/30 bg-ember/10 p-4 text-sm text-ember"
            >
              {errors.root.message}
            </div>
          ) : null}

          {/* Bagian Identitas Teks */}
          <section className="grid gap-5 border border-line bg-ink-800 p-6">
            <h2 className="font-display text-xl font-bold uppercase tracking-wider text-sand">
              Identitas Nama & Tagline
            </h2>

            <div>
              <label htmlFor="namaGame" className={adminLabelClass}>
                Nama Game <span className="text-ember">*</span>
              </label>
              <input
                id="namaGame"
                type="text"
                {...register("namaGame")}
                aria-invalid={Boolean(errors.namaGame)}
                aria-describedby={
                  errors.namaGame ? "namaGame-error" : "namaGame-help"
                }
                className={adminInputClass}
                placeholder="Contoh: BAREN"
              />
              <p id="namaGame-help" className="mt-1 text-xs text-sand-600">
                Nama utama game yang tampil di header dan judul tab peramban.
              </p>
              {errors.namaGame ? (
                <p
                  id="namaGame-error"
                  role="alert"
                  className="mt-1 text-xs text-ember"
                >
                  {errors.namaGame.message}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="tagline" className={adminLabelClass}>
                Tagline Game
              </label>
              <input
                id="tagline"
                type="text"
                {...register("tagline")}
                aria-invalid={Boolean(errors.tagline)}
                aria-describedby={
                  errors.tagline ? "tagline-error" : "tagline-help"
                }
                className={adminInputClass}
                placeholder="Contoh: Rebut benteng. Kuasai arena."
              />
              <p id="tagline-help" className="mt-1 text-xs text-sand-600">
                Slogan atau deskripsi ringkas yang tampil pada meta deskripsi.
              </p>
              {errors.tagline ? (
                <p
                  id="tagline-error"
                  role="alert"
                  className="mt-1 text-xs text-ember"
                >
                  {errors.tagline.message}
                </p>
              ) : null}
            </div>
          </section>

          {/* Bagian Logo */}
          <section className="grid gap-6 border border-line bg-ink-800 p-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-xl font-bold uppercase tracking-wider text-sand">
                  Logo Game
                </h2>
                <p className="text-xs text-sand-600">
                  Format didukung: JPG, PNG, WebP, SVG (maks. 5 MB).
                </p>
              </div>
              {watchedLogoUrl ? (
                <button
                  type="button"
                  onClick={() =>
                    setValue("logoUrl", "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className={adminButtonClass("secondary", "sm", "self-start")}
                >
                  Kembalikan ke Default
                </button>
              ) : null}
            </div>

            {/* Preview Logo */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center border border-dashed border-line bg-ink p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeLogoSrc}
                  alt={`Preview logo ${watchedNamaGame || "BAREN"}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="text-xs text-sand-600">
                <p className="font-semibold text-sand">Pratinjau Logo Aktif:</p>
                <p className="mt-0.5 break-all">
                  {watchedLogoUrl?.trim()
                    ? watchedLogoUrl
                    : `Default (${DEFAULT_LOGO})`}
                </p>
              </div>
            </div>

            {/* Input URL Logo */}
            <div>
              <label htmlFor="logoUrl" className={adminLabelClass}>
                URL Logo (HTTPS)
              </label>
              <input
                id="logoUrl"
                type="url"
                {...register("logoUrl")}
                aria-invalid={Boolean(errors.logoUrl)}
                aria-describedby={
                  errors.logoUrl ? "logoUrl-error" : "logoUrl-help"
                }
                className={adminInputClass}
                placeholder="https://..."
              />
              <p id="logoUrl-help" className="mt-1 text-xs text-sand-600">
                Diisi otomatis saat mengunggah via R2 di bawah, atau masukkan
                tautan langsung.
              </p>
              {errors.logoUrl ? (
                <p
                  id="logoUrl-error"
                  role="alert"
                  className="mt-1 text-xs text-ember"
                >
                  {errors.logoUrl.message}
                </p>
              ) : null}
            </div>

            {/* Uploader R2 Logo */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-sand-600">
                Unggah Berkas Logo Baru ke R2
              </p>
              <AssetUploader
                purpose="logo"
                onUploaded={handleLogoUploaded}
                disabled={isSubmitting}
              />
            </div>
          </section>

          {/* Bagian Favicon */}
          <section className="grid gap-6 border border-line bg-ink-800 p-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-xl font-bold uppercase tracking-wider text-sand">
                  Favicon Game
                </h2>
                <p className="text-xs text-sand-600">
                  Format didukung: PNG, SVG (maks. 5 MB).
                </p>
              </div>
              {watchedFaviconUrl ? (
                <button
                  type="button"
                  onClick={() =>
                    setValue("faviconUrl", "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className={adminButtonClass("secondary", "sm", "self-start")}
                >
                  Kembalikan ke Default
                </button>
              ) : null}
            </div>

            {/* Preview Favicon */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-dashed border-line bg-ink p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeFaviconSrc}
                  alt={`Preview favicon ${watchedNamaGame || "BAREN"}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="text-xs text-sand-600">
                <p className="font-semibold text-sand">
                  Pratinjau Favicon Aktif:
                </p>
                <p className="mt-0.5 break-all">
                  {watchedFaviconUrl?.trim()
                    ? watchedFaviconUrl
                    : `Default (${DEFAULT_FAVICON})`}
                </p>
              </div>
            </div>

            {/* Input URL Favicon */}
            <div>
              <label htmlFor="faviconUrl" className={adminLabelClass}>
                URL Favicon (HTTPS)
              </label>
              <input
                id="faviconUrl"
                type="url"
                {...register("faviconUrl")}
                aria-invalid={Boolean(errors.faviconUrl)}
                aria-describedby={
                  errors.faviconUrl ? "faviconUrl-error" : "faviconUrl-help"
                }
                className={adminInputClass}
                placeholder="https://..."
              />
              <p id="faviconUrl-help" className="mt-1 text-xs text-sand-600">
                Diisi otomatis saat mengunggah via R2 di bawah, atau masukkan
                tautan langsung.
              </p>
              {errors.faviconUrl ? (
                <p
                  id="faviconUrl-error"
                  role="alert"
                  className="mt-1 text-xs text-ember"
                >
                  {errors.faviconUrl.message}
                </p>
              ) : null}
            </div>

            {/* Uploader R2 Favicon */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-sand-600">
                Unggah Berkas Favicon Baru ke R2
              </p>
              <AssetUploader
                purpose="favicon"
                onUploaded={handleFaviconUploaded}
                disabled={isSubmitting}
              />
            </div>
          </section>

          {/* Tombol Simpan */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={adminButtonClass("primary", "md")}
            >
              {isSubmitting ? "Menyimpan Branding…" : "Simpan Branding"}
            </button>
            {isDirty ? (
              <span className="text-xs text-sand-600">
                Ada perubahan yang belum disimpan.
              </span>
            ) : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}
