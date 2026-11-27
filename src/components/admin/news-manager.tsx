"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Images,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { AssetUploader } from "./asset-uploader";
import { Skeleton } from "@/components/ui/skeleton";
import { adminButtonClass } from "./button-styles";
import {
  adminInputClass,
  adminTextareaClass,
  adminSelectClass,
  adminLabelClass,
  adminErrorClass,
} from "./form-styles";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { Toast } from "./toast";
import type { UploadedAsset } from "@/lib/assets-client";
import {
  parseAdminNewsList,
  slugifyTitle,
  type AdminNewsItem,
} from "@/lib/admin-news-client";
import { parseApiEnvelope } from "@/lib/api/client-response";
import { resolvePublicAssetUrl } from "@/lib/assets-url";
import { parseNewsBody, serializeNewsBody } from "@/lib/news-gallery";

const PRESET_EVENT_PHOTOS = [
  { label: "Keramaian Booth", url: "/art/event-art.jpg" },
  { label: "Setup 4 Pemain", url: "/art/event-booth-setup.jpg" },
  { label: "Keseruan Pemain", url: "/art/event-players.jpg" },
  { label: "Momen Menang", url: "/art/event-match.jpg" },
];

const DEFAULT_EVENT_ARTICLES = [
  {
    title: "Keseruan Booth BAREN di Festival Build CKG",
    slug: "keseruan-booth-baren-festival-ckg",
    excerpt:
      " Dokumentasi antusiasme pengunjung memainkan mode 2 vs 2 layar bersama langsung di booth pameran BAREN.",
    coverUrl: "/art/event-art.jpg",
    story:
      " Booth BAREN dipadati pengunjung yang penasaran mencoba adaptasi modern permainan tradisional benteng-bentengan dalam format party game 2 vs 2.\n\nDengan empat controller aktif di depan layar besar, setiap ronde berdurasi 3 menit berlangsung riuh oleh teriakan kerja sama tim saat melakukan penyelamatan dari zona tahanan dan perebutan markas di detik terakhir.",
    galleryUrls: [
      "/art/event-art.jpg",
      "/art/event-booth-setup.jpg",
      "/art/event-players.jpg",
      "/art/event-match.jpg",
    ],
    status: "published" as const,
  },
  {
    title: "Mabar Komunitas & Playtest Arena Kampung BAREN",
    slug: "mabar-komunitas-playtest-arena-baren",
    excerpt:
      "Sesi uji main terbuka menguji tiga konsep arena mulai dari Lapang Kampung hingga Pasar Ramai.",
    coverUrl: "/art/event-players.jpg",
    story:
      "Tim pengembang menggelar sesi playtest terbuka bersama komunitas lokal untuk menguji keseimbangan mekanisme status FRESH dan penyelamatan rekan satu tim.",
    galleryUrls: [
      "/art/event-players.jpg",
      "/art/feature-1.jpg",
      "/art/feature-2.jpg",
      "/art/feature-3.jpg",
    ],
    status: "published" as const,
  },
];

interface EditorState {
  title: string;
  slug: string;
  excerpt: string;
  story: string;
  coverUrl: string;
  galleryUrls: string[];
  status: "draft" | "published";
}

const EMPTY_EDITOR: EditorState = {
  title: "",
  slug: "",
  excerpt: "",
  story: "",
  coverUrl: "/art/event-art.jpg",
  galleryUrls: [],
  status: "published",
};

