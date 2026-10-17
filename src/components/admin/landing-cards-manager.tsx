"use client";

import { useEffect, useState } from "react";
import { AssetUploader } from "./asset-uploader";
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
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="mb-8 p-4 border rounded space-y-4"
      >
        <h3 className="font-bold mb-4">
          {editingId ? "Edit Kartu" : "Tambah Kartu"}
        </h3>

        <div>
          <label htmlFor="slot" className="block font-medium mb-1">
            Slot
          </label>
          <input
            id="slot"
            type="text"
            value={formData.slot}
            onChange={(e) => setFormData({ ...formData, slot: e.target.value })}
            className="w-full border px-3 py-2 rounded"
          />
          {formErrors.slot && (
            <p className="text-red-600 text-sm mt-1">{formErrors.slot[0]}</p>
          )}
        </div>

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
          <label htmlFor="eyebrow" className="block font-medium mb-1">
            Eyebrow
          </label>
          <input
            id="eyebrow"
            type="text"
            value={formData.eyebrow}
            onChange={(e) =>
              setFormData({ ...formData, eyebrow: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />
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
        </div>

        <div>
          <label htmlFor="body" className="block font-medium mb-1">
            Isi
          </label>
          <textarea
            id="body"
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="imageUrl" className="block font-medium mb-1">
            URL Gambar
          </label>
          <input
            id="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={(e) =>
              setFormData({ ...formData, imageUrl: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
            placeholder="https://... (JPG/PNG/WebP)"
          />
          <p className="text-xs text-gray-500 mt-1">
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
          <label htmlFor="ctaLabel" className="block font-medium mb-1">
            Label CTA
          </label>
          <input
            id="ctaLabel"
            type="text"
            value={formData.ctaLabel}
            onChange={(e) =>
              setFormData({ ...formData, ctaLabel: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label htmlFor="ctaUrl" className="block font-medium mb-1">
            URL CTA
          </label>
          <input
            id="ctaUrl"
            type="url"
            value={formData.ctaUrl}
            onChange={(e) =>
              setFormData({ ...formData, ctaUrl: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label htmlFor="tone" className="block font-medium mb-1">
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
            className="border px-3 py-2 rounded"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="ember">Ember</option>
          </select>
        </div>

        <div>
          <label htmlFor="sortOrder" className="block font-medium mb-1">
            Urutan
          </label>
          <input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) =>
              setFormData({ ...formData, sortOrder: Number(e.target.value) })
            }
            className="border px-3 py-2 rounded"
          />
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

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : "Simpan"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      <h3 className="font-bold mb-4">Daftar Kartu</h3>
      {items.length === 0 ? (
        <p className="text-gray-500">Belum ada kartu.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={item.id} className="p-4 border rounded">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.subtitle}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Slot: {item.slot} | Tone: {item.tone} | Terbit:{" "}
                    {item.isPublished ? "Ya" : "Tidak"}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(item.id)}
                    disabled={idx === 0}
                    className="px-2 py-1 border rounded text-sm disabled:opacity-30"
                    aria-label="Naik"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(item.id)}
                    disabled={idx === items.length - 1}
                    className="px-2 py-1 border rounded text-sm disabled:opacity-30"
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
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget({ id: item.id, title: item.title })
                  }
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
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
