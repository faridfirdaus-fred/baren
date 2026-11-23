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
} from "lucide-react";
import { AssetUploader } from "./asset-uploader";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
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
    imageUrl: "",
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

  // Drag and drop state
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
      const res = await fetch("/api/landing-cards");
      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        setError(json.message || "Gagal memuat kartu");
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
      slot: "Karakter",
      eyebrow: "",
      title: "",
      subtitle: "",
      body: "",
      imageUrl: "",
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
      message: "Gambar berhasil diunggah ke R2.",
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
        message: "Perubahan disimpan",
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
      if (editingId === deleteTarget.id) {
        setEditingId(null);
      }
      await loadCards();
    } catch (err) {
      setToast({ message: "Gagal menghapus kartu", type: "error" });
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  // Reordering via Buttons
  const handleMoveUp = async (id: number) => {
    const idx = items.findIndex((c) => c.id === id);
    if (idx <= 0) return;
    const newOrder = [...items];
    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    setItems(newOrder);
    await reorder(newOrder.map((c) => c.id));
  };

  const handleMoveDown = async (id: number) => {
    const idx = items.findIndex((c) => c.id === id);
    if (idx < 0 || idx >= items.length - 1) return;
    const newOrder = [...items];
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    setItems(newOrder);
    await reorder(newOrder.map((c) => c.id));
  };

  // Drag and Drop Handlers
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

  if (loading) {
    return (
      <div className="p-8 text-center text-[#542d14] font-bold">
        Memuat kartu landing...
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
          <h1 className="text-3xl font-black text-[#2f180a] tracking-tight">
            Kartu Landing
          </h1>
          <p className="text-sm font-medium text-[#542d14] mt-1">
            Atur kartu konten yang tampil di beranda sesuai urutan
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#2f180a]/20 bg-white text-xs font-bold uppercase tracking-wider text-[#2f180a] hover:bg-[#faf6ee] shadow-sm transition-all"
          >
            <ExternalLink className="w-4 h-4 text-[#8c7b6d]" />
            <span>Lihat Situs</span>
          </a>
          <button
            type="button"
            onClick={startCreateNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c83820] hover:bg-[#a72d18] text-white text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Kartu</span>
          </button>
        </div>
      </div>

      {/* Master-Detail 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri: Reorderable Card List */}
        <div className="lg:col-span-7 flex flex-col gap-3.5">
          <div className="text-xs font-bold uppercase tracking-wider text-[#8c7b6d] px-1 flex items-center justify-between">
            <span>Daftar Kartu ({items.length})</span>
            <span className="text-[11px] text-[#542d14]">
              💡 Drag baris atau gunakan ↑ ↓ untuk mengurutkan
            </span>
          </div>

          {items.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border-2 border-dashed border-[#2f180a]/15 text-center text-[#8c7b6d]">
              Belum ada kartu landing. Klik tombol{" "}
              <strong>+ Tambah Kartu</strong>.
            </div>
          ) : (
            items.map((item, idx) => {
              const isSelected = editingId === item.id;
              const isDragTarget = dragOverIdx === idx;

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={`group relative flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white border-2 transition-all cursor-grab active:cursor-grabbing ${
                    isSelected
                      ? "border-[#c83820] ring-2 ring-[#c83820]/30 shadow-md"
                      : "border-[#2f180a]/12 hover:border-[#2f180a]/30 shadow-sm"
                  } ${isDragTarget ? "border-t-4 border-t-[#f59e0b] bg-[#fef3c7]/20" : ""}`}
                >
                  {/* Reorder Buttons & Handle */}
                  <div className="flex flex-col items-center gap-1 text-[#8c7b6d] shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleMoveUp(item.id);
                      }}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-[#faf6ee] text-[#2f180a] disabled:opacity-30 cursor-pointer"
                      title="Pindah ke atas"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <GripVertical className="w-4 h-4 text-[#8c7b6d]/60 group-hover:text-[#2f180a]" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleMoveDown(item.id);
                      }}
                      disabled={idx === items.length - 1}
                      className="p-1 rounded hover:bg-[#faf6ee] text-[#2f180a] disabled:opacity-30 cursor-pointer"
                      title="Pindah ke bawah"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div
                    onClick={() => selectCardForEdit(item)}
                    className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden bg-[#2f180a] shrink-0 border border-[#2f180a]/15 cursor-pointer"
                  >
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
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-white/50 uppercase font-bold">
                        No Img
                      </div>
                    )}
                  </div>

                  {/* Content & Badges */}
                  <div
                    onClick={() => selectCardForEdit(item)}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <h3 className="text-sm sm:text-base font-black text-[#2f180a] truncate leading-tight">
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {item.isPublished === 1 ? (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#10b981] text-white">
                          TERBIT
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-stone-300 text-stone-700">
                          DRAF
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e]">
                        {item.tone === "ember"
                          ? "HANGAT"
                          : item.tone === "light"
                            ? "TERANG"
                            : "GELAP"}
                      </span>
                      <span className="text-[11px] font-medium text-[#8c7b6d]">
                        Slot: {item.slot || "Umum"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => selectCardForEdit(item)}
                      className={`p-2 rounded-xl border border-[#2f180a]/15 transition-all ${
                        isSelected
                          ? "bg-[#c83820] text-white border-transparent"
                          : "bg-white text-[#2f180a] hover:bg-[#faf6ee]"
                      }`}
                      title="Edit kartu"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({ id: item.id, title: item.title })
                      }
                      className="p-2 rounded-xl border border-[#2f180a]/15 bg-white text-[#c83820] hover:bg-red-50 transition-all"
                      title="Hapus kartu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Kolom Kanan: Inspector Formulir Edit Kartu */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl bg-white border-2 border-[#2f180a]/15 p-6 sm:p-7 shadow-lg sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-[#2f180a]/10 mb-5">
              <h2 className="text-xl font-black text-[#2f180a]">
                {editingId ? "Edit Kartu" : "Tambah Kartu"}
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
                  htmlFor="card-title"
                  className="block text-xs font-bold uppercase tracking-wider text-[#2f180a] mb-1.5"
                >
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
                  placeholder="Contoh: Rebut benteng bersama tim"
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
                  htmlFor="card-desc"
                  className="block text-xs font-bold uppercase tracking-wider text-[#2f180a] mb-1.5"
                >
                  Deskripsi
                </label>
                <textarea
                  id="card-desc"
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  rows={3}
                  placeholder="Deskripsi singkat aksi atau keunggulan kartu..."
                  className="w-full rounded-xl border-2 border-[#2f180a]/15 px-3.5 py-2.5 text-sm text-[#2f180a] focus:border-[#c83820] focus:outline-none bg-[#faf6ee]/50 font-medium resize-none"
                />
              </div>

              {/* Upload Gambar Drag & Drop */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2f180a] mb-1.5">
                  Gambar
                </label>
                <div className="rounded-2xl border-2 border-dashed border-[#2f180a]/20 p-3 bg-[#faf6ee]/40">
                  {formData.imageUrl ? (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#2f180a] mb-3">
                      <Image
                        src={
                          resolvePublicAssetUrl(formData.imageUrl) ||
                          formData.imageUrl
                        }
                        alt="Pratinjau"
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
                </div>
              </div>

              {/* Teks Tombol & Tautan */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="cta-label"
                    className="block text-xs font-bold uppercase tracking-wider text-[#2f180a] mb-1"
                  >
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
                    className="w-full rounded-xl border-2 border-[#2f180a]/15 px-3 py-2 text-xs text-[#2f180a] bg-[#faf6ee]/50 focus:border-[#c83820] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cta-url"
                    className="block text-xs font-bold uppercase tracking-wider text-[#2f180a] mb-1"
                  >
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
                    className="w-full rounded-xl border-2 border-[#2f180a]/15 px-3 py-2 text-xs text-[#2f180a] bg-[#faf6ee]/50 focus:border-[#c83820] focus:outline-none"
                  />
                </div>
              </div>

              {/* Slot & Tone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="card-slot"
                    className="block text-xs font-bold uppercase tracking-wider text-[#2f180a] mb-1"
                  >
                    Slot
                  </label>
                  <input
                    id="card-slot"
                    type="text"
                    value={formData.slot}
                    onChange={(e) =>
                      setFormData({ ...formData, slot: e.target.value })
                    }
                    placeholder="Tentang / Karakter / Fitur"
                    className="w-full rounded-xl border-2 border-[#2f180a]/15 px-3 py-2 text-xs text-[#2f180a] bg-[#faf6ee]/50 focus:border-[#c83820] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="card-tone"
                    className="block text-xs font-bold uppercase tracking-wider text-[#2f180a] mb-1"
                  >
                    Tema (Tone)
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
                    className="w-full rounded-xl border-2 border-[#2f180a]/15 px-3 py-2 text-xs text-[#2f180a] bg-[#faf6ee]/50 focus:border-[#c83820] focus:outline-none"
                  >
                    <option value="light">Terang (Parchment)</option>
                    <option value="dark">Gelap (Timber)</option>
                    <option value="ember">Hangat (Terracotta)</option>
                  </select>
                </div>
              </div>

              {/* Toggle Tampilkan di Beranda */}
              <div className="flex items-center justify-between py-2 border-y border-[#2f180a]/10">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2f180a]">
                  Tampilkan di beranda
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPublished: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10b981]" />
                </label>
              </div>

              {/* Form Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#c83820] hover:bg-[#a72d18] text-white font-black text-sm uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{submitting ? "Menyimpan..." : "✓ Simpan"}</span>
                </button>
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

      {/* Floating Bottom-Right Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-once">
          <div className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#10b981] text-white font-black text-sm shadow-2xl border-2 border-white">
            <span>✓</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
