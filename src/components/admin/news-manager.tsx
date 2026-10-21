"use client";

import { useEffect, useState } from "react";
import { AssetUploader } from "./asset-uploader";
import { adminButtonClass } from "./button-styles";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { Toast } from "./toast";
import type { UploadedAsset } from "@/lib/assets-client";
import {
  parseAdminNewsList,
  slugifyTitle,
  type AdminNewsFormData,
  type AdminNewsItem,
} from "@/lib/admin-news-client";
import { parseApiEnvelope } from "@/lib/api/client-response";

export function NewsManager() {
  const [items, setItems] = useState<AdminNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AdminNewsFormData>({
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    coverUrl: "",
    status: "draft",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
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
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      body: "",
      coverUrl: "",
      status: "draft",
    });
    setEditingId(null);
    setSlugTouched(false);
    setFormErrors({});
  };

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/news?scope=admin", { cache: "no-store" });
      const parsed = parseAdminNewsList(await res.json());
      if (!parsed.ok) {
        setError(parsed.message);
        return;
      }
      setItems(parsed.data);
    } catch (err) {
      setError("Gagal memuat berita");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadNews();
  }, []);

  const handleCoverUploaded = (asset: UploadedAsset) => {
    setFormData((prev) => ({ ...prev, coverUrl: asset.publicUrl }));
    setToast({
      message:
        "Sampul berhasil diunggah ke R2. Klik 'Simpan' untuk menerapkan perubahan.",
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
        isEditing ? `/api/news/${editingId}` : "/api/news",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      const parsed = parseApiEnvelope<AdminNewsItem>(await res.json());

      if (!parsed.ok) {
        if (parsed.fields) {
          setFormErrors(parsed.fields);
        } else {
          setToast({
            message: parsed.message || "Gagal menyimpan berita",
            type: "error",
          });
        }
        return;
      }

      setToast({
        message: isEditing ? "Berita diperbarui" : "Berita ditambahkan",
        type: "success",
      });
      resetForm();
      await loadNews();
    } catch (err) {
      setToast({ message: "Gagal menyimpan berita", type: "error" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: AdminNewsItem) => {
    setFormData({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt ?? "",
      body: item.body,
      coverUrl: item.coverUrl ?? "",
      status: item.status,
    });
    setEditingId(item.id);
    setSlugTouched(true);
    setFormErrors({});
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/news/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const parsed = parseApiEnvelope<AdminNewsItem>(await res.json());
      if (!parsed.ok) {
        setToast({
          message: parsed.message || "Gagal menghapus berita",
          type: "error",
        });
        return;
      }
      setToast({ message: "Berita dihapus", type: "success" });
      await loadNews();
    } catch (err) {
      setToast({ message: "Gagal menghapus berita", type: "error" });
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) return <p>Memuat berita...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-gray-700">
          <strong>Catatan:</strong> Hanya{" "}
          <strong>maksimal 3 berita terbaru</strong> yang tampil di landing
          page. Jika kosong, seksi berita akan hilang. Berita yang
          dipublikasikan dapat diakses di /berita/[slug].
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded">
        <h3 className="font-bold mb-4">
          {editingId ? "Edit Berita" : "Tambah Berita"}
        </h3>

        <div className="mb-4">
          <label htmlFor="title" className="block font-medium mb-1">
            Judul *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => {
              const title = e.target.value;
              setFormData((prev) => ({
                ...prev,
                title,
                slug:
                  editingId === null && !slugTouched
                    ? slugifyTitle(title)
                    : prev.slug,
              }));
            }}
            className="w-full border px-3 py-2 rounded"
            required
          />
          {formErrors.title && (
            <p className="text-red-600 text-sm mt-1">{formErrors.title[0]}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="slug" className="block font-medium mb-1">
            Slug *
          </label>
          <input
            id="slug"
            type="text"
            value={formData.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setFormData({ ...formData, slug: e.target.value });
            }}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Dipakai di URL /berita/[slug]. Terisi otomatis dari judul; bisa
            diubah.
          </p>
          {formErrors.slug && (
            <p className="text-red-600 text-sm mt-1">{formErrors.slug[0]}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="excerpt" className="block font-medium mb-1">
            Ringkasan
          </label>
          <textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) =>
              setFormData({ ...formData, excerpt: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
            rows={2}
          />
          {formErrors.excerpt && (
            <p className="text-red-600 text-sm mt-1">{formErrors.excerpt[0]}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="body" className="block font-medium mb-1">
            Isi *
          </label>
          <textarea
            id="body"
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            rows={5}
            required
          />
          {formErrors.body && (
            <p className="text-red-600 text-sm mt-1">{formErrors.body[0]}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="coverUrl" className="block font-medium mb-1">
            URL Cover
          </label>
          <input
            id="coverUrl"
            type="url"
            value={formData.coverUrl}
            onChange={(e) =>
              setFormData({ ...formData, coverUrl: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
            placeholder="https://... (JPG/PNG/WebP)"
          />
          <p className="text-xs text-gray-500 mt-1">
            Diisi otomatis saat mengunggah via R2 di bawah, atau masukkan tautan
            gambar langsung.
          </p>
          {formErrors.coverUrl && (
            <p className="text-red-600 text-sm mt-1">
              {formErrors.coverUrl[0]}
            </p>
          )}
          {formData.coverUrl.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={formData.coverUrl}
              alt="Pratinjau sampul berita"
              className="mt-2 max-h-48 w-full rounded border object-cover"
            />
          ) : null}
          <div className="mt-2">
            <p className="mb-1 text-sm font-medium">
              Unggah Sampul Baru ke R2 (JPG/PNG/WebP ≤ 5 MB)
            </p>
            <AssetUploader
              purpose="news-cover"
              onUploaded={handleCoverUploaded}
              disabled={submitting}
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="status" className="block font-medium mb-1">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as "draft" | "published",
              })
            }
            className="border px-3 py-2 rounded"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
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

      <h3 className="font-bold mb-4">Daftar Berita</h3>
      {items.length === 0 ? (
        <p className="text-gray-500">Belum ada berita.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="p-4 border rounded">
              <h4 className="font-bold">{item.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{item.excerpt}</p>
              <p className="text-xs text-gray-500 mb-2">
                Status: {item.status} | Slug: {item.slug}
              </p>
              <div className="flex gap-2">
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
                    setDeleteTarget({
                      id: item.id,
                      title: item.title,
                    })
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
        title="Hapus Berita"
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
