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
  adminErrorClass,
  adminInputClass,
  adminTextareaClass,
  adminLabelClass,
} from "./form-styles";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { Toast } from "./toast";
import {
  parseAdminFeatures,
  type AdminFeature,
} from "@/lib/admin-features-client";
import type { UploadedAsset } from "@/lib/assets-client";
import { parseApiEnvelope } from "@/lib/api/client-response";
import { resolvePublicAssetUrl } from "@/lib/assets-url";

type FeatureFormData = {
  title: string;
  description: string;
  iconUrl: string;
  sortOrder: number;
};

const EMPTY_FORM: FeatureFormData = {
  title: "",
  description: "",
  iconUrl: "/art/feature-1.jpg",
  sortOrder: 0,
};

const PRESET_FEATURE_IMAGES = [
  { label: "Arena 2 vs 2", url: "/art/feature-1.jpg" },
  { label: "Rebut & Rescue", url: "/art/feature-2.jpg" },
  { label: "Pasar Ramai", url: "/art/feature-3.jpg" },
];

const DEFAULT_FEATURE_SEEDS = [
  {
    title: "Duel Tim 2 vs 2",
    description:
      "Kompak bersama partner dalam satu layar, atur taktik pancingan, dan kejar lawan sebelum mereka menyentuh bentengmu.",
    iconUrl: "/art/feature-1.jpg",
  },
  {
    title: "Tag, Tahanan & Rescue",
    description:
      "Sentuh markas untuk mendapat status FRESH, tangkap lawan ke zona tahanan, atau selamatkan kawan untuk membalikkan keadaan.",
    iconUrl: "/art/feature-2.jpg",
  },
  {
    title: "Arena Kampung Variatif",
    description:
      "Bertanding di Lapang Kampung, Pasar Ramai penuh gerobak, hingga Alun-Alun Hujan yang licin dan menantang.",
    iconUrl: "/art/feature-3.jpg",
  },
];

