"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { ExternalLink, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";

import { AssetUploader } from "@/components/admin/asset-uploader";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { Toast } from "@/components/admin/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { adminButtonClass } from "@/components/admin/button-styles";
import {
  adminErrorClass,
  adminHelpClass,
  adminInputClass,
  adminLabelClass,
  adminSelectClass,
} from "@/components/admin/form-styles";
import {
  parseGalleryApiResult,
  type GalleryAsset,
  type GalleryDeleteData,
} from "@/lib/admin-gallery-client";
import { galleryKinds, type GalleryKind } from "@/lib/validation/gallery";
import type { UploadedAsset } from "@/lib/assets-client";
import { resolvePublicAssetUrl } from "@/lib/assets-url";

type GalleryFormValues = {
  kind: GalleryKind;
  title: string;
  sortOrder: number;
};

const emptyValues: GalleryFormValues = {
  kind: "screenshot",
  title: "",
  sortOrder: 0,
};

const kindLabels: Record<GalleryKind, string> = {
  image: "Gambar Umum",
  screenshot: "Tangkapan Layar",
  artwork: "Ilustrasi Game",
  banner: "Spanduk Event",
  video: "Video Gameplay",
};

const DEFAULT_GALLERY_SEEDS: Array<{
  kind: GalleryKind;
  title: string;
  fileUrl: string;
}> = [
  {
    kind: "screenshot",
    title: "Duel 2 vs 2 di Lapang Kampung",
    fileUrl: "/art/feature-1.jpg",
  },
  {
    kind: "screenshot",
    title: "Aksi Tag & Penyelamatan Tahanan",
    fileUrl: "/art/about-art.jpg",
  },
  {
    kind: "artwork",
    title: "Suasana Booth BAREN di Event",
    fileUrl: "/art/event-art.jpg",
  },
  {
    kind: "screenshot",
    title: "Arena Pasar Ramai",
    fileUrl: "/art/feature-3.jpg",
  },
];

async function fetchGallery(signal?: AbortSignal) {
  const response = await fetch("/api/gallery", { cache: "no-store", signal });
  return parseGalleryApiResult<GalleryAsset[]>(await response.json());
}

