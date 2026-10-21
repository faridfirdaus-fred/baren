"use client";

import { useEffect, useState } from "react";
import { AssetUploader } from "./asset-uploader";
import { adminButtonClass } from "./button-styles";
import {
  adminInputClass,
  adminTextareaClass,
  adminSelectClass,
  adminCheckboxClass,
  adminLabelClass,
  adminErrorClass,
  adminHelpClass,
} from "./form-styles";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { Toast } from "./toast";
import type { UploadedAsset } from "@/lib/assets-client";

interface LandingCard {
  id: number;
  slot: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  body: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  tone: "dark" | "light" | "ember";
  sortOrder: number;
  isPublished: number;
}

interface LandingCardFormData {
  slot: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
  imageUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  tone: "dark" | "light" | "ember";
  sortOrder: number;
  isPublished: boolean;
}

interface ApiResponse {
  ok: boolean;
  data?: LandingCard[];
  message?: string;
  fields?: Record<string, string[]>;
}

export function LandingCardsManager() {
  const [items, setItems] = useState<LandingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LandingCardFormData>({
    slot: "general",
    eyebrow: "",
    title: "",
    subtitle: "",
    body: "",
    imageUrl: "",
    ctaLabel: "",
    ctaUrl: "",
    tone: "dark",
    sortOrder: 0,
    isPublished: true,
  });
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

  const loadCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/landing-cards");
      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        setError(json.message || "Gagal memuat kartu");
        return;
      }
      setItems((json.data || []).sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (err) {
      setError("Gagal memuat kartu");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCards();
  }, []);

  const handleImageUploaded = (asset: UploadedAsset) => {
    setFormData((prev) => ({ ...prev, imageUrl: asset.publicUrl }));
    setToast({
      message:
        "Gambar berhasil diunggah ke R2. Klik 'Simpan' untuk menerapkan perubahan.",
      type: "success",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      const url = editingId
        ? `/api/landing-cards/${editingId}`
        : "/api/landing-cards";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          isPublished: formData.isPublished ? 1 : 0,
        }),
      });
      const json = (await res.json()) as ApiResponse;

      if (!json.ok) {
        if (json.fields) {
          setFormErrors(json.fields);
        } else {
          setToast({
            message: json.message || "Gagal menyimpan kartu",
            type: "error",
          });
        }
        return;
      }

      setToast({
        message: editingId ? "Kartu diperbarui" : "Kartu ditambahkan",
        type: "success",
      });
      setFormData({
        slot: "general",
        eyebrow: "",
        title: "",
        subtitle: "",
        body: "",
        imageUrl: "",
        ctaLabel: "",
        ctaUrl: "",
        tone: "dark",
        sortOrder: 0,
        isPublished: true,
      });
      setEditingId(null);
      await loadCards();
    } catch (err) {
      setToast({ message: "Gagal menyimpan kartu", type: "error" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: LandingCard) => {
    setFormData({
      slot: item.slot,
      eyebrow: item.eyebrow || "",
      title: item.title,
      subtitle: item.subtitle || "",
      body: item.body || "",
      imageUrl: item.imageUrl || "",
      ctaLabel: item.ctaLabel || "",
      ctaUrl: item.ctaUrl || "",
      tone: item.tone,
      sortOrder: item.sortOrder,
      isPublished: item.isPublished === 1,
    });
    setEditingId(item.id);
    setFormErrors({});
  };

  const handleCancelEdit = () => {
    setFormData({
      slot: "general",
      eyebrow: "",
      title: "",
      subtitle: "",
      body: "",
      imageUrl: "",
      ctaLabel: "",
      ctaUrl: "",
      tone: "dark",
      sortOrder: 0,
      isPublished: true,
    });
    setEditingId(null);
    setFormErrors({});
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/landing-cards/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        setToast({
          message: json.message || "Gagal menghapus kartu",
          type: "error",
        });
        return;
      }
      setToast({ message: "Kartu dihapus", type: "success" });
      await loadCards();
    } catch (err) {
      setToast({ message: "Gagal menghapus kartu", type: "error" });
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleMoveUp = async (id: number) => {
    const idx = items.findIndex((c) => c.id === id);
    if (idx <= 0) return;
    const newOrder = [...items];
    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    await reorder(newOrder.map((c) => c.id));
  };

  const handleMoveDown = async (id: number) => {
    const idx = items.findIndex((c) => c.id === id);
    if (idx < 0 || idx >= items.length - 1) return;
    const newOrder = [...items];
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    await reorder(newOrder.map((c) => c.id));
  };

  const reorder = async (ids: number[]) => {
    try {
      const res = await fetch("/api/landing-cards/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        setToast({
          message: json.message || "Gagal mengubah urutan",
          type: "error",
        });
        return;
      }
      await loadCards();
    } catch (err) {
      setToast({ message: "Gagal mengubah urutan", type: "error" });
      console.error(err);
    }
  };

  if (loading) return <p>Memuat kartu...</p>;
  if (error) return <p className="text-ember">{error}</p>;

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="mb-8 space-y-4 border border-line bg-ink-800 p-6"
      >
        <h3 className="mb-4 font-display text-xl font-bold uppercase tracking-wider text-sand">
          {editingId ? "Edit Kartu" : "Tambah Kartu"}
        </h3>

        <div>
          <label htmlFor="slot" className={adminLabelClass}>
            Slot
          </label>
          <input
            id="slot"
            type="text"
            value={formData.slot}
            onChange={(e) => setFormData({ ...formData, slot: e.target.value })}
            className={adminInputClass}
          />
          {formErrors.slot && (
            <p className={adminErrorClass}>{formErrors.slot[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="title" className={adminLabelClass}>
            Judul *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className={adminInputClass}
            required
          />
          {formErrors.title && (
            <p className={adminErrorClass}>{formErrors.title[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="eyebrow" className={adminLabelClass}>
            Eyebrow
          </label>
          <input
            id="eyebrow"
            type="text"
            value={formData.eyebrow}
            onChange={(e) =>
              setFormData({ ...formData, eyebrow: e.target.value })
            }
            className={adminInputClass}
          />
        </div>

        <div>
          <label htmlFor="subtitle" className={adminLabelClass}>
            Subjudul
          </label>
          <input
            id="subtitle"
            type="text"
            value={formData.subtitle}
            onChange={(e) =>
              setFormData({ ...formData, subtitle: e.target.value })
            }
            className={adminInputClass}
          />
        </div>

        <div>
          <label htmlFor="body" className={adminLabelClass}>
            Isi
          </label>
          <textarea
            id="body"
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            className={adminTextareaClass}
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="imageUrl" className={adminLabelClass}>
            URL Gambar
          </label>
          <input
            id="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={(e) =>
              setFormData({ ...formData, imageUrl: e.target.value })
            }
            className={adminInputClass}
            placeholder="https://... (JPG/PNG/WebP)"
          />
          <p className={adminHelpClass}>
            Diisi otomatis saat mengunggah via R2 di bawah, atau masukkan tautan
            gambar langsung.
          </p>
          {formData.imageUrl.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={formData.imageUrl}
              alt="Pratinjau gambar kartu"
              className="mt-2 max-h-48 w-full rounded border object-cover"
            />
          ) : null}
          <div className="mt-2">
            <p className="mb-1 text-sm font-medium">
              Unggah Gambar Baru ke R2 (JPG/PNG/WebP ≤ 5 MB)
            </p>
            <AssetUploader
              purpose="landing-image"
              onUploaded={handleImageUploaded}
              disabled={submitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor="ctaLabel" className={adminLabelClass}>
            Label CTA
          </label>
          <input
            id="ctaLabel"
            type="text"
            value={formData.ctaLabel}
            onChange={(e) =>
              setFormData({ ...formData, ctaLabel: e.target.value })
            }
            className={adminInputClass}
          />
        </div>

        <div>
          <label htmlFor="ctaUrl" className={adminLabelClass}>
            URL CTA
          </label>
          <input
            id="ctaUrl"
            type="url"
            value={formData.ctaUrl}
            onChange={(e) =>
              setFormData({ ...formData, ctaUrl: e.target.value })
            }
            className={adminInputClass}
          />
        </div>

        <div>
          <label htmlFor="tone" className={adminLabelClass}>
            Tone
          </label>
          <select
            id="tone"
            value={formData.tone}
            onChange={(e) =>
              setFormData({
                ...formData,
                tone: e.target.value as "dark" | "light" | "ember",
              })
            }
            className={adminSelectClass}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="ember">Ember</option>
          </select>
        </div>

        <div>
          <label htmlFor="sortOrder" className={adminLabelClass}>
            Urutan
          </label>
          <input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) =>
              setFormData({ ...formData, sortOrder: Number(e.target.value) })
            }
            className={adminInputClass}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isPublished"
            type="checkbox"
            checked={formData.isPublished}
            className={adminCheckboxClass}
            onChange={(e) =>
              setFormData({ ...formData, isPublished: e.target.checked })
            }
          />
          <label
            htmlFor="isPublished"
            className="cursor-pointer text-sm font-medium text-sand"
          >
            Terbit
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className={adminButtonClass("primary", "md")}
          >
            {submitting ? "Menyimpan..." : "Simpan"}
          </button>
          {editingId && (
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

      <h3 className="mb-4 font-display text-xl font-bold uppercase tracking-wider text-sand">
        Daftar Kartu
      </h3>
      {items.length === 0 ? (
        <p className="text-sand-600">Belum ada kartu.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={item.id} className="border border-line bg-ink-800 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold">{item.title}</h4>
                  <p className="text-sm text-sand-600">{item.subtitle}</p>
                  <p className="text-xs text-sand-600 mt-2">
                    Slot: {item.slot} | Tone: {item.tone} | Terbit:{" "}
                    {item.isPublished ? "Ya" : "Tidak"}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(item.id)}
                    disabled={idx === 0}
                    className={adminButtonClass("secondary", "icon-sm")}
                    aria-label="Naik"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(item.id)}
                    disabled={idx === items.length - 1}
                    className={adminButtonClass("secondary", "icon-sm")}
                    aria-label="Turun"
                  >
                    ↓
                  </button>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => handleEdit(item)}
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
        title="Hapus Kartu"
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
