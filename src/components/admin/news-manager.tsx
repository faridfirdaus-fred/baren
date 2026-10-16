"use client";

import { useEffect, useState } from "react";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { Toast } from "./toast";

interface NewsItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverUrl: string | null;
  status: "draft" | "published";
  publishedAt: string | null;
}

interface NewsFormData {
  title: string;
  excerpt: string;
  body: string;
  coverUrl: string;
  status: "draft" | "published";
}

interface ApiResponse {
  ok: boolean;
  data?: NewsItem[];
  message?: string;
  fields?: Record<string, string[]>;
}

export function NewsManager() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<NewsFormData>({
    title: "",
    excerpt: "",
    body: "",
    coverUrl: "",
    status: "draft",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    slug: string;
    title: string;
  } | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/news?limit=999");
      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        setError(json.message || "Gagal memuat berita");
        return;
      }
      setItems(json.data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      const url = editingSlug ? `/api/news/${editingSlug}` : "/api/news";
      const method = editingSlug ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = (await res.json()) as ApiResponse;

      if (!json.ok) {
        if (json.fields) {
          setFormErrors(json.fields);
        } else {
          setToast({
            message: json.message || "Gagal menyimpan berita",
            type: "error",
          });
        }
        return;
      }

      setToast({
        message: editingSlug ? "Berita diperbarui" : "Berita ditambahkan",
        type: "success",
      });
      setFormData({
        title: "",
        excerpt: "",
        body: "",
        coverUrl: "",
        status: "draft",
      });
      setEditingId(null);
      setEditingSlug(null);
      await loadNews();
    } catch (err) {
      setToast({ message: "Gagal menyimpan berita", type: "error" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: NewsItem) => {
    setFormData({
      title: item.title,
      excerpt: item.excerpt,
      body: item.body,
      coverUrl: item.coverUrl || "",
      status: item.status,
    });
    setEditingId(item.id);
    setEditingSlug(item.slug);
    setFormErrors({});
  };

  const handleCancelEdit = () => {
    setFormData({
      title: "",
      excerpt: "",
      body: "",
      coverUrl: "",
      status: "draft",
    });
    setEditingId(null);
    setEditingSlug(null);
    setFormErrors({});
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/news/${deleteTarget.slug}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        setToast({
          message: json.message || "Gagal menghapus berita",
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
          <strong>Catatan:</strong> Hanya <strong>maksimal 3 berita terbaru</strong> yang tampil di landing page.
          Jika kosong, seksi berita akan hilang. Saat ini belum ada halaman detail berita.
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
          />
          {formErrors.coverUrl && (
            <p className="text-red-600 text-sm mt-1">{formErrors.coverUrl[0]}</p>
          )}
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
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget({
                      id: item.id,
                      slug: item.slug,
                      title: item.title,
                    })
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
