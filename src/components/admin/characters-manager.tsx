"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from "lucide-react";
import { AssetUploader } from "./asset-uploader";
import { adminButtonClass } from "./button-styles";
import {
  adminErrorClass,
  adminInputClass,
  adminLabelClass,
  adminTextareaClass,
} from "./form-styles";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { Toast } from "./toast";
import type { UploadedAsset } from "@/lib/assets-client";
import { resolvePublicAssetUrl } from "@/lib/assets-url";

interface CharacterCard {
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

interface CharacterFormData {
  title: string;
  eyebrow: string;
  body: string;
  imageUrl: string;
  tone: "dark" | "light" | "ember";
  sortOrder: number;
  isPublished: boolean;
}

interface ApiResponse {
  ok: boolean;
  data?: CharacterCard[];
  message?: string;
  fields?: Record<string, string[]>;
}

const PRESET_ART = [
  { label: "Jagoan Biru", url: "/art/char-biru.jpg" },
  { label: "Jagoan Merah", url: "/art/char-merah.jpg" },
  { label: "Jagoan Hijau", url: "/art/char-hijau.jpg" },
  { label: "Jagoan Kuning", url: "/art/char-kuning.jpg" },
];

const DEFAULT_SEEDS = [
  {
    title: "Raka — Pelari Biru",
    eyebrow: "TIM BIRU",
    tone: "dark" as const,
    imageUrl: "/art/char-biru.jpg",
    body: "Pelari gesit berikat kepala batik yang andal memancing lawan dan merebut benteng.",
  },
  {
    title: "Bima — Penjaga Merah",
    eyebrow: "TIM MERAH",
    tone: "ember" as const,
    imageUrl: "/art/char-merah.jpg",
    body: "Penjaga benteng tangguh yang sigap menangkap penyusup sebelum menyentuh markas.",
  },
  {
    title: "Damar — Penyelamat Hijau",
    eyebrow: "SPESIALIS RESCUE",
    tone: "light" as const,
    imageUrl: "/art/char-hijau.jpg",
    body: "Cerdik mencari celah untuk membebaskan rekan setim dari zona tahanan.",
  },
  {
    title: "Sari — Penyerbu Kuning",
    eyebrow: "PENYERBU CEPAT",
    tone: "ember" as const,
    imageUrl: "/art/char-kuning.jpg",
    body: "Lincah melakukan dash mengejutkan ke benteng lawan di detik-detik penentuan.",
  },
];

export function CharactersManager() {
  const [items, setItems] = useState<CharacterCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CharacterFormData>({
    title: "",
    eyebrow: "TIM BIRU",
    body: "",
    imageUrl: "/art/char-biru.jpg",
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
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const selectCardForEdit = useCallback((item: CharacterCard) => {
    setFormData({
      title: item.title,
      eyebrow: item.eyebrow || "",
      body: item.body || "",
      imageUrl: item.imageUrl || "",
      tone: item.tone,
      sortOrder: item.sortOrder,
      isPublished: item.isPublished === 1,
    });
    setEditingId(item.id);
    setFormErrors({});
  }, []);

  const startCreateNew = () => {
    setFormData({
      title: "",
      eyebrow: "TIM BIRU",
      body: "",
      imageUrl: "/art/char-biru.jpg",
      tone: "dark",
      sortOrder: items.length,
      isPublished: true,
    });
    setEditingId(null);
    setFormErrors({});
  };

  const loadCharacters = useCallback(async () => {
    try {
      const res = await fetch("/api/landing-cards?scope=admin&slot=karakter");
      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        setError(json.message || "Gagal memuat jagoan");
        return;
      }
      const loaded = (json.data || []).sort(
        (a, b) => a.sortOrder - b.sortOrder,
      );
      setItems(loaded);
      if (loaded.length > 0 && editingId === null) {
        selectCardForEdit(loaded[0]);
      }
    } catch (err) {
      setError("Gagal memuat jagoan");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [editingId, selectCardForEdit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCharacters();
  }, [loadCharacters]);

  const handleImageUploaded = (asset: UploadedAsset) => {
    setFormData((prev) => ({ ...prev, imageUrl: asset.publicUrl }));
    setToast({
      message: "Gambar jagoan diunggah. Klik Simpan untuk menerapkan.",
      type: "success",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      const isEditing = editingId !== null;
      const payload = {
        slot: "karakter",
        eyebrow: formData.eyebrow.trim() || undefined,
        title: formData.title.trim(),
        body: formData.body.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        tone: formData.tone,
        sortOrder: formData.sortOrder,
        isPublished: formData.isPublished ? 1 : 0,
      };

      const res = await fetch(
        isEditing ? `/api/landing-cards/${editingId}` : "/api/landing-cards",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        if (json.fields) setFormErrors(json.fields);
        setToast({
          message: json.message || "Gagal menyimpan data jagoan",
          type: "error",
        });
        return;
      }

      setToast({
        message: isEditing ? "Jagoan diperbarui" : "Jagoan ditambahkan",
        type: "success",
      });
      await loadCharacters();
    } catch (err) {
      setToast({ message: "Terjadi kesalahan sistem", type: "error" });
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
          message: json.message || "Gagal menghapus jagoan",
          type: "error",
        });
        return;
      }
      setToast({ message: "Jagoan dihapus", type: "success" });
      if (editingId === deleteTarget.id) startCreateNew();
      await loadCharacters();
    } catch (err) {
      setToast({ message: "Gagal menghapus jagoan", type: "error" });
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

  const moveItem = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const newOrder = [...items];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);
    setItems(newOrder);
    await reorder(newOrder.map((c) => c.id));
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

  const handleSeedDefaults = async () => {
    setSubmitting(true);
    try {
      for (const [idx, seed] of DEFAULT_SEEDS.entries()) {
        await fetch("/api/landing-cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slot: "karakter",
            title: seed.title,
            eyebrow: seed.eyebrow,
            body: seed.body,
            imageUrl: seed.imageUrl,
            tone: seed.tone,
            sortOrder: idx,
            isPublished: 1,
          }),
        });
      }
      setToast({
        message: "4 Jagoan bawaan berhasil ditambahkan.",
        type: "success",
      });
      await loadCharacters();
    } catch (err) {
      setToast({ message: "Gagal menambahkan jagoan bawaan", type: "error" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-label="Memuat data jagoan">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-56" />
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
            Kelola Jagoan
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Atur kartu karakter pada seksi Pilih Jagoanmu di halaman utama.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href="/#karakter"
            target="_blank"
            rel="noopener noreferrer"
            className={adminButtonClass("secondary", "md")}
          >
            <ExternalLink className="h-4 w-4 text-zinc-400" />
            <span>Lihat di Beranda</span>
          </a>
          <button
            type="button"
            onClick={startCreateNew}
            className={adminButtonClass("primary", "md")}
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Jagoan</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Daftar Jagoan */}
        <div className="flex flex-col gap-3 lg:col-span-7">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Urutan Jagoan ({items.length})
            </h2>
            <span className="hidden text-xs text-zinc-400 sm:inline">
              Geser atau gunakan panah untuk mengatur urutan
            </span>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
              <Sparkles className="mb-3 h-7 w-7 text-zinc-400" />
              <h3 className="text-base font-semibold text-zinc-900">
                Belum ada jagoan kustom
              </h3>
              <p className="mt-1 mb-5 max-w-md text-sm text-zinc-500">
                Beranda saat ini memakai 4 jagoan bawaan. Anda dapat menyalin
                data bawaan tersebut untuk diedit langsung.
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSeedDefaults}
                  disabled={submitting}
                  className={adminButtonClass("primary", "md")}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Salin 4 Jagoan Bawaan</span>
                </button>
                <button
                  type="button"
                  onClick={startCreateNew}
                  className={adminButtonClass("secondary", "md")}
                >
                  <Plus className="h-4 w-4" />
                  <span>Buat Baru</span>
                </button>
              </div>
            </div>
          ) : (
            items.map((item, idx) => {
              const isSelected = editingId === item.id;
              const isOver = dragOverIdx === idx;
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
                  } ${isOver ? "border-dashed border-zinc-900" : ""}`}
                >
                  <div className="shrink-0 cursor-grab p-1 text-zinc-400 hover:text-zinc-700">
                    <GripVertical className="h-4 w-4" />
                  </div>

                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                    {item.imageUrl ? (
                      <Image
                        src={
                          resolvePublicAssetUrl(item.imageUrl) || item.imageUrl
                        }
                        alt={item.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-zinc-400">
                        Kosong
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-700">
                        {item.eyebrow || "JAGOAN"}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          item.isPublished === 1
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {item.isPublished === 1 ? "Terbit" : "Draf"}
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

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectCardForEdit(item);
                      }}
                      className={adminButtonClass("secondary", "icon-sm")}
                      title="Edit jagoan"
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
                      title="Hapus jagoan"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Form Inspector */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3.5">
              <h2 className="text-base font-bold text-zinc-900">
                {editingId ? "Edit Jagoan" : "Tambah Jagoan"}
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
                <label htmlFor="char-title" className={adminLabelClass}>
                  Nama Jagoan *
                </label>
                <input
                  id="char-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder="Contoh: Raka — Pelari Biru"
                  className={adminInputClass}
                />
                {formErrors.title && (
                  <p className={adminErrorClass}>{formErrors.title[0]}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="char-eyebrow" className={adminLabelClass}>
                    Peran / Tim
                  </label>
                  <input
                    id="char-eyebrow"
                    type="text"
                    value={formData.eyebrow}
                    onChange={(e) =>
                      setFormData({ ...formData, eyebrow: e.target.value })
                    }
                    placeholder="Contoh: TIM BIRU"
                    className={adminInputClass}
                  />
                </div>

                <div>
                  <span className={adminLabelClass}>Aksen Kartu</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { key: "dark", label: "Biru" },
                        { key: "ember", label: "Merah" },
                        { key: "light", label: "Hijau" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, tone: opt.key })
                        }
                        className={`min-h-11 rounded-xl border text-xs font-semibold transition-colors ${
                          formData.tone === opt.key
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="char-desc" className={adminLabelClass}>
                  Deskripsi Singkat
                </label>
                <textarea
                  id="char-desc"
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  rows={3}
                  placeholder="Contoh: Pelari gesit yang andal memancing penjaga lawan..."
                  className={adminTextareaClass}
                />
              </div>

              <div>
                <span className={adminLabelClass}>Gambar Jagoan</span>
                {formData.imageUrl && (
                  <div className="relative mb-2.5 h-36 w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                    <Image
                      src={
                        resolvePublicAssetUrl(formData.imageUrl) ||
                        formData.imageUrl
                      }
                      alt="Pratinjau jagoan"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
                <AssetUploader
                  purpose="landing-image"
                  onUploaded={handleImageUploaded}
                />
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-[11px] font-medium text-zinc-500">
                    Gambar game:
                  </span>
                  {PRESET_ART.map((preset) => (
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
                  {submitting
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Tambah Jagoan"}
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
        open={deleteTarget !== null}
        title="Hapus Jagoan"
        message={`Yakin ingin menghapus "${deleteTarget?.title}"?`}
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
