"use client";

import { useEffect, useState } from "react";
import { AssetUploader } from "./asset-uploader";
import { Toast } from "./toast";
import type { UploadedAsset } from "@/lib/assets-client";

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

export function HeroManager() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<HeroData>({
    title: "",
    subtitle: "",
    backgroundUrl: "",
    videoUrl: "",
    primaryCtaLabel: "",
    primaryCtaUrl: "",
    secondaryCtaLabel: "",
    secondaryCtaUrl: "",
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
        setFormData(json.data.hero);
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
      message:
        "Video berhasil diunggah ke R2. Klik 'Simpan Hero' untuk menerapkan perubahan.",
      type: "success",
    });
  };

  const handleBackgroundUploaded = (asset: UploadedAsset) => {
    setFormData((prev) => ({ ...prev, backgroundUrl: asset.publicUrl }));
    setToast({
      message:
        "Background berhasil diunggah ke R2. Klik 'Simpan Hero' untuk menerapkan perubahan.",
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
        body: JSON.stringify(formData),
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

      setToast({ message: "Hero disimpan", type: "success" });
      await loadHero();
    } catch (err) {
      setToast({ message: "Gagal menyimpan hero", type: "error" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Memuat hero...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block font-medium mb-1">
            Judul *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
            required
          />
          {formErrors.title && (
            <p className="text-red-600 text-sm mt-1">{formErrors.title[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="subtitle" className="block font-medium mb-1">
            Subjudul
          </label>
          <input
            id="subtitle"
            type="text"
            value={formData.subtitle}
            onChange={(e) =>
              setFormData({ ...formData, subtitle: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />
          {formErrors.subtitle && (
            <p className="text-red-600 text-sm mt-1">
              {formErrors.subtitle[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="videoUrl" className="block font-medium mb-1">
            Video URL
          </label>
          <input
            id="videoUrl"
            type="url"
            value={formData.videoUrl}
            onChange={(e) =>
              setFormData({ ...formData, videoUrl: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
            placeholder="https://... (MP4)"
          />
          <p className="text-xs text-gray-500 mt-1">
            Diisi otomatis saat mengunggah via R2 di bawah, atau masukkan tautan
            MP4 langsung.
          </p>
          {formErrors.videoUrl && (
            <p className="text-red-600 text-sm mt-1">
              {formErrors.videoUrl[0]}
            </p>
          )}
          {formData.videoUrl.trim() ? (
            <video
              src={formData.videoUrl}
              preload="metadata"
              muted
              playsInline
              controls
              className="mt-2 max-h-48 w-full rounded border"
              aria-label="Pratinjau video hero"
            />
          ) : null}
          <div className="mt-2">
            <p className="mb-1 text-sm font-medium">
              Unggah Video Baru ke R2 (MP4 ≤ 50 MB)
            </p>
            <AssetUploader
              purpose="hero-video"
              onUploaded={handleVideoUploaded}
              disabled={submitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor="backgroundUrl" className="block font-medium mb-1">
            Background URL
          </label>
          <input
            id="backgroundUrl"
            type="url"
            value={formData.backgroundUrl}
            onChange={(e) =>
              setFormData({ ...formData, backgroundUrl: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
            placeholder="https://... (JPG/PNG/WebP)"
          />
          <p className="text-xs text-gray-500 mt-1">
            Diisi otomatis saat mengunggah via R2 di bawah, atau masukkan tautan
            gambar langsung.
          </p>
          {formErrors.backgroundUrl && (
            <p className="text-red-600 text-sm mt-1">
              {formErrors.backgroundUrl[0]}
            </p>
          )}
          {formData.backgroundUrl.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={formData.backgroundUrl}
              alt="Pratinjau background hero"
              className="mt-2 max-h-48 w-full rounded border object-cover"
            />
          ) : null}
          <div className="mt-2">
            <p className="mb-1 text-sm font-medium">
              Unggah Background Baru ke R2 (JPG/PNG/WebP ≤ 5 MB)
            </p>
            <AssetUploader
              purpose="hero-background"
              onUploaded={handleBackgroundUploaded}
              disabled={submitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor="primaryCtaLabel" className="block font-medium mb-1">
            CTA Utama Label
          </label>
          <input
            id="primaryCtaLabel"
            type="text"
            value={formData.primaryCtaLabel}
            onChange={(e) =>
              setFormData({ ...formData, primaryCtaLabel: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />
          {formErrors.primaryCtaLabel && (
            <p className="text-red-600 text-sm mt-1">
              {formErrors.primaryCtaLabel[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="primaryCtaUrl" className="block font-medium mb-1">
            CTA Utama URL
          </label>
          <input
            id="primaryCtaUrl"
            type="url"
            value={formData.primaryCtaUrl}
            onChange={(e) =>
              setFormData({ ...formData, primaryCtaUrl: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />
          {formErrors.primaryCtaUrl && (
            <p className="text-red-600 text-sm mt-1">
              {formErrors.primaryCtaUrl[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="secondaryCtaLabel" className="block font-medium mb-1">
            CTA Sekunder Label
          </label>
          <input
            id="secondaryCtaLabel"
            type="text"
            value={formData.secondaryCtaLabel}
            onChange={(e) =>
              setFormData({ ...formData, secondaryCtaLabel: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />
          {formErrors.secondaryCtaLabel && (
            <p className="text-red-600 text-sm mt-1">
              {formErrors.secondaryCtaLabel[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="secondaryCtaUrl" className="block font-medium mb-1">
            CTA Sekunder URL
          </label>
          <input
            id="secondaryCtaUrl"
            type="url"
            value={formData.secondaryCtaUrl}
            onChange={(e) =>
              setFormData({ ...formData, secondaryCtaUrl: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />
          {formErrors.secondaryCtaUrl && (
            <p className="text-red-600 text-sm mt-1">
              {formErrors.secondaryCtaUrl[0]}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isPublished"
            type="checkbox"
            checked={formData.isPublished}
            onChange={(e) =>
              setFormData({ ...formData, isPublished: e.target.checked })
            }
          />
          <label htmlFor="isPublished">Terbit</label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Menyimpan..." : "Simpan Hero"}
        </button>
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
