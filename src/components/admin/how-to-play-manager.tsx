"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { AssetUploader } from "./asset-uploader";
import { Skeleton } from "@/components/ui/skeleton";
import { adminButtonClass } from "./button-styles";
import {
  adminInputClass,
  adminTextareaClass,
  adminLabelClass,
  adminErrorClass,
} from "./form-styles";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { Toast } from "./toast";
import type { UploadedAsset } from "@/lib/assets-client";
import { resolvePublicAssetUrl } from "@/lib/assets-url";

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

const DEFAULT_STEP_SEEDS = [
  {
    step: 1,
    title: "Sentuh Benteng & Ambil Status FRESH",
    description:
      "Mulai dari markas timmu untuk mengisi energi FRESH agar bisa mengejar dan menangkap lawan.",
    mediaUrl: "/art/feature-1.jpg",
  },
  {
    step: 2,
    title: "Kejar & Tangkap Lawan ke Tahanan",
    description:
      "Kejar pemain lawan yang statusnya kalah baru, tekan tombol Tag untuk memasukkannya ke Zona Tahanan.",
    mediaUrl: "/art/feature-2.jpg",
  },
  {
    step: 3,
    title: "Bebaskan Rekan Satu Tim",
    description:
      "Sentuh rantai teman yang tertangkap untuk melakukan Rescue dan lari kembali ke benteng sendiri.",
    mediaUrl: "/art/cover-1.jpg",
  },
  {
    step: 4,
    title: "Rebut Benteng Lawan (BAREN!)",
    description:
      "Manfaatkan celah penjagaan untuk menguasai benteng lawan atau tahan seluruh lawan untuk menang!",
    mediaUrl: "/art/event-match.jpg",
  },
];

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
        setError(json.message || "Gagal memuat cara bermain");
        return;
      }
      const loaded = (json.data?.steps || []).sort(
        (a, b) => a.sortOrder - b.sortOrder || a.step - b.step,
      );
      setSteps(loaded);
      setVideoUrl(json.data?.videoUrl || "");
      if (editingStepId === null) {
        setStepForm((prev) => ({
          ...prev,
          step: loaded.length + 1,
          sortOrder: loaded.length,
        }));
      }
    } catch (err) {
      setError("Gagal memuat cara bermain");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetStepForm = (count = steps.length) => {
    setStepForm({
      step: count + 1,
      title: "",
      description: "",
      mediaUrl: "",
      sortOrder: count,
    });
    setEditingStepId(null);
    setFormErrors({});
  };

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
        body: JSON.stringify({
          ...stepForm,
          step: Math.max(1, stepForm.step || 1),
          sortOrder: editingStepId ? stepForm.sortOrder : stepForm.step - 1,
        }),
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
      setEditingStepId(null);
      await loadData();
      resetStepForm(steps.length + (editingStepId ? 0 : 1));
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

  const moveStep = async (idx: number, dir: "up" | "down") => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    [next[idx], next[target]] = [next[target], next[idx]];
    setSteps(next);
    try {
      await Promise.all(
        next.map((s, i) =>
          fetch(`/api/how-to-play/steps/${s.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ step: i + 1, sortOrder: i }),
          }),
        ),
      );
      setToast({ message: "Urutan langkah diperbarui", type: "success" });
      await loadData();
    } catch {
      setToast({ message: "Gagal mengubah urutan langkah", type: "error" });
    }
  };

  const handleSeedDefaults = async () => {
    setSubmitting(true);
    try {
      for (const [idx, seed] of DEFAULT_STEP_SEEDS.entries()) {
        await fetch("/api/how-to-play/steps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...seed, sortOrder: idx }),
        });
      }
      setToast({
        message: "4 Langkah bermain bawaan berhasil ditambahkan.",
        type: "success",
      });
      await loadData();
    } catch {
      setToast({ message: "Gagal menyalin langkah bawaan", type: "error" });
    } finally {
      setSubmitting(false);
    }
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
      if (editingStepId === deleteTarget.id) resetStepForm();
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
      message: "Video diunggah. Klik Simpan Video untuk menerapkan.",
      type: "success",
    });
  };

  const handleStepMediaUploaded = (asset: UploadedAsset) => {
    setStepForm((prev) => ({ ...prev, mediaUrl: asset.publicUrl }));
    setToast({
      message: "Gambar langkah diunggah. Klik Simpan untuk menerapkan.",
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
      setToast({ message: "Video panduan berhasil disimpan", type: "success" });
      await loadData();
    } catch (err) {
      setToast({ message: "Gagal menyimpan video", type: "error" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="space-y-6"
        role="status"
        aria-label="Memuat data cara bermain"
      >
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-7">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-80 w-full rounded-2xl lg:col-span-5" />
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
            Cara Bermain
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Atur video demo gameplay dan urutan langkah panduan bermain BAREN.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href="/#cara-main"
            target="_blank"
            rel="noopener noreferrer"
            className={adminButtonClass("secondary", "md")}
          >
            <ExternalLink className="h-4 w-4 text-zinc-400" />
            <span>Lihat di Beranda</span>
          </a>
          <button
            type="button"
            onClick={() => resetStepForm()}
            className={adminButtonClass("primary", "md")}
          >
            <Plus className="h-4 w-4" />
            <span>Langkah Baru</span>
          </button>
        </div>
      </header>

      {/* Kartu Ringkas Video Demo */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <h2 className="text-sm font-bold text-zinc-900">
              Video Demo Gameplay (Opsional)
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Unggah cuplikan MP4 singkat (maks. 50 MB). Jika kosong, beranda
              menampilkan cuplikan ilustrasi arena BAREN.
            </p>
          </div>
          <form
            onSubmit={handleVideoSubmit}
            className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:max-w-xl"
          >
            <div className="flex-1">
              <AssetUploader
                purpose="how-to-play-video"
                onUploaded={handleVideoUploaded}
                disabled={submitting}
              />
            </div>
            {videoUrl ? (
              <button
                type="submit"
                disabled={submitting}
                className={adminButtonClass("primary", "md", "shrink-0")}
              >
                {submitting ? "Menyimpan..." : "Simpan Video"}
              </button>
            ) : null}
          </form>
        </div>
      </section>

      {/* Master-Detail Langkah Bermain */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-3 lg:col-span-7">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Daftar Langkah ({steps.length})
          </h2>

          {steps.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
              <Sparkles className="mb-3 h-7 w-7 text-zinc-400" />
              <h3 className="text-base font-semibold text-zinc-900">
                Belum ada langkah tersimpan
              </h3>
              <p className="mt-1 mb-5 max-w-md text-sm text-zinc-500">
                Salin 4 langkah dasar permainan BAREN agar langsung siap diedit.
              </p>
              <button
                type="button"
                onClick={handleSeedDefaults}
                disabled={submitting}
                className={adminButtonClass("primary", "md")}
              >
                <Sparkles className="h-4 w-4" />
                <span>Salin 4 Langkah Bawaan</span>
              </button>
            </div>
          ) : (
            steps.map((item, idx) => {
              const isSelected = editingStepId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleEditStep(item)}
                  className={`flex cursor-pointer items-center gap-3.5 rounded-2xl border bg-white p-3.5 transition-all ${
                    isSelected
                      ? "border-zinc-900 ring-2 ring-zinc-900/10"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-sm font-bold text-zinc-900">
                    {String(item.step).padStart(2, "0")}
                  </div>

                  {item.mediaUrl && (
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                      <Image
                        src={
                          resolvePublicAssetUrl(item.mediaUrl) || item.mediaUrl
                        }
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-zinc-900">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        void moveStep(idx, "up");
                      }}
                      className="rounded-lg border border-zinc-200 p-1 text-zinc-600 hover:bg-zinc-50 disabled:opacity-25"
                      title="Naikkan langkah"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === steps.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        void moveStep(idx, "down");
                      }}
                      className="rounded-lg border border-zinc-200 p-1 text-zinc-600 hover:bg-zinc-50 disabled:opacity-25"
                      title="Turunkan langkah"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditStep(item);
                      }}
                      className={adminButtonClass("secondary", "icon-sm")}
                      title="Edit langkah"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({ id: item.id, title: item.title });
                      }}
                      className={adminButtonClass("danger", "icon-sm")}
                      title="Hapus langkah"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Form Inspector Langkah */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleStepSubmit}
            className="sticky top-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"
          >
            <div className="border-b border-zinc-100 pb-3.5">
              <h2 className="text-base font-bold text-zinc-900">
                {editingStepId ? "Edit Langkah" : "Tambah Langkah"}
              </h2>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label htmlFor="step" className={adminLabelClass}>
                  Nomor Langkah
                </label>
                <input
                  id="step"
                  type="number"
                  min={1}
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

              <div className="col-span-3">
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
                  placeholder="Contoh: Sentuh Benteng & Ambil FRESH"
                />
                {formErrors.title && (
                  <p className={adminErrorClass}>{formErrors.title[0]}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className={adminLabelClass}>
                Penjelasan Singkat
              </label>
              <textarea
                id="description"
                value={stepForm.description}
                onChange={(e) =>
                  setStepForm({ ...stepForm, description: e.target.value })
                }
                className={adminTextareaClass}
                rows={3}
                placeholder="Contoh: Sentuh markas timmu untuk mengaktifkan status FRESH agar bisa menangkap lawan."
              />
            </div>

            <div>
              <span className={adminLabelClass}>Gambar Langkah (Opsional)</span>
              {stepForm.mediaUrl.trim() ? (
                <div className="relative mb-2.5 aspect-video w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                  <Image
                    src={
                      resolvePublicAssetUrl(stepForm.mediaUrl) ||
                      stepForm.mediaUrl
                    }
                    alt="Pratinjau langkah"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : null}
              <AssetUploader
                purpose="how-to-play-media"
                onUploaded={handleStepMediaUploaded}
                disabled={submitting}
              />
            </div>

            <div className="flex gap-2 border-t border-zinc-100 pt-3">
              <button
                type="submit"
                disabled={submitting}
                className={adminButtonClass("primary", "md", "flex-1")}
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
              {editingStepId && (
                <button
                  type="button"
                  onClick={() => resetStepForm()}
                  className={adminButtonClass("secondary", "md")}
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

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
