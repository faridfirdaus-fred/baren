"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  adminErrorClass,
  adminInputClass,
  adminLabelClass,
} from "./form-styles";

import { AssetUploader } from "@/components/admin/asset-uploader";
import { Toast } from "@/components/admin/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { adminButtonClass } from "@/components/admin/button-styles";
import {
  fetchBranding,
  saveBranding,
  toBrandingFormValues,
  toBrandingUpdatePayload,
  type BrandingFormValues,
} from "@/lib/admin-branding-client";
import type { UploadedAsset } from "@/lib/assets-client";
import { resolvePublicAssetUrl } from "@/lib/assets-url";

const SAFE_BRAND_URL =
  /^\/(?:art|media|brand|api\/assets|favicon\.ico|icon\.svg)(?:\/(?!.*\.\.)[a-zA-Z0-9._/-]+)?$/;

const isValidBrandUrl = (v: string) =>
  !v || v.startsWith("https://") || SAFE_BRAND_URL.test(v);

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
    .refine(isValidBrandUrl, "URL logo harus diawali https://."),
  faviconUrl: z
    .string()
    .trim()
    .max(2048, "URL favicon maksimal 2048 karakter.")
    .refine(isValidBrandUrl, "URL favicon harus diawali https://."),
});

const DEFAULT_LOGO = "/brand/baren-mark.svg";
const DEFAULT_FAVICON = "/icon.svg";

export function AdminBrandingManager() {
  const router = useRouter();
  const requestVersion = useRef(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

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
    clearErrors("root");
    const payload = toBrandingUpdatePayload(values);
    const result = await saveBranding(payload);

    if (!result.ok) {
      if (result.error.fields) {
        for (const key of [
          "namaGame",
          "tagline",
          "logoUrl",
          "faviconUrl",
        ] as const) {
          const msg = result.error.fields[key]?.[0];
          if (msg) setError(key, { type: "server", message: msg });
        }
      }
      setError("root", { type: "server", message: result.error.message });
      return;
    }

    reset(toBrandingFormValues(result.data));
    setToast({
      message: "Pengaturan branding berhasil disimpan.",
      type: "success",
    });
    router.refresh();
  }

  const handleLogoUploaded = (asset: UploadedAsset) => {
    setValue("logoUrl", asset.publicUrl, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setToast({
      message: "Logo baru diunggah. Klik Simpan Branding untuk menerapkan.",
      type: "success",
    });
  };

  const handleFaviconUploaded = (asset: UploadedAsset) => {
    setValue("faviconUrl", asset.publicUrl, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setToast({
      message: "Favicon baru diunggah. Klik Simpan Branding untuk menerapkan.",
      type: "success",
    });
  };

  const activeLogoSrc =
    resolvePublicAssetUrl(watchedLogoUrl?.trim()) || DEFAULT_LOGO;
  const activeFaviconSrc =
    resolvePublicAssetUrl(watchedFaviconUrl?.trim()) || DEFAULT_FAVICON;

  return (
    <div className="space-y-6">
      <header className="border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Kelola Branding
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Ubah nama game, slogan utama, logo situs, dan ikon tab peramban.
        </p>
      </header>

      {loading && (
        <div
          className="grid gap-6 lg:grid-cols-12"
          role="status"
          aria-label="Memuat pengaturan branding"
        >
          <Skeleton className="h-64 w-full rounded-2xl lg:col-span-5" />
          <Skeleton className="h-80 w-full rounded-2xl lg:col-span-7" />
        </div>
      )}

      {loadError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
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
      )}

      {!loading && !loadError && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12"
        >
          {/* Identitas Teks */}
          <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 lg:col-span-5">
            <h2 className="border-b border-zinc-100 pb-3 text-base font-bold text-zinc-900">
              Identitas Game
            </h2>

            {errors.root && (
              <p role="alert" className={adminErrorClass}>
                {errors.root.message}
              </p>
            )}

            <div>
              <label htmlFor="namaGame" className={adminLabelClass}>
                Nama Game *
              </label>
              <input
                id="namaGame"
                type="text"
                {...register("namaGame")}
                aria-invalid={Boolean(errors.namaGame)}
                className={adminInputClass}
                placeholder="Contoh: BAREN"
              />
              {errors.namaGame && (
                <p role="alert" className={adminErrorClass}>
                  {errors.namaGame.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="tagline" className={adminLabelClass}>
                Slogan / Tagline
              </label>
              <input
                id="tagline"
                type="text"
                {...register("tagline")}
                aria-invalid={Boolean(errors.tagline)}
                className={adminInputClass}
                placeholder="Contoh: Lari, sembunyi, dan rebut benteng lawan!"
              />
              {errors.tagline && (
                <p role="alert" className={adminErrorClass}>
                  {errors.tagline.message}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={adminButtonClass("primary", "md")}
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Branding"}
              </button>
              {isDirty && (
                <span className="text-xs text-zinc-500">Belum disimpan</span>
              )}
            </div>
          </section>

          {/* Logo & Favicon */}
          <div className="space-y-6 lg:col-span-7">
            <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-zinc-900">
                    Logo Situs
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Format PNG, SVG, JPG, atau WebP (maks. 5 MB).
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
                    className={adminButtonClass("secondary", "sm")}
                  >
                    Pakai Bawaan
                  </button>
                ) : null}
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-3.5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeLogoSrc}
                    alt={`Pratinjau logo ${watchedNamaGame || "BAREN"}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="min-w-0 text-xs text-zinc-500">
                  <p className="font-semibold text-zinc-800">Logo Aktif</p>
                  <p className="mt-0.5 truncate">
                    {watchedLogoUrl?.trim() || "Logo bawaan BAREN"}
                  </p>
                </div>
              </div>

              <input type="hidden" {...register("logoUrl")} />
              <AssetUploader
                purpose="logo"
                onUploaded={handleLogoUploaded}
                disabled={isSubmitting}
              />
              {errors.logoUrl && (
                <p role="alert" className={adminErrorClass}>
                  {errors.logoUrl.message}
                </p>
              )}
            </section>

            <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-zinc-900">
                    Favicon (Ikon Tab Browser)
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Format PNG atau SVG persegi (maks. 5 MB).
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
                    className={adminButtonClass("secondary", "sm")}
                  >
                    Pakai Bawaan
                  </button>
                ) : null}
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeFaviconSrc}
                    alt={`Pratinjau favicon ${watchedNamaGame || "BAREN"}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="min-w-0 text-xs text-zinc-500">
                  <p className="font-semibold text-zinc-800">Favicon Aktif</p>
                  <p className="mt-0.5 truncate">
                    {watchedFaviconUrl?.trim() || "Favicon bawaan BAREN"}
                  </p>
                </div>
              </div>

              <input type="hidden" {...register("faviconUrl")} />
              <AssetUploader
                purpose="favicon"
                onUploaded={handleFaviconUploaded}
                disabled={isSubmitting}
              />
              {errors.faviconUrl && (
                <p role="alert" className={adminErrorClass}>
                  {errors.faviconUrl.message}
                </p>
              )}
            </section>
          </div>
        </form>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