export function FeaturesManager() {
  const [items, setItems] = useState<AdminFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FeatureFormData>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
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

  const resetForm = (nextOrder = items.length) => {
    setFormData({ ...EMPTY_FORM, sortOrder: nextOrder });
    setEditingId(null);
    setFormErrors({});
  };

  const loadFeatures = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/features", { cache: "no-store" });
      const parsed = parseAdminFeatures(await res.json());
      if (!parsed.ok) {
        setError(parsed.message);
        return;
      }
      const sorted = [...parsed.data].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.id - b.id,
      );
      setItems(sorted);
    } catch (err) {
      setError("Gagal memuat fitur");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadFeatures();
  }, []);

  const handleIconUploaded = (asset: UploadedAsset) => {
    setFormData((prev) => ({ ...prev, iconUrl: asset.publicUrl }));
    setToast({
      message: "Gambar fitur diunggah. Klik Simpan untuk menerapkan.",
      type: "success",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      const isEditing = editingId !== null;
      const res = await fetch(
        isEditing ? `/api/features/${editingId}` : "/api/features",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            sortOrder: isEditing
              ? formData.sortOrder
              : formData.sortOrder || items.length,
          }),
        },
      );
      const parsed = parseApiEnvelope<AdminFeature>(await res.json());

      if (!parsed.ok) {
        if (parsed.fields) {
          setFormErrors(parsed.fields);
        } else {
          setToast({
            message: parsed.message || "Gagal menyimpan fitur",
            type: "error",
          });
        }
        return;
      }

      setToast({
        message: isEditing ? "Fitur diperbarui" : "Fitur ditambahkan",
        type: "success",
      });
      resetForm(items.length + (isEditing ? 0 : 1));
      await loadFeatures();
    } catch (err) {
      setToast({ message: "Gagal menyimpan fitur", type: "error" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: AdminFeature) => {
    setFormData({
      title: item.title,
      description: item.description ?? "",
      iconUrl: item.iconUrl ?? "",
      sortOrder: item.sortOrder,
    });
    setEditingId(item.id);
    setFormErrors({});
  };

  const moveItem = async (idx: number, dir: "up" | "down") => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    setItems(next);
    try {
      await Promise.all(
        next.map((f, i) =>
          fetch(`/api/features/${f.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sortOrder: i }),
          }),
        ),
      );
      setToast({ message: "Urutan fitur diperbarui", type: "success" });
      await loadFeatures();
    } catch {
      setToast({ message: "Gagal memperbarui urutan", type: "error" });
    }
  };

  const handleSeedDefaults = async () => {
    setSubmitting(true);
    try {
      for (const [idx, seed] of DEFAULT_FEATURE_SEEDS.entries()) {
        await fetch("/api/features", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...seed, sortOrder: idx }),
        });
      }
      setToast({
        message: "3 Fitur bawaan berhasil ditambahkan.",
        type: "success",
      });
      await loadFeatures();
    } catch {
      setToast({ message: "Gagal menyalin fitur bawaan", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/features/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const parsed = parseApiEnvelope<AdminFeature>(await res.json());
      if (!parsed.ok) {
        setToast({
          message: parsed.message || "Gagal menghapus fitur",
          type: "error",
        });
        return;
      }
      setToast({ message: "Fitur dihapus", type: "success" });
      if (editingId === deleteTarget.id) resetForm();
      await loadFeatures();
    } catch (err) {
      setToast({ message: "Gagal menghapus fitur", type: "error" });
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-label="Memuat fitur">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-7">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-2xl lg:col-span-5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Kelola Fitur
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Atur kartu keunggulan permainan di seksi Fitur Game pada beranda.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href="/#fitur"
            target="_blank"
            rel="noopener noreferrer"
            className={adminButtonClass("secondary", "md")}
          >
            <ExternalLink className="h-4 w-4 text-zinc-400" />
            <span>Lihat di Beranda</span>
          </a>
          <button
            type="button"
            onClick={() => resetForm()}
            className={adminButtonClass("primary", "md")}
          >
            <Plus className="h-4 w-4" />
            <span>Fitur Baru</span>
          </button>
        </div>
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Daftar Fitur */}
        <div className="flex flex-col gap-3 lg:col-span-7">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Daftar Fitur ({items.length})
          </h2>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
              <Sparkles className="mb-3 h-7 w-7 text-zinc-400" />
              <h3 className="text-base font-semibold text-zinc-900">
                Belum ada fitur tersimpan
              </h3>
              <p className="mt-1 mb-5 max-w-md text-sm text-zinc-500">
                Salin 3 fitur bawaan game BAREN agar langsung bisa diedit, atau
                tambahkan fitur baru melalui formulir di samping.
              </p>
              <button
                type="button"
                onClick={handleSeedDefaults}
                disabled={submitting}
                className={adminButtonClass("primary", "md")}
              >
                <Sparkles className="h-4 w-4" />
                <span>Salin 3 Fitur Bawaan</span>
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item, idx) => {
                const isSelected = editingId === item.id;
                return (
                  <li
                    key={item.id}
                    data-testid="feature-item"
                    onClick={() => handleEdit(item)}
                    className={`flex cursor-pointer items-center gap-3.5 rounded-2xl border bg-white p-3.5 transition-all ${
                      isSelected
                        ? "border-zinc-900 ring-2 ring-zinc-900/10"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                      {item.iconUrl ? (
                        <Image
                          src={
                            resolvePublicAssetUrl(item.iconUrl) || item.iconUrl
                          }
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-zinc-400">
                          0{idx + 1}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-medium text-zinc-400">
                        Fitur #{idx + 1}
                      </span>
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
                          void moveItem(idx, "up");
                        }}
                        className="rounded-lg border border-zinc-200 p-1 text-zinc-600 hover:bg-zinc-50 disabled:opacity-25"
                        title="Naikkan urutan"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === items.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          void moveItem(idx, "down");
                        }}
                        className="rounded-lg border border-zinc-200 p-1 text-zinc-600 hover:bg-zinc-50 disabled:opacity-25"
                        title="Turunkan urutan"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item);
                        }}
                        aria-label={`Edit fitur ${item.title}`}
                        className={adminButtonClass("secondary", "sm")}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only">Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({ id: item.id, title: item.title });
                        }}
                        aria-label={`Hapus fitur ${item.title}`}
                        className={adminButtonClass("danger", "sm")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only">Hapus</span>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Form Inspector */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSubmit}
            className="sticky top-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5">
              <h2 className="text-base font-bold text-zinc-900">
                {editingId ? "Edit Fitur" : "Tambah Fitur"}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="sm:col-span-3">
                <label htmlFor="feature-title" className={adminLabelClass}>
                  Judul *
                </label>
                <input
                  id="feature-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  disabled={submitting}
                  required
                  className={adminInputClass}
                  placeholder="Contoh: Duel Tim 2 vs 2"
                />
                {formErrors.title && (
                  <p className={adminErrorClass}>{formErrors.title[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="feature-sort-order" className={adminLabelClass}>
                  Urutan
                </label>
                <input
                  id="feature-sort-order"
                  type="number"
                  min={0}
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sortOrder: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  disabled={submitting}
                  className={adminInputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="feature-description" className={adminLabelClass}>
                Deskripsi
              </label>
              <textarea
                id="feature-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                disabled={submitting}
                rows={3}
                className={adminTextareaClass}
                placeholder="Contoh: Kompak bersama rekan satu tim dalam satu layar untuk merebut benteng lawan."
              />
              {formErrors.description && (
                <p className={adminErrorClass}>{formErrors.description[0]}</p>
              )}
            </div>

            <div>
              <span className={adminLabelClass}>Gambar / Visual Fitur</span>
              {formData.iconUrl.trim() ? (
                <div className="relative mb-2.5 aspect-video w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                  <Image
                    src={
                      resolvePublicAssetUrl(formData.iconUrl) ||
                      formData.iconUrl
                    }
                    alt="Pratinjau visual fitur"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : null}
              <AssetUploader
                purpose="landing-image"
                onUploaded={handleIconUploaded}
                disabled={submitting}
              />
              {formErrors.iconUrl && (
                <p className={adminErrorClass}>{formErrors.iconUrl[0]}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[11px] font-medium text-zinc-500">
                  Gambar game:
                </span>
                {PRESET_FEATURE_IMAGES.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, iconUrl: preset.url }))
                    }
                    className={`rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
                      formData.iconUrl === preset.url
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
              <button
                type="submit"
                disabled={submitting}
                className={adminButtonClass("primary", "md", "flex-1")}
              >
                {submitting
                  ? "Menyimpan..."
                  : editingId
                    ? "Simpan Perubahan"
                    : "Tambah Fitur"}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  onClick={() => resetForm()}
                  disabled={submitting}
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
        title="Hapus Fitur"
        message={`Yakin hapus "${deleteTarget?.title}"?`}
        onConfirm={handleDelete}
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
