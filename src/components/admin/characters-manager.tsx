"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  ExternalLink,
  Check,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Users,
} from "lucide-react";
import { AssetUploader } from "./asset-uploader";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
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

const DEFAULT_SEEDS = [
  {
    title: "Maskot Oranye",
    eyebrow: "TIM ORANYE",
    tone: "ember" as const,
    imageUrl: "/art/agents-art.jpg",
    body: "Pelari tangguh bermahkota adat oranye yang lincah merebut benteng lawan.",
  },
  {
    title: "Maskot Biru",
    eyebrow: "TIM BIRU",
    tone: "dark" as const,
    imageUrl: "/art/about-art.jpg",
    body: "Penjaga benteng setia bertudung biru yang sigap menangkap penyusup.",
  },
  {
    title: "Pelari Kampung",
    eyebrow: "SIAP BERLARI",
    tone: "light" as const,
    imageUrl: "/art/feature-1.jpg",
    body: "Anak kampung pemberani berikat kepala batik Nusantara dengan dash cepat.",
  },
];

export function CharactersManager() {
  const [items, setItems] = useState<CharacterCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CharacterFormData>({
    title: "",
    eyebrow: "TIM ORANYE",
    body: "",
    imageUrl: "/art/agents-art.jpg",
    tone: "ember",
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

  // Drag and drop state
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
      eyebrow: "TIM ORANYE",
      body: "",
      imageUrl: "",
      tone: "ember",
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
      message:
        "Artwork jagoan berhasil diunggah. Klik 'Simpan' untuk menerapkan.",
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
        if (json.fields) {
          setFormErrors(json.fields);
        }
        setToast({
          message: json.message || "Gagal menyimpan data jagoan",
          type: "error",
        });
        return;
      }

      setToast({
        message: isEditing
          ? "Jagoan berhasil diperbarui"
          : "Jagoan baru berhasil ditambahkan",
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

      setToast({ message: "Jagoan berhasil dihapus", type: "success" });
      setDeleteTarget(null);

      if (editingId === deleteTarget.id) {
        startCreateNew();
      }

      await loadCharacters();
    } catch (err) {
      setToast({ message: "Gagal menghapus jagoan", type: "error" });
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

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    setDragOverIdx(idx);
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
      setToast({ message: "Urutan berhasil diperbarui", type: "success" });
    } catch (err) {
      setToast({ message: "Gagal mengubah urutan", type: "error" });
      console.error(err);
    }
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
        message: "3 Jagoan bawaan berhasil disalin ke basis data!",
        type: "success",
      });
      await loadCharacters();
    } catch (err) {
      setToast({ message: "Gagal menyalin jagoan bawaan", type: "error" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[#542d14] font-bold">
        Memuat data jagoan...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-[#c83820] font-bold rounded-2xl border border-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#c83820]/10 text-[#c83820]">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-3xl font-black text-[#2f180a] tracking-tight">
              Kelola Jagoan (Karakter)
            </h1>
          </div>
          <p className="text-sm font-medium text-[#542d14] mt-1">
            Atur kartu jagoan di seksi &ldquo;Pilih Jagoanmu&rdquo; pada beranda
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/#karakter"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#2f180a]/20 bg-white text-xs font-bold uppercase tracking-wider text-[#2f180a] hover:bg-[#faf6ee] shadow-sm transition-all"
          >
            <ExternalLink className="w-4 h-4 text-[#8c7b6d]" />
            <span>Lihat di Beranda</span>
          </a>
          <button
            type="button"
            onClick={startCreateNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c83820] hover:bg-[#a72d18] text-white text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jagoan</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Daftar Jagoan & Form Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri: Daftar Jagoan Deck */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-[#542d14]">
              Urutan Jagoan ({items.length})
            </span>
            <span className="text-xs text-[#8c7b6d] font-medium hidden sm:inline">
              Geser kartu atau pakai panah untuk mengubah urutan
            </span>
          </div>

          {items.length === 0 ? (
            <div className="p-8 text-center rounded-3xl border-2 border-dashed border-[#2f180a]/20 bg-white flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-black text-[#2f180a]">
                Belum Ada Jagoan Tersimpan
              </h2>
              <p className="text-sm text-[#542d14] max-w-md mt-1 mb-6 leading-relaxed">
                Saat ini situs publik menampilkan 3 jagoan bawaan (Maskot
                Oranye, Maskot Biru, dan Pelari Kampung). Salin data bawaan ini
                agar bisa diedit langsung!
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  type="button"
                  onClick={handleSeedDefaults}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#c83820] text-white text-sm font-bold uppercase tracking-wider shadow-md hover:bg-[#a72d18] transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Salin 3 Jagoan Bawaan</span>
                </button>
                <button
                  type="button"
                  onClick={startCreateNew}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-[#2f180a]/20 bg-white text-sm font-bold uppercase tracking-wider text-[#2f180a] hover:bg-[#faf6ee] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat dari Kosong</span>
                </button>
              </div>
            </div>
          ) : (
            items.map((item, idx) => {
              const isSelected = editingId === item.id;
              const isOver = dragOverIdx === idx;
              const isBeingDragged = draggedIdx === idx;

              const toneBadge =
                item.tone === "ember"
                  ? "bg-[#e4572e] text-white"
                  : item.tone === "dark"
                    ? "bg-[#2563eb] text-white"
                    : "bg-[#10b981] text-white";

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={`group relative flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border-2 transition-all bg-white cursor-pointer ${
                    isSelected
                      ? "border-[#c83820] shadow-md ring-2 ring-[#c83820]/10"
                      : "border-[#2f180a]/15 hover:border-[#2f180a]/30"
                  } ${isOver ? "border-dashed border-amber-500 scale-[1.01]" : ""} ${
                    isBeingDragged ? "opacity-40" : "opacity-100"
                  }`}
                  onClick={() => selectCardForEdit(item)}
                >
                  {/* Drag Handle */}
                  <div
                    className="text-[#8c7b6d] hover:text-[#2f180a] cursor-grab active:cursor-grabbing p-1 shrink-0"
                    title="Tarik untuk memindahkan urutan"
                  >
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#2f180a] border border-[#2f180a]/15 shrink-0">
                    {item.imageUrl ? (
                      <Image
                        src={
                          resolvePublicAssetUrl(item.imageUrl) || item.imageUrl
                        }
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/40">
                        No Art
                      </div>
                    )}
                  </div>

                  {/* Info Jagoan */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${toneBadge}`}
                      >
                        {item.eyebrow || "JAGOAN"}
                      </span>
                      {item.isPublished === 1 ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#10b981] flex items-center gap-1">
                          <Check className="w-3 h-3" /> Terbit
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c7b6d]">
                          Draf
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-[#2f180a] truncate leading-tight">
                      {item.title}
                    </h3>
                    {item.body && (
                      <p className="text-xs text-[#542d14] line-clamp-1 mt-0.5 font-medium">
                        {item.body}
                      </p>
                    )}
                  </div>

                  {/* Quick Order Up/Down Buttons */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        void moveItem(idx, "up");
                      }}
                      className="p-1 rounded-lg border border-[#2f180a]/15 text-[#2f180a] hover:bg-[#faf6ee] disabled:opacity-20 transition-all"
                      title="Naikkan urutan"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        void moveItem(idx, "down");
                      }}
                      className="p-1 rounded-lg border border-[#2f180a]/15 text-[#2f180a] hover:bg-[#faf6ee] disabled:opacity-20 transition-all"
                      title="Turunkan urutan"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectCardForEdit(item);
                      }}
                      className={`p-2 rounded-xl border border-[#2f180a]/15 transition-all ${
                        isSelected
                          ? "bg-[#c83820] text-white border-transparent"
                          : "bg-white text-[#2f180a] hover:bg-[#faf6ee]"
                      }`}
                      title="Edit jagoan"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({ id: item.id, title: item.title });
                      }}
                      className="p-2 rounded-xl border border-[#2f180a]/15 bg-white text-[#c83820] hover:bg-red-50 transition-all"
                      title="Hapus jagoan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Kolom Kanan: Inspector Formulir Edit Jagoan */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl bg-white border-2 border-[#2f180a]/15 p-6 sm:p-7 shadow-lg sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-[#2f180a]/10 mb-5">
              <h2 className="text-xl font-black text-[#2f180a]">
                {editingId ? "Edit Jagoan" : "Tambah Jagoan"}
              </h2>
              {formData.isPublished ? (
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#10b981] text-white">
                  TERBIT
                </span>
              ) : (
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-stone-300 text-stone-700">
                  DRAF
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="char-title"
                  className="block text-xs font-bold uppercase tracking-wider text-[#2f180a] mb-1.5"
                >
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
                  placeholder="Contoh: Maskot Oranye"
                  className="w-full rounded-xl border-2 border-[#2f180a]/15 px-3.5 py-2.5 text-sm text-[#2f180a] focus:border-[#c83820] focus:outline-none bg-[#faf6ee]/50 font-medium"
                />
                {formErrors.title && (
                  <p className="text-xs font-bold text-[#c83820] mt-1">
                    {formErrors.title[0]}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="char-eyebrow"
                  className="block text-xs font-bold uppercase tracking-wider text-[#2f180a] mb-1.5"
                >
                  Peran / Label Tim
                </label>
                <input
                  id="char-eyebrow"
                  type="text"
                  value={formData.eyebrow}
                  onChange={(e) =>
                    setFormData({ ...formData, eyebrow: e.target.value })
                  }
                  placeholder="Contoh: TIM ORANYE atau PELARI CEPAT"
                  className="w-full rounded-xl border-2 border-[#2f180a]/15 px-3.5 py-2.5 text-sm text-[#2f180a] focus:border-[#c83820] focus:outline-none bg-[#faf6ee]/50 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2f180a] mb-1.5">
                  Warna Tim / Tema Tag
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tone: "ember" })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-1.5 ${
                      formData.tone === "ember"
                        ? "border-[#e4572e] bg-[#e4572e] text-white shadow-sm"
                        : "border-[#2f180a]/15 bg-white text-[#2f180a] hover:bg-[#faf6ee]"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white/80" />
                    <span>Oranye</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tone: "dark" })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-1.5 ${
                      formData.tone === "dark"
                        ? "border-[#2563eb] bg-[#2563eb] text-white shadow-sm"
                        : "border-[#2f180a]/15 bg-white text-[#2f180a] hover:bg-[#faf6ee]"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white/80" />
                    <span>Biru</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tone: "light" })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-1.5 ${
                      formData.tone === "light"
                        ? "border-[#10b981] bg-[#10b981] text-white shadow-sm"
                        : "border-[#2f180a]/15 bg-white text-[#2f180a] hover:bg-[#faf6ee]"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white/80" />
                    <span>Hijau</span>
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="char-desc"
                  className="block text-xs font-bold uppercase tracking-wider text-[#2f180a] mb-1.5"
                >
                  Deskripsi Keahlian & Karakter
                </label>
                <textarea
                  id="char-desc"
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  rows={3}
                  placeholder="Contoh: Pelari tangguh bermahkota adat yang lincah merebut benteng lawan..."
                  className="w-full rounded-xl border-2 border-[#2f180a]/15 px-3.5 py-2.5 text-sm text-[#2f180a] focus:border-[#c83820] focus:outline-none bg-[#faf6ee]/50 font-medium resize-none"
                />
              </div>

              {/* Upload Gambar Artwork Jagoan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2f180a] mb-1.5">
                  Foto / Artwork Jagoan
                </label>
                <AssetUploader
                  purpose="landing-image"
                  onUploaded={handleImageUploaded}
                />

                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="/art/agents-art.jpg atau URL Cloudflare R2"
                    className="w-full rounded-xl border border-[#2f180a]/15 px-3 py-1.5 text-xs text-[#2f180a] bg-white font-mono"
                  />
                </div>

                {/* Tombol Pilihan Aset Bawaan */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-[#8c7b6d] font-bold self-center mr-1">
                    Aset cepat:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        imageUrl: "/art/agents-art.jpg",
                      })
                    }
                    className="px-2 py-0.5 rounded-lg border border-[#2f180a]/15 bg-[#faf6ee] text-[10px] font-bold text-[#2f180a] hover:bg-[#c83820] hover:text-white transition-all"
                  >
                    Agents Art
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        imageUrl: "/art/about-art.jpg",
                      })
                    }
                    className="px-2 py-0.5 rounded-lg border border-[#2f180a]/15 bg-[#faf6ee] text-[10px] font-bold text-[#2f180a] hover:bg-[#c83820] hover:text-white transition-all"
                  >
                    About Art
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        imageUrl: "/art/feature-1.jpg",
                      })
                    }
                    className="px-2 py-0.5 rounded-lg border border-[#2f180a]/20 bg-[#faf6ee] text-[10px] font-bold text-[#2f180a] hover:bg-[#c83820] hover:text-white transition-all"
                  >
                    Pelari Art
                  </button>
                </div>
              </div>

              {/* Status Publikasi */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#faf6ee] border border-[#2f180a]/10 mt-2">
                <span className="text-xs font-bold text-[#2f180a] uppercase tracking-wider">
                  Publikasikan di Beranda
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      isPublished: !formData.isPublished,
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    formData.isPublished ? "bg-[#10b981]" : "bg-stone-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      formData.isPublished ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Action Buttons Form */}
              <div className="flex gap-2.5 mt-3 pt-3 border-t border-[#2f180a]/10">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#c83820] hover:bg-[#a72d18] text-white text-xs font-black uppercase tracking-wider shadow-md transition-all disabled:opacity-50 cursor-pointer"
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
                    className="py-3 px-4 rounded-xl border border-[#2f180a]/20 bg-white text-xs font-bold uppercase tracking-wider text-[#2f180a] hover:bg-[#faf6ee] transition-all"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Dialog Konfirmasi Hapus */}
      <DeleteConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Jagoan Ini?"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast Feedback */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold text-white transition-all animate-bounce ${
            toast.type === "success" ? "bg-[#10b981]" : "bg-[#c83820]"
          }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-80 p-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
