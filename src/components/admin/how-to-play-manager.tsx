"use client";

import { useEffect, useState } from "react";
import { AssetUploader } from "./asset-uploader";
import { adminButtonClass } from "./button-styles";
import {
  adminInputClass,
  adminTextareaClass,
  adminLabelClass,
  adminErrorClass,
  adminHelpClass,
} from "./form-styles";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { Toast } from "./toast";
import type { UploadedAsset } from "@/lib/assets-client";

interface HowToPlayStep {
  id: number;
  step: number;
  title: string;
  description: string | null;
  mediaUrl: string | null;
  sortOrder: number;
}

interface StepFormData {
  step: number;
  title: string;
  description: string;
  mediaUrl: string;
  sortOrder: number;
}

interface ApiResponse {
  ok: boolean;
  data?: { steps: HowToPlayStep[]; videoUrl: string | null };
  message?: string;
  fields?: Record<string, string[]>;
}

export function HowToPlayManager() {
  const [steps, setSteps] = useState<HowToPlayStep[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stepForm, setStepForm] = useState<StepFormData>({
    step: 1,
    title: "",
    description: "",
    mediaUrl: "",
    sortOrder: 0,
  });
  const [editingStepId, setEditingStepId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/how-to-play");
      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        setError(json.message || "Gagal memuat how-to-play");
        return;
      }
      setSteps(
        (json.data?.steps || []).sort((a, b) => a.sortOrder - b.sortOrder),
      );
      setVideoUrl(json.data?.videoUrl || "");
    } catch (err) {
      setError("Gagal memuat how-to-play");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, []);

  const handleStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      const url = editingStepId
        ? `/api/how-to-play/steps/${editingStepId}`
        : "/api/how-to-play/steps";
      const method = editingStepId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stepForm),
      });
      const json = (await res.json()) as ApiResponse;

      if (!json.ok) {
        if (json.fields) {
          setFormErrors(json.fields);
        } else {
          setToast({
            message: json.message || "Gagal menyimpan langkah",
            type: "error",
          });
        }
        return;
      }

      setToast({
        message: editingStepId ? "Langkah diperbarui" : "Langkah ditambahkan",
        type: "success",
      });
      setStepForm({
        step: 1,
        title: "",
        description: "",
        mediaUrl: "",
        sortOrder: 0,
      });
      setEditingStepId(null);
      await loadData();
    } catch (err) {
      setToast({ message: "Gagal menyimpan langkah", type: "error" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStep = (item: HowToPlayStep) => {
    setStepForm({
      step: item.step,
      title: item.title,
      description: item.description || "",
      mediaUrl: item.mediaUrl || "",
      sortOrder: item.sortOrder,
    });
    setEditingStepId(item.id);
    setFormErrors({});
  };

  const handleCancelEdit = () => {
    setStepForm({
      step: 1,
      title: "",
      description: "",
      mediaUrl: "",
      sortOrder: 0,
    });
    setEditingStepId(null);
    setFormErrors({});
  };

  const handleDeleteStep = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/how-to-play/steps/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        setToast({
          message: json.message || "Gagal menghapus langkah",
          type: "error",
        });
        return;
      }
      setToast({ message: "Langkah dihapus", type: "success" });
      await loadData();
    } catch (err) {
      setToast({ message: "Gagal menghapus langkah", type: "error" });
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleVideoUploaded = (asset: UploadedAsset) => {
    setVideoUrl(asset.publicUrl);
    setToast({
      message:
        "Video demo berhasil diunggah ke R2. Klik 'Simpan Video' untuk menerapkan perubahan.",
      type: "success",
    });
  };

  const handleStepMediaUploaded = (asset: UploadedAsset) => {
    setStepForm((prev) => ({ ...prev, mediaUrl: asset.publicUrl }));
    setToast({
      message:
        "Media langkah berhasil diunggah ke R2. Klik 'Simpan' untuk menerapkan perubahan.",
      type: "success",
    });
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/how-to-play/video", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      });
      const json = (await res.json()) as ApiResponse;

      if (!json.ok) {
        setToast({
          message: json.message || "Gagal menyimpan video",
          type: "error",
        });
        return;
      }

      setToast({ message: "Video demo disimpan", type: "success" });
      await loadData();
    } catch (err) {
      setToast({ message: "Gagal menyimpan video", type: "error" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Memuat how-to-play...</p>;
  if (error) return <p className="text-ember">{error}</p>;

  return (
    <div>
      <div className="mb-8 border border-line bg-ink-800 p-6">
        <h3 className="mb-4 font-display text-xl font-bold uppercase tracking-wider text-sand">
          Video Demo
        </h3>
        <form onSubmit={handleVideoSubmit} className="space-y-4">
          <div>
            <label htmlFor="videoUrl" className={adminLabelClass}>
              URL Video Demo
            </label>
            <input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className={adminInputClass}
              placeholder="https://... (MP4)"
            />
            <p className={adminHelpClass}>
              Diisi otomatis saat mengunggah via R2 di bawah, atau masukkan
              tautan MP4 langsung.
            </p>
            {videoUrl.trim() ? (
              <video
                src={videoUrl}
                preload="metadata"
                muted
                playsInline
                controls
                className="mt-2 max-h-48 w-full rounded border"
                aria-label="Pratinjau video demo"
              />
            ) : null}
            <div className="mt-2">
              <p className="mb-1 text-sm font-medium">
                Unggah Video Demo Baru ke R2 (MP4 ≤ 50 MB)
              </p>
              <AssetUploader
                purpose="how-to-play-video"
                onUploaded={handleVideoUploaded}
                disabled={submitting}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={adminButtonClass("primary", "md")}
          >
            {submitting ? "Menyimpan..." : "Simpan Video"}
          </button>
        </form>
      </div>

      <div className="mb-8 border border-line bg-ink-800 p-6">
        <h3 className="mb-4 font-display text-xl font-bold uppercase tracking-wider text-sand">
          {editingStepId ? "Edit Langkah" : "Tambah Langkah"}
        </h3>
        <form onSubmit={handleStepSubmit} className="space-y-4">
          <div>
            <label htmlFor="step" className={adminLabelClass}>
              Nomor Langkah *
            </label>
            <input
              id="step"
              type="number"
              value={stepForm.step}
              onChange={(e) =>
                setStepForm({ ...stepForm, step: Number(e.target.value) })
              }
              className={adminInputClass}
              required
            />
            {formErrors.step && (
              <p className={adminErrorClass}>{formErrors.step[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="title" className={adminLabelClass}>
              Judul *
            </label>
            <input
              id="title"
              type="text"
              value={stepForm.title}
              onChange={(e) =>
                setStepForm({ ...stepForm, title: e.target.value })
              }
              className={adminInputClass}
              required
            />
            {formErrors.title && (
              <p className={adminErrorClass}>{formErrors.title[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className={adminLabelClass}>
              Deskripsi
            </label>
            <textarea
              id="description"
              value={stepForm.description}
              onChange={(e) =>
                setStepForm({ ...stepForm, description: e.target.value })
              }
              className={adminTextareaClass}
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="mediaUrl" className={adminLabelClass}>
              URL Media
            </label>
            <input
              id="mediaUrl"
              type="url"
              value={stepForm.mediaUrl}
              onChange={(e) =>
                setStepForm({ ...stepForm, mediaUrl: e.target.value })
              }
              className={adminInputClass}
              placeholder="https://... (gambar/video)"
            />
            <p className={adminHelpClass}>
              Diisi otomatis saat mengunggah via R2 di bawah, atau masukkan
              tautan langsung.
            </p>
            {stepForm.mediaUrl.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={stepForm.mediaUrl}
                alt="Pratinjau media langkah"
                className="mt-2 max-h-48 w-full rounded border object-cover"
              />
            ) : null}
            <div className="mt-2">
              <p className="mb-1 text-sm font-medium">
                Unggah Media Langkah ke R2 (gambar ≤ 5 MB / MP4 ≤ 50 MB)
              </p>
              <AssetUploader
                purpose="how-to-play-media"
                onUploaded={handleStepMediaUploaded}
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <label htmlFor="sortOrder" className={adminLabelClass}>
              Urutan
            </label>
            <input
              id="sortOrder"
              type="number"
              value={stepForm.sortOrder}
              onChange={(e) =>
                setStepForm({ ...stepForm, sortOrder: Number(e.target.value) })
              }
              className={adminInputClass}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className={adminButtonClass("primary", "md")}
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
            {editingStepId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className={adminButtonClass("secondary", "md")}
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      <h3 className="mb-4 font-display text-xl font-bold uppercase tracking-wider text-sand">
        Daftar Langkah
      </h3>
      {steps.length === 0 ? (
        <p className="text-sand-600">Belum ada langkah.</p>
      ) : (
        <div className="space-y-4">
          {steps.map((item) => (
            <div key={item.id} className="border border-line bg-ink-800 p-4">
              <h4 className="font-bold">
                Langkah {item.step}: {item.title}
              </h4>
              <p className="text-sm text-sand-600 mt-2">{item.description}</p>
              {item.mediaUrl && (
                <p className={adminHelpClass}>Media: {item.mediaUrl}</p>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => handleEditStep(item)}
                  className={adminButtonClass("secondary", "sm")}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget({ id: item.id, title: item.title })
                  }
                  className={adminButtonClass("danger", "sm")}
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        title="Hapus Langkah"
        message={`Yakin hapus "${deleteTarget?.title}"?`}
        onConfirm={handleDeleteStep}
        onCancel={() => setDeleteTarget(null)}
      />

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
