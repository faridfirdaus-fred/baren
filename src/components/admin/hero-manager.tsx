"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { AssetUploader } from "./asset-uploader";
import { Skeleton } from "@/components/ui/skeleton";
import { adminButtonClass } from "./button-styles";
import {
  adminInputClass,
  adminLabelClass,
  adminErrorClass,
  adminTextareaClass,
} from "./form-styles";
import { Toast } from "./toast";
import type { UploadedAsset } from "@/lib/assets-client";
import { resolvePublicAssetUrl } from "@/lib/assets-url";

interface HeroData {
  title: string;
  subtitle: string;
  backgroundUrl: string;
  videoUrl: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  isPublished: boolean;
}

interface ApiResponse {
  ok: boolean;
  data?: { hero: HeroData };
  message?: string;
  fields?: Record<string, string[]>;
}

const PRESET_HERO_IMAGES = [
  { label: "Keyart BAREN", url: "/media/hero-poster.jpg" },
  { label: "Arena Kampung", url: "/art/feature-1.jpg" },
  { label: "Aksi 2 vs 2", url: "/art/about-art.jpg" },
];

export function HeroManager() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<HeroData>({
    title: "Lari, sembunyi, dan rebut benteng lawan!",
    subtitle:
      "Party game lokal 2 vs 2 yang mengadaptasi keseruan permainan tradisional Baren/Bebentengan ke satu layar bersama.",
    backgroundUrl: "/media/hero-poster.jpg",
    videoUrl: "",
    primaryCtaLabel: "Gabung Wishlist",
    primaryCtaUrl: "#daftar",
    secondaryCtaLabel: "Cara Bermain",
    secondaryCtaUrl: "#cara-main",
    isPublished: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loadHero = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hero");
      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        setError(json.message || "Gagal memuat hero");
        return;
      }
      if (json.data?.hero) {
        setFormData({
          ...json.data.hero,
          backgroundUrl:
            json.data.hero.backgroundUrl || "/media/hero-poster.jpg",
          primaryCtaLabel: json.data.hero.primaryCtaLabel || "Gabung Wishlist",
          primaryCtaUrl: json.data.hero.primaryCtaUrl || "#daftar",
        });
      }
    } catch (err) {
      setError("Gagal memuat hero");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadHero();
  }, []);

  const handleVideoUploaded = (asset: UploadedAsset) => {
    setFormData((prev) => ({ ...prev, videoUrl: asset.publicUrl }));
    setToast({
      message: "Video diunggah. Klik Simpan Hero untuk menerapkan.",
      type: "success",
    });
  };

  const handleBackgroundUploaded = (asset: UploadedAsset) => {
    setFormData((prev) => ({ ...prev, backgroundUrl: asset.publicUrl }));
    setToast({
      message: "Gambar latar diunggah. Klik Simpan Hero untuk menerapkan.",
      type: "success",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          backgroundUrl: formData.backgroundUrl || "/media/hero-poster.jpg",
          videoUrl: formData.videoUrl.trim() || "/media/hero-loop.mp4",
          primaryCtaLabel: formData.primaryCtaLabel || "Gabung Wishlist",
          primaryCtaUrl: formData.primaryCtaUrl || "#daftar",
        }),
      });
      const json = (await res.json()) as ApiResponse;

      if (!json.ok) {
        if (json.fields) {
          setFormErrors(json.fields);
        } else {
          setToast({
            message: json.message || "Gagal menyimpan hero",
            type: "error",
          });
        }
        return;
      }

      setToast({
        message: "Hero disimpan",
        type: "success",
      });
      await loadHero();
    } catch (err) {
      setToast({ message: "Gagal menyimpan hero", type: "error" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-label="Memuat data Hero">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Skeleton className="h-96 w-full rounded-2xl lg:col-span-7" />
          <Skeleton className="h-96 w-full rounded-2xl lg:col-span-5" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Kelola Hero
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Atur tampilan pembuka utama halaman depan, tombol aksi, dan visual
            gameplay.
          </p>
        </div>
        <a
          href="/#top"
          target="_blank"
          rel="noopener noreferrer"
          className={adminButtonClass("secondary", "md")}
        >
          <ExternalLink className="h-4 w-4 text-zinc-400" />
          <span>Lihat di Beranda</span>
        </a>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12"
      >
        {/* Kolom Kiri: Teks & Tombol */}
        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 lg:col-span-7">
          <h2 className="border-b border-zinc-100 pb-3 text-base font-bold text-zinc-900">
            Teks & Tombol Utama
          </h2>

          <div>
            <label htmlFor="title" className={adminLabelClass}>
              Judul Utama *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Contoh: Lari, sembunyi, dan rebut benteng lawan!"
              className={adminInputClass}
              required
            />
            {formErrors.title && (
              <p className={adminErrorClass}>{formErrors.title[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="subtitle" className={adminLabelClass}>
              Subjudul / Ringkasan
            </label>
            <textarea
              id="subtitle"
              rows={3}
              value={formData.subtitle}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
              placeholder="Contoh: Party game lokal 2 vs 2 yang mengadaptasi permainan tradisional Baren/Bebentengan."
              className={adminTextareaClass}
            />
            {formErrors.subtitle && (
              <p className={adminErrorClass}>{formErrors.subtitle[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="primaryCtaLabel" className={adminLabelClass}>
                Teks Tombol Utama
              </label>
              <input
                id="primaryCtaLabel"
                type="text"
                placeholder="Gabung Wishlist"
                value={formData.primaryCtaLabel}
                onChange={(e) =>
                  setFormData({ ...formData, primaryCtaLabel: e.target.value })
                }
                className={adminInputClass}
              />
            </div>
            <div>
              <label htmlFor="primaryCtaUrl" className={adminLabelClass}>
                Tujuan Tombol Utama
              </label>
              <input
                id="primaryCtaUrl"
                type="text"
                placeholder="#daftar"
                value={formData.primaryCtaUrl}
                onChange={(e) =>
                  setFormData({ ...formData, primaryCtaUrl: e.target.value })
                }
                className={adminInputClass}
              />
            </div>
          </div>

          <details className="rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3">
            <summary className="cursor-pointer text-xs font-semibold text-zinc-700">
              Tombol Kedua (Opsional)
            </summary>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="secondaryCtaLabel" className={adminLabelClass}>
                  Teks Tombol Kedua
                </label>
                <input
                  id="secondaryCtaLabel"
                  type="text"
                  placeholder="Cara Bermain"
                  value={formData.secondaryCtaLabel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      secondaryCtaLabel: e.target.value,
                    })
                  }
                  className={adminInputClass}
                />
              </div>
              <div>
                <label htmlFor="secondaryCtaUrl" className={adminLabelClass}>
                  Tujuan Tombol Kedua
                </label>
                <input
                  id="secondaryCtaUrl"
                  type="text"
                  placeholder="#cara-main"
                  value={formData.secondaryCtaUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      secondaryCtaUrl: e.target.value,
                    })
                  }
                  className={adminInputClass}
                />
              </div>
            </div>
          </details>

          <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 px-3.5 py-2.5">
            <label
              htmlFor="isPublished"
              className="cursor-pointer text-xs font-semibold text-zinc-700"
            >
              Tampilkan seksi Hero di beranda
            </label>
            <input
              id="isPublished"
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) =>
                setFormData({ ...formData, isPublished: e.target.checked })
              }
              className="h-5 w-5 cursor-pointer accent-zinc-900"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className={adminButtonClass("primary", "md", "w-full sm:w-auto")}
            >
              {submitting ? "Menyimpan..." : "Simpan Hero"}
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Visual Hero */}
        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 lg:col-span-5">
          <h2 className="border-b border-zinc-100 pb-3 text-base font-bold text-zinc-900">
            Visual Utama (Gambar / Video)
          </h2>

          {formData.backgroundUrl.trim() && (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
              <Image
                src={
                  resolvePublicAssetUrl(formData.backgroundUrl) ||
                  formData.backgroundUrl
                }
                alt="Pratinjau gambar hero"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          <div>
            <span className={adminLabelClass}>Gambar Utama Hero</span>
            <AssetUploader
              purpose="hero-background"
              onUploaded={handleBackgroundUploaded}
              disabled={submitting}
            />
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] font-medium text-zinc-500">
                Gambar game:
              </span>
              {PRESET_HERO_IMAGES.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, backgroundUrl: preset.url })
                  }
                  className={`rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
                    formData.backgroundUrl === preset.url
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-3">
            <span className={adminLabelClass}>
              Video Gameplay Latar (MP4 Opsional)
            </span>
            {formData.videoUrl.trim() ? (
              <div className="mb-2.5 space-y-2">
                <video
                  src={
                    resolvePublicAssetUrl(formData.videoUrl) ||
                    formData.videoUrl
                  }
                  preload="metadata"
                  muted
                  playsInline
                  controls
                  className="max-h-36 w-full rounded-xl border border-zinc-200"
                  aria-label="Pratinjau video hero"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, videoUrl: "" })}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Hapus video (pakai gambar saja)
                </button>
              </div>
            ) : null}
            <AssetUploader
              purpose="hero-video"
              onUploaded={handleVideoUploaded}
              disabled={submitting}
            />
          </div>
        </div>
      </form>

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
