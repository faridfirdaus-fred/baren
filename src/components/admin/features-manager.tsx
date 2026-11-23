"use client";

import { useEffect, useState } from "react";

import { AssetUploader } from "./asset-uploader";
import { adminButtonClass } from "./button-styles";
import {
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
  iconUrl: "",
  sortOrder: 0,
};

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

  const resetForm = () => {
    setFormData(EMPTY_FORM);
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
      setItems(parsed.data);
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
      message:
        "Ikon berhasil diunggah. Klik 'Simpan' untuk menerapkan perubahan.",
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
          body: JSON.stringify(formData),
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
      resetForm();
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

  if (loading) return <p>Memuat fitur...</p>;

  return (
    <div>
      {error && (
        <p
          role="alert"
          className="mb-6 border border-ember/40 bg-ember/10 p-4 text-sm text-ember"
        >
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mb-8 border border-line bg-ink-800 p-6"
      >
        <h2 className="mb-4 font-display text-xl font-bold uppercase tracking-wider text-sand">
          {editingId ? "Edit Fitur" : "Tambah Fitur"}
        </h2>

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
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
              placeholder="Contoh: Arena Taktikal 5v5"
            />
            {formErrors.title && (
              <p className="mt-1 text-sm text-ember">{formErrors.title[0]}</p>
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
            {formErrors.sortOrder && (
              <p className="mt-1 text-sm text-ember">
                {formErrors.sortOrder[0]}
              </p>
            )}
          </div>
        </div>

        <div className="mb-4">
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
            placeholder="Deskripsi singkat mengenai keunggulan fitur game ini..."
          />
          {formErrors.description && (
            <p className="mt-1 text-sm text-ember">
              {formErrors.description[0]}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="feature-icon-url" className={adminLabelClass}>
            Ikon Fitur
          </label>
          <input
            id="feature-icon-url"
            type="url"
            value={formData.iconUrl}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, iconUrl: e.target.value }))
            }
            disabled={submitting}
            placeholder="https://... (atau unggah berkas di bawah)"
            className={adminInputClass}
          />
          {formErrors.iconUrl && (
            <p className="mt-1 text-sm text-ember">{formErrors.iconUrl[0]}</p>
          )}
          {formData.iconUrl.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolvePublicAssetUrl(formData.iconUrl) || formData.iconUrl}
              alt="Pratinjau ikon fitur"
              className="mt-2 h-14 w-14 rounded border border-line bg-ink object-contain p-1"
            />
          ) : null}
          <div className="mt-2">
            <AssetUploader
              purpose="ikon"
              onUploaded={handleIconUploaded}
              disabled={submitting}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={submitting}
            className={adminButtonClass("primary", "md")}
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
              onClick={resetForm}
              disabled={submitting}
              className={adminButtonClass("secondary", "md")}
            >
              Batal
            </button>
          )}
        </div>
      </form>

      <h2 className="mb-4 font-bold text-sand">Daftar Fitur</h2>
      {items.length === 0 ? (
        <p className="text-sand-600">
          Belum ada fitur. Tambahkan fitur pertama.
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              data-testid="feature-item"
              className="flex gap-3 border border-line bg-ink-800 p-4"
            >
              {item.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolvePublicAssetUrl(item.iconUrl) || item.iconUrl}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded bg-ink object-contain p-1"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-sand/10 text-xs text-sand-600"
                >
                  Ikon
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider text-sand-600">
                  Urutan {item.sortOrder}
                </p>
                <h3 className="font-bold text-sand">{item.title}</h3>
                {item.description ? (
                  <p className="mt-1 text-sm text-sand-600">
                    {item.description}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    aria-label={`Edit fitur ${item.title}`}
                    className={adminButtonClass("secondary", "sm")}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({ id: item.id, title: item.title })
                    }
                    aria-label={`Hapus fitur ${item.title}`}
                    className={adminButtonClass("danger", "sm")}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

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
