"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  ExternalLink,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { AssetUploader } from "./asset-uploader";
import { adminButtonClass } from "./button-styles";
import {
  adminErrorClass,
  adminInputClass,
  adminLabelClass,
  adminSelectClass,
  adminTextareaClass,
} from "./form-styles";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { Toast } from "./toast";
import type { UploadedAsset } from "@/lib/assets-client";
import { resolvePublicAssetUrl } from "@/lib/assets-url";

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

const PRESET_CARD_IMAGES = [
  { label: "Arena Kampung", url: "/art/feature-1.jpg" },
  { label: "Aksi Tangkap", url: "/art/feature-2.jpg" },
  { label: "Pasar Ramai", url: "/art/feature-3.jpg" },
  { label: "Booth Event", url: "/art/event-art.jpg" },
];

export function LandingCardsManager() {
  const [items, setItems] = useState<LandingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LandingCardFormData>({
    slot: "Tentang",
    eyebrow: "",
    title: "",
    subtitle: "",
    body: "",
    imageUrl: "/art/feature-1.jpg",
    ctaLabel: "Gabung Wishlist",
    ctaUrl: "#wishlist",
    tone: "light",
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
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const selectCardForEdit = useCallback((item: LandingCard) => {
    setFormData({
      slot: item.slot || "Tentang",
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
  }, []);

  const loadCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/landing-cards?scope=admin");
      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        setError(json.message || "Gagal memuat kartu");
        return;
      }
      const loaded = (json.data || [])
        .filter((c) => c.slot?.toLowerCase() !== "karakter")
        .sort((a, b) => a.sortOrder - b.sortOrder);
      setItems(loaded);
      if (loaded.length > 0 && editingId === null) {
        selectCardForEdit(loaded[0]);
      }
    } catch (err) {
      setError("Gagal memuat kartu");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [editingId, selectCardForEdit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCards();
  }, [loadCards]);

  const startCreateNew = () => {
    setFormData({
      slot: "Tentang",
      eyebrow: "",
      title: "",
      subtitle: "",
      body: "",
      imageUrl: "/art/feature-1.jpg",
      ctaLabel: "Gabung Wishlist",
      ctaUrl: "#wishlist",
      tone: "light",
      sortOrder: items.length,
      isPublished: true,
    });
    setEditingId(null);
    setFormErrors({});
  };

  const handleImageUploaded = (asset: UploadedAsset) => {
    setFormData((prev) => ({ ...prev, imageUrl: asset.publicUrl }));
    setToast({
      message: "Gambar berhasil diunggah. Klik Simpan untuk menerapkan.",
      type: "success",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);
    const isEditing = editingId !== null;
    // Pastikan tidak tersimpan sebagai slot karakter agar tidak hilang dari daftar ini
    const safeSlot =
      formData.slot.trim().toLowerCase() === "karakter"
        ? "Tentang"
        : formData.slot.trim() || "Tentang";

    try {
      const url = isEditing
        ? `/api/landing-cards/${editingId}`
        : "/api/landing-cards";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          slot: safeSlot,
          ctaLabel: formData.ctaLabel.trim() || undefined,
          ctaUrl: formData.ctaUrl.trim() || undefined,
          eyebrow: formData.eyebrow.trim() || undefined,
          subtitle: formData.subtitle.trim() || undefined,
          body: formData.body.trim() || undefined,
          imageUrl: formData.imageUrl.trim() || undefined,
          isPublished: formData.isPublished ? 1 : 0,
        }),
      });
      const json = (await res.json()) as ApiResponse;

      if (!json.ok) {
        if (json.fields) setFormErrors(json.fields);
        setToast({
          message: json.message || "Gagal menyimpan kartu",
          type: "error",
        });
        return;
      }

      setToast({
        message: isEditing ? "Kartu diperbarui" : "Kartu ditambahkan",
        type: "success",
      });
      await loadCards();
    } catch (err) {
      setToast({ message: "Gagal menyimpan kartu", type: "error" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
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
      if (editingId === deleteTarget.id) startCreateNew();
      await loadCards();
    } catch (err) {
      setToast({ message: "Gagal menghapus kartu", type: "error" });
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const reorder = async (ids: number[]) => {
    try {
      const res = await fetch("/api/landing-cards/reorder", {
        method: "PUT",
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
      setToast({ message: "Urutan diperbarui", type: "success" });
    } catch (err) {
      setToast({ message: "Gagal mengubah urutan", type: "error" });
      console.error(err);
    }
  };

  const moveCard = async (idx: number, dir: "up" | "down") => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    setItems(next);
    await reorder(next.map((c) => c.id));
  };

  const handleDrop = async (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === dropIdx) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }
    const newItems = [...items];
    const [movedItem] = newItems.splice(draggedIdx, 1);
    newItems.splice(dropIdx, 0, movedItem);
    setItems(newItems);
    setDraggedIdx(null);
    setDragOverIdx(null);
    await reorder(newItems.map((c) => c.id));
  };

  if (loading) {
    return (
      <div
        className="space-y-6"
        role="status"
        aria-label="Memuat kartu landing"
      >
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

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Kartu Tambahan
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Kelola sorotan arena, event, atau informasi tambahan di halaman
            utama.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={adminButtonClass("secondary", "md")}
          >
            <ExternalLink className="h-4 w-4 text-zinc-400" />
            <span>Lihat Situs</span>
          </a>
          <button
            type="button"
            onClick={startCreateNew}
            className={adminButtonClass("primary", "md")}
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Kartu</span>
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs text-zinc-600">
        <span>
          Untuk kartu karakter di seksi &ldquo;Pilih Jagoanmu&rdquo;, kelola
          melalui menu khusus Jagoan.
        </span>
        <Link
          href="/admin/characters"
          className="font-semibold text-zinc-900 hover:underline"
        >
          Buka Kelola Jagoan &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-3 lg:col-span-7">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Daftar Kartu ({items.length})
            </h2>
            <span className="hidden text-xs text-zinc-400 sm:inline">
              Geser atau gunakan tombol panah untuk mengurutkan
            </span>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
              Belum ada kartu tambahan. Isi formulir di samping untuk membuat
              kartu baru.
            </div>
          ) : (
            items.map((item, idx) => {
              const isSelected = editingId === item.id;
              const isDragTarget = dragOverIdx === idx;
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => setDraggedIdx(idx)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (draggedIdx !== null && draggedIdx !== idx)
                      setDragOverIdx(idx);
                  }}
                  onDrop={(e) => void handleDrop(e, idx)}
                  onClick={() => selectCardForEdit(item)}
                  className={`flex cursor-pointer items-center gap-3.5 rounded-2xl border bg-white p-3.5 transition-all ${
                    isSelected
                      ? "border-zinc-900 ring-2 ring-zinc-900/10"
                      : "border-zinc-200 hover:border-zinc-300"
                  } ${isDragTarget ? "border-dashed border-zinc-900" : ""}`}
                >
                  <div className="flex shrink-0 flex-col items-center gap-1 text-zinc-400">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void moveCard(idx, "up");
                      }}
                      disabled={idx === 0}
                      className="rounded p-0.5 text-zinc-600 hover:bg-zinc-100 disabled:opacity-25"
                      title="Pindah ke atas"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <GripVertical className="h-4 w-4" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void moveCard(idx, "down");
                      }}
                      disabled={idx === items.length - 1}
                      className="rounded p-0.5 text-zinc-600 hover:bg-zinc-100 disabled:opacity-25"
                      title="Pindah ke bawah"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                    {item.imageUrl ? (
                      <Image
                        src={
                          resolvePublicAssetUrl(item.imageUrl) || item.imageUrl
                        }
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-zinc-400">
                        Tanpa Gambar
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          item.isPublished === 1
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {item.isPublished === 1 ? "Terbit" : "Draf"}
                      </span>
                      <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                        {item.slot || "Umum"}
                      </span>
                    </div>
                    <h3 className="truncate text-sm font-semibold text-zinc-900">
                      {item.title}
                    </h3>
                    {item.body && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
                        {item.body}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectCardForEdit(item);
                      }}
                      className={adminButtonClass("secondary", "icon-sm")}
                      title="Edit kartu"
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
                      title="Hapus kartu"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3.5">
              <h2 className="text-base font-bold text-zinc-900">
                {editingId ? "Edit Kartu" : "Tambah Kartu"}
              </h2>
              <span
                className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                  formData.isPublished
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {formData.isPublished ? "Terbit" : "Draf"}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="card-title" className={adminLabelClass}>
                  Judul Kartu *
                </label>
                <input
                  id="card-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder="Contoh: Jelajahi 3 Arena Kampung"
                  className={adminInputClass}
                />
                {formErrors.title && (
                  <p className={adminErrorClass}>{formErrors.title[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="card-desc" className={adminLabelClass}>
                  Deskripsi
                </label>
                <textarea
                  id="card-desc"
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  rows={3}
                  placeholder="Tulis penjelasan singkat mengenai sorotan ini..."
                  className={adminTextareaClass}
                />
              </div>

              <div>
                <span className={adminLabelClass}>Gambar Kartu</span>
                {formData.imageUrl ? (
                  <div className="relative mb-2.5 aspect-video w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                    <Image
                      src={
                        resolvePublicAssetUrl(formData.imageUrl) ||
                        formData.imageUrl
                      }
                      alt="Pratinjau kartu"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : null}
                <AssetUploader
                  purpose="landing-image"
                  onUploaded={handleImageUploaded}
                  disabled={submitting}
                />
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-[11px] font-medium text-zinc-500">
                    Gambar game:
                  </span>
                  {PRESET_CARD_IMAGES.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, imageUrl: preset.url })
                      }
                      className={`rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
                        formData.imageUrl === preset.url
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cta-label" className={adminLabelClass}>
                    Teks Tombol
                  </label>
                  <input
                    id="cta-label"
                    type="text"
                    value={formData.ctaLabel}
                    onChange={(e) =>
                      setFormData({ ...formData, ctaLabel: e.target.value })
                    }
                    placeholder="Gabung Wishlist"
                    className={adminInputClass}
                  />
                </div>
                <div>
                  <label htmlFor="cta-url" className={adminLabelClass}>
                    Tautan Tombol
                  </label>
                  <input
                    id="cta-url"
                    type="text"
                    value={formData.ctaUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, ctaUrl: e.target.value })
                    }
                    placeholder="#wishlist"
                    className={adminInputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="card-slot" className={adminLabelClass}>
                    Kategori / Slot
                  </label>
                  <input
                    id="card-slot"
                    type="text"
                    value={formData.slot}
                    onChange={(e) =>
                      setFormData({ ...formData, slot: e.target.value })
                    }
                    placeholder="Tentang / Arena / Event"
                    className={adminInputClass}
                  />
                </div>
                <div>
                  <label htmlFor="card-tone" className={adminLabelClass}>
                    Tone
                  </label>
                  <select
                    id="card-tone"
                    value={formData.tone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tone: e.target.value as "dark" | "light" | "ember",
                      })
                    }
                    className={adminSelectClass}
                  >
                    <option value="light">Putih Bersih</option>
                    <option value="dark">Kontras Gelap</option>
                    <option value="ember">Aksen Merah BAREN</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 px-3.5 py-2.5">
                <span className="text-xs font-semibold text-zinc-700">
                  Tampilkan di beranda
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.isPublished}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      isPublished: !formData.isPublished,
                    })
                  }
                  className={`relative h-6 w-11 cursor-pointer rounded-full p-0.5 transition-colors ${
                    formData.isPublished ? "bg-zinc-900" : "bg-zinc-300"
                  }`}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white shadow-xs transition-transform ${
                      formData.isPublished ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
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
                    onClick={startCreateNew}
                    className={adminButtonClass("secondary", "md")}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

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