export function AdminGalleryManager() {
  const router = useRouter();
  const requestVersion = useRef(0);
  const [items, setItems] = useState<GalleryAsset[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<"semua" | GalleryKind>("semua");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryAsset | null>(null);
  const [uploaded, setUploaded] = useState<UploadedAsset | null>(null);
  const [presetUrl, setPresetUrl] = useState<string>("");
  const [seeding, setSeeding] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<GalleryFormValues>({ defaultValues: emptyValues });

  const loadGallery = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoadError(null);
    try {
      const result = await fetchGallery();
      if (version !== requestVersion.current) return;
      if (!result.ok) {
        setLoadError(result.error.message);
        return;
      }
      setItems(result.data);
    } catch {
      if (version === requestVersion.current) {
        setLoadError("Galeri tidak dapat dimuat. Coba lagi.");
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const version = ++requestVersion.current;
    void fetchGallery(controller.signal)
      .then((result) => {
        if (controller.signal.aborted || version !== requestVersion.current)
          return;
        if (!result.ok) {
          setLoadError(result.error.message);
          return;
        }
        setItems(result.data);
      })
      .catch(() => {
        if (!controller.signal.aborted && version === requestVersion.current) {
          setLoadError("Galeri tidak dapat dimuat. Coba lagi.");
        }
      });
    return () => controller.abort();
  }, []);

  const visibleItems = useMemo(() => {
    if (!items) return null;
    const filtered =
      kindFilter === "semua"
        ? items
        : items.filter((item) => item.kind === kindFilter);
    return [...filtered].sort(
      (a, b) => a.sortOrder - b.sortOrder || a.id - b.id,
    );
  }, [items, kindFilter]);

  function cancelEdit() {
    setEditingId(null);
    setUploaded(null);
    setPresetUrl("");
    clearErrors();
    reset({ ...emptyValues, sortOrder: items?.length ?? 0 });
  }

  function applyServerErrors(fields?: Record<string, string[]>) {
    for (const [name, messages] of Object.entries(fields ?? {})) {
      if (name === "kind" || name === "title" || name === "sortOrder") {
        setError(name as FieldPath<GalleryFormValues>, {
          type: "server",
          message: messages[0],
        });
      }
    }
  }

  async function submit(values: GalleryFormValues) {
    requestVersion.current += 1;
    clearErrors("root");
    const fileUrl = uploaded?.publicUrl || presetUrl;
    const body =
      editingId === null
        ? { ...values, title: values.title || null, fileUrl }
        : {
            ...values,
            title: values.title || null,
            ...(fileUrl ? { fileUrl } : {}),
          };
    if (editingId === null && !fileUrl) {
      setError("root", {
        type: "server",
        message: "Unggah gambar/video terlebih dahulu sebelum menyimpan.",
      });
      return;
    }
    const endpoint =
      editingId === null ? "/api/gallery" : `/api/gallery/${editingId}`;
    const method = editingId === null ? "POST" : "PUT";
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = parseGalleryApiResult<GalleryAsset>(await response.json());
      if (!result.ok) {
        applyServerErrors(result.error.fields);
        setError("root", { type: "server", message: result.error.message });
        return;
      }
      setToast({
        message:
          editingId === null
            ? "Media ditambahkan ke galeri"
            : "Media diperbarui",
        type: "success",
      });
      cancelEdit();
      await loadGallery();
      router.refresh();
    } catch {
      setError("root", {
        type: "server",
        message: "Aset galeri tidak dapat disimpan. Coba lagi.",
      });
    }
  }

  function edit(item: GalleryAsset) {
    setEditingId(item.id);
    setUploaded(null);
    setPresetUrl("");
    clearErrors();
    reset({
      kind: item.kind,
      title: item.title ?? "",
      sortOrder: item.sortOrder,
    });
  }

  async function confirmRemove() {
    if (!deleteTarget) return;
    requestVersion.current += 1;
    try {
      const response = await fetch(`/api/gallery/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const result = parseGalleryApiResult<GalleryDeleteData>(
        await response.json(),
      );
      if (!result.ok) {
        setToast({ message: result.error.message, type: "error" });
        return;
      }
      setToast({ message: "Media dihapus dari galeri", type: "success" });
      if (editingId === deleteTarget.id) cancelEdit();
      await loadGallery();
      router.refresh();
    } catch {
      setToast({
        message: "Aset galeri tidak dapat dihapus. Coba lagi.",
        type: "error",
      });
    } finally {
      setDeleteTarget(null);
    }
  }

  async function handleSeedDefaults() {
    setSeeding(true);
    try {
      for (const [idx, seed] of DEFAULT_GALLERY_SEEDS.entries()) {
        await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...seed, sortOrder: idx }),
        });
      }
      setToast({
        message: "4 Gambar galeri bawaan berhasil ditambahkan.",
        type: "success",
      });
      await loadGallery();
    } catch {
      setToast({ message: "Gagal menyalin galeri bawaan", type: "error" });
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Kelola Galeri
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Unggah tangkapan layar gameplay, ilustrasi karakter, atau video
            arena BAREN.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href="/#galeri"
            target="_blank"
            rel="noopener noreferrer"
            className={adminButtonClass("secondary", "md")}
          >
            <ExternalLink className="h-4 w-4 text-zinc-400" />
            <span>Lihat di Beranda</span>
          </a>
          <button
            type="button"
            onClick={cancelEdit}
            className={adminButtonClass("primary", "md")}
          >
            <Plus className="h-4 w-4" />
            <span>Media Baru</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Daftar Aset Galeri */}
        <section
          aria-labelledby="gallery-list-heading"
          className="space-y-4 lg:col-span-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="gallery-list-heading"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Daftar Media ({visibleItems?.length ?? 0})
            </h2>
            <div className="w-44">
              <label htmlFor="gallery-filter" className="sr-only">
                Saring jenis
              </label>
              <select
                id="gallery-filter"
                value={kindFilter}
                className={adminSelectClass}
                onChange={(event) =>
                  setKindFilter(event.target.value as "semua" | GalleryKind)
                }
              >
                <option value="semua">Semua Jenis</option>
                {galleryKinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {kindLabels[kind]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {items === null && loadError === null ? (
            <div
              className="grid gap-4 sm:grid-cols-2"
              role="status"
              aria-label="Memuat galeri"
            >
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-video w-full rounded-2xl" />
              ))}
            </div>
          ) : null}

          {loadError ? (
            <div
              role="alert"
              className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <p>{loadError}</p>
              <button
                type="button"
                onClick={() => void loadGallery()}
                className={adminButtonClass("secondary", "sm")}
              >
                Coba lagi
              </button>
            </div>
          ) : null}

          {visibleItems !== null && !loadError && visibleItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
              <Sparkles className="mb-3 h-7 w-7 text-zinc-400" />
              <h3 className="text-base font-semibold text-zinc-900">
                Galeri masih kosong
              </h3>
              <p className="mt-1 mb-5 max-w-md text-sm text-zinc-500">
                Salin 4 tangkapan layar bawaan game BAREN atau unggah gambar
                baru di formulir samping.
              </p>
              <button
                type="button"
                onClick={() => void handleSeedDefaults()}
                disabled={seeding}
                className={adminButtonClass("primary", "md")}
              >
                <Sparkles className="h-4 w-4" />
                <span>Salin 4 Media Bawaan</span>
              </button>
            </div>
          ) : null}

          {visibleItems !== null && !loadError && visibleItems.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {visibleItems.map((item) => (
                <li key={item.id}>
                  <article
                    className={`overflow-hidden rounded-2xl border bg-white transition-all ${
                      editingId === item.id
                        ? "border-zinc-900 ring-2 ring-zinc-900/10"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <div className="relative aspect-video w-full bg-zinc-100">
                      {item.kind === "video" ? (
                        <video
                          src={
                            resolvePublicAssetUrl(item.fileUrl) || item.fileUrl
                          }
                          preload="metadata"
                          muted
                          playsInline
                          controls
                          className="h-full w-full object-cover"
                          aria-label={item.title || "Video galeri"}
                        />
                      ) : (
                        <Image
                          src={
                            resolvePublicAssetUrl(item.fileUrl) || item.fileUrl
                          }
                          alt={item.title || `Gambar galeri ${item.id}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 p-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-zinc-900">
                          {item.title || "Tanpa judul"}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {kindLabels[item.kind]} · Urutan {item.sortOrder}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => edit(item)}
                          className={adminButtonClass("secondary", "icon-sm")}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className={adminButtonClass("danger", "icon-sm")}
                          title="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        {/* Form Unggah Media */}
        <section
          aria-labelledby="gallery-form-heading"
          className="lg:col-span-5"
        >
          <form
            onSubmit={(event) => {
              void handleSubmit(submit)(event);
            }}
            className="sticky top-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"
          >
            <div className="border-b border-zinc-100 pb-3.5">
              <h2
                id="gallery-form-heading"
                className="text-base font-bold text-zinc-900"
              >
                {editingId === null ? "Unggah ke Galeri" : "Edit Media Galeri"}
              </h2>
            </div>

            <div>
              <span className={adminLabelClass}>Berkas Gambar / Video</span>
              <AssetUploader
                purpose="gallery"
                onUploaded={(asset) => {
                  setUploaded(asset);
                  setPresetUrl("");
                }}
              />
              {(uploaded?.publicUrl || presetUrl) && (
                <p className={adminHelpClass}>
                  Berkas siap disimpan:{" "}
                  <span className="font-medium text-zinc-700">
                    {uploaded?.publicUrl ? "Hasil unggah baru" : presetUrl}
                  </span>
                </p>
              )}
              {editingId !== null && (
                <p className={adminHelpClass}>
                  Biarkan kosong jika tidak ingin mengganti berkas yang sudah
                  ada.
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[11px] font-medium text-zinc-500">
                  Gambar game:
                </span>
                {DEFAULT_GALLERY_SEEDS.map((preset) => (
                  <button
                    key={preset.fileUrl}
                    type="button"
                    onClick={() => {
                      setPresetUrl(preset.fileUrl);
                      setUploaded(null);
                    }}
                    className={`rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
                      presetUrl === preset.fileUrl
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    {preset.title.split(" ")[0]} {preset.title.split(" ")[1]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label htmlFor="gallery-kind" className={adminLabelClass}>
                  Jenis Media
                </label>
                <select
                  id="gallery-kind"
                  className={adminSelectClass}
                  {...register("kind")}
                >
                  {galleryKinds.map((kind) => (
                    <option key={kind} value={kind}>
                      {kindLabels[kind]}
                    </option>
                  ))}
                </select>
                {errors.kind && (
                  <p role="alert" className={adminErrorClass}>
                    {errors.kind.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="gallery-sort-order" className={adminLabelClass}>
                  Urutan
                </label>
                <input
                  id="gallery-sort-order"
                  type="number"
                  min={0}
                  step={1}
                  required
                  className={adminInputClass}
                  {...register("sortOrder", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="gallery-title" className={adminLabelClass}>
                Judul / Keterangan (Opsional)
              </label>
              <input
                id="gallery-title"
                type="text"
                placeholder="Contoh: Perebutan Benteng di Lapang Kampung"
                className={adminInputClass}
                {...register("title")}
              />
              {errors.title && (
                <p role="alert" className={adminErrorClass}>
                  {errors.title.message}
                </p>
              )}
            </div>

            {errors.root && (
              <p role="alert" className={adminErrorClass}>
                {errors.root.message}
              </p>
            )}

            <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={adminButtonClass("primary", "md", "flex-1")}
              >
                {isSubmitting
                  ? "Menyimpan..."
                  : editingId === null
                    ? "Tambah Media"
                    : "Simpan Perubahan"}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={isSubmitting}
                  className={adminButtonClass("secondary", "md")}
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </section>
      </div>

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Media Galeri"
        message={`Hapus "${deleteTarget?.title || "media ini"}" dari galeri?`}
        onConfirm={() => void confirmRemove()}
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