export function NewsManager() {
  const [items, setItems] = useState<AdminNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>(EMPTY_EDITOR);
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
    setEditor(EMPTY_EDITOR);
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
    setEditor((prev) => ({ ...prev, coverUrl: asset.publicUrl }));
    setToast({
      message: "Foto sampul diunggah. Klik Simpan untuk menerapkan.",
      type: "success",
    });
  };

  const handleGalleryUploaded = (asset: UploadedAsset) => {
    setEditor((prev) => ({
      ...prev,
      coverUrl: prev.coverUrl || asset.publicUrl,
      galleryUrls: prev.galleryUrls.includes(asset.publicUrl)
        ? prev.galleryUrls
        : [...prev.galleryUrls, asset.publicUrl],
    }));
    setToast({
      message: "Foto dokumentasi event ditambahkan ke galeri artikel.",
      type: "success",
    });
  };

  const addPresetToGallery = (url: string) => {
    setEditor((prev) => ({
      ...prev,
      coverUrl: prev.coverUrl || url,
      galleryUrls: prev.galleryUrls.includes(url)
        ? prev.galleryUrls
        : [...prev.galleryUrls, url],
    }));
  };

  const removeGalleryPhoto = (idx: number) => {
    setEditor((prev) => ({
      ...prev,
      galleryUrls: prev.galleryUrls.filter((_, i) => i !== idx),
    }));
  };

  const moveGalleryPhoto = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    setEditor((prev) => {
      if (target < 0 || target >= prev.galleryUrls.length) return prev;
      const next = [...prev.galleryUrls];
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...prev, galleryUrls: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const combinedBody = serializeNewsBody(editor.story, editor.galleryUrls);
    if (!combinedBody) {
      setFormErrors({
        body: ["Tambahkan minimal cerita singkat atau foto dokumentasi event."],
      });
      return;
    }

    setSubmitting(true);
    try {
      const isEditing = editingId !== null;
      const payload = {
        title: editor.title,
        slug: editor.slug || slugifyTitle(editor.title),
        excerpt: editor.excerpt.trim() || null,
        body: combinedBody,
        coverUrl: editor.coverUrl.trim() || null,
        status: editor.status,
      };
      const res = await fetch(
        isEditing ? `/api/news/${editingId}` : "/api/news",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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
    const parsedBody = parseNewsBody(item.body);
    setEditor({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt ?? "",
      story: parsedBody.story,
      coverUrl: item.coverUrl ?? "",
      galleryUrls: parsedBody.galleryUrls,
      status: item.status,
    });
    setEditingId(item.id);
    setSlugTouched(true);
    setFormErrors({});
  };

  const handleSeedEvents = async () => {
    setSubmitting(true);
    try {
      for (const seed of DEFAULT_EVENT_ARTICLES) {
        await fetch("/api/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: seed.title,
            slug: seed.slug,
            excerpt: seed.excerpt.trim(),
            body: serializeNewsBody(seed.story.trim(), seed.galleryUrls),
            coverUrl: seed.coverUrl,
            status: seed.status,
          }),
        });
      }
      setToast({
        message: "Contoh artikel & galeri event BAREN berhasil ditambahkan.",
        type: "success",
      });
      await loadNews();
    } catch {
      setToast({ message: "Gagal menyalin contoh artikel", type: "error" });
    } finally {
      setSubmitting(false);
    }
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
      if (editingId === deleteTarget.id) resetForm();
      await loadNews();
    } catch (err) {
      setToast({ message: "Gagal menghapus berita", type: "error" });
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-label="Memuat data berita">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-7">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-[520px] w-full rounded-2xl lg:col-span-5" />
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
            Berita & Dokumentasi Event
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Maksimal 3 artikel terbit terbaru tampil di beranda, dan seluruhnya
            dapat dilihat lengkap beserta galeri foto event di halaman Berita.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/berita"
            target="_blank"
            rel="noopener noreferrer"
            className={adminButtonClass("secondary", "md")}
          >
            <ExternalLink className="h-4 w-4 text-zinc-400" />
            <span>Halaman Berita</span>
          </Link>
          <button
            type="button"
            onClick={resetForm}
            className={adminButtonClass("primary", "md")}
          >
            <Plus className="h-4 w-4" />
            <span>Artikel Baru</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Daftar Berita */}
        <div className="flex flex-col gap-3 lg:col-span-7">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Daftar Berita ({items.length})
          </h2>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
              <Sparkles className="mb-3 h-7 w-7 text-zinc-400" />
              <h3 className="text-base font-semibold text-zinc-900">
                Belum ada artikel atau dokumentasi event
              </h3>
              <p className="mt-1 mb-5 max-w-md text-sm text-zinc-500">
                Isi contoh artikel dokumentasi event BAREN lengkap dengan foto
                suasana booth, atau buat artikel baru di samping.
              </p>
              <button
                type="button"
                onClick={handleSeedEvents}
                disabled={submitting}
                className={adminButtonClass("primary", "md")}
              >
                <Sparkles className="h-4 w-4" />
                <span>Isi Contoh Artikel Event BAREN</span>
              </button>
            </div>
          ) : (
            items.map((item) => {
              const isSelected = editingId === item.id;
              const parsedItem = parseNewsBody(item.body);
              return (
                <div
                  key={item.id}
                  data-testid="news-card"
                  onClick={() => handleEdit(item)}
                  className={`flex cursor-pointer items-center gap-3.5 rounded-2xl border bg-white p-4 transition-all ${
                    isSelected
                      ? "border-zinc-900 ring-2 ring-zinc-900/10"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                    {item.coverUrl ? (
                      <Image
                        src={
                          resolvePublicAssetUrl(item.coverUrl) || item.coverUrl
                        }
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-zinc-400">
                        Tanpa Sampul
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          item.status === "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {item.status === "published" ? "Terbit" : "Draf"}
                      </span>
                      {parsedItem.galleryUrls.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                          <Images className="h-3 w-3" />
                          {parsedItem.galleryUrls.length} foto event
                        </span>
                      )}
                      <span className="truncate text-[11px] text-zinc-400">
                        /berita/{item.slug}
                      </span>
                    </div>
                    <h3 className="truncate text-sm font-semibold text-zinc-900">
                      {item.title}
                    </h3>
                    {item.excerpt && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
                        {item.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
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
                      className={adminButtonClass("danger", "sm")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only">Hapus</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Form Inspector Berita + Galeri Foto Event */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSubmit}
            className="sticky top-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5">
              <h2 className="text-base font-bold text-zinc-900">
                {editingId ? "Edit Artikel" : "Tambah Artikel"}
              </h2>
              <span
                className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                  editor.status === "published"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {editor.status === "published" ? "Terbit" : "Draf"}
              </span>
            </div>

            <div>
              <label htmlFor="title" className={adminLabelClass}>
                Judul Artikel *
              </label>
              <input
                id="title"
                type="text"
                value={editor.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setEditor((prev) => ({
                    ...prev,
                    title,
                    slug:
                      editingId === null && !slugTouched
                        ? slugifyTitle(title)
                        : prev.slug,
                  }));
                }}
                className={adminInputClass}
                required
                placeholder="Contoh: Keseruan Booth BAREN di Festival CKG"
              />
              {formErrors.title && (
                <p className={adminErrorClass}>{formErrors.title[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="slug" className={adminLabelClass}>
                  Slug *
                </label>
                <input
                  id="slug"
                  type="text"
                  value={editor.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setEditor({ ...editor, slug: e.target.value });
                  }}
                  className={adminInputClass}
                  required
                  placeholder="keseruan-booth-baren"
                />
                {formErrors.slug && (
                  <p className={adminErrorClass}>{formErrors.slug[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="status" className={adminLabelClass}>
                  Status
                </label>
                <select
                  id="status"
                  value={editor.status}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      status: e.target.value as "draft" | "published",
                    })
                  }
                  className={adminSelectClass}
                >
                  <option value="published">Terbit</option>
                  <option value="draft">Draf</option>
                </select>
              </div>
            </div>

            {/* Foto Sampul Utama */}
            <div>
              <span className={adminLabelClass}>Foto Sampul Utama</span>
              {editor.coverUrl.trim() ? (
                <div className="relative mb-2.5 aspect-video w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                  <Image
                    src={
                      resolvePublicAssetUrl(editor.coverUrl) || editor.coverUrl
                    }
                    alt="Pratinjau sampul"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : null}
              <AssetUploader
                purpose="news-cover"
                onUploaded={handleCoverUploaded}
                disabled={submitting}
              />
              {formErrors.coverUrl && (
                <p className={adminErrorClass}>{formErrors.coverUrl[0]}</p>
              )}
            </div>

            {/* Galeri Multi-Foto Dokumentasi Event BAREN */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-800">
                  Galeri Foto Event ({editor.galleryUrls.length})
                </span>
                <span className="text-[11px] text-zinc-500">
                  Bisa pilih banyak foto sekaligus
                </span>
              </div>

              <AssetUploader
                purpose="news-cover"
                onUploaded={handleGalleryUploaded}
                disabled={submitting}
              />

              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[11px] font-medium text-zinc-500">
                  Tambah cepat foto event:
                </span>
                {PRESET_EVENT_PHOTOS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => addPresetToGallery(preset.url)}
                    className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>

              {editor.galleryUrls.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {editor.galleryUrls.map((url, idx) => (
                    <div
                      key={url}
                      className="group relative aspect-video overflow-hidden rounded-lg border border-zinc-200 bg-white"
                    >
                      <Image
                        src={resolvePublicAssetUrl(url) || url}
                        alt={`Foto event ${idx + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-zinc-950/65 px-1.5 py-1 text-white">
                        <div className="flex gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveGalleryPhoto(idx, -1)}
                            className="rounded p-0.5 hover:bg-white/20 disabled:opacity-30"
                            title="Geser kiri"
                          >
                            <ArrowLeft className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === editor.galleryUrls.length - 1}
                            onClick={() => moveGalleryPhoto(idx, 1)}
                            className="rounded p-0.5 hover:bg-white/20 disabled:opacity-30"
                            title="Geser kanan"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeGalleryPhoto(idx)}
                          className="rounded p-0.5 hover:bg-red-500/80"
                          title="Hapus foto dari galeri"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="excerpt" className={adminLabelClass}>
                Ringkasan Singkat (Opsional)
              </label>
              <textarea
                id="excerpt"
                value={editor.excerpt}
                onChange={(e) =>
                  setEditor({ ...editor, excerpt: e.target.value })
                }
                className="min-h-16 w-full resize-y rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
                rows={2}
                placeholder="Satu kalimat pengantar untuk kartu berita di beranda..."
              />
            </div>

            <div>
              <label htmlFor="body" className={adminLabelClass}>
                Isi / Keterangan Event{" "}
                {editor.galleryUrls.length === 0 ? "*" : "(Opsional)"}
              </label>
              <textarea
                id="body"
                value={editor.story}
                onChange={(e) =>
                  setEditor({ ...editor, story: e.target.value })
                }
                className={adminTextareaClass}
                rows={4}
                required={editor.galleryUrls.length === 0}
                placeholder="Ceritakan suasana event, lokasi, atau pengumuman BAREN..."
              />
              {formErrors.body && (
                <p className={adminErrorClass}>{formErrors.body[0]}</p>
              )}
            </div>

            <div className="flex gap-2 border-t border-zinc-100 pt-3">
              <button
                type="submit"
                disabled={submitting}
                className={adminButtonClass("primary", "md", "flex-1")}
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
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
        title="Hapus Artikel"
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
