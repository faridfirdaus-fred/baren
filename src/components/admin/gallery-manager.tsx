"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";

import { AssetUploader } from "@/components/admin/asset-uploader";
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

type GalleryFormValues = {
  kind: GalleryKind;
  title: string;
  sortOrder: number;
};

const emptyValues: GalleryFormValues = {
  kind: "image",
  title: "",
  sortOrder: 0,
};

const kindLabels: Record<GalleryKind, string> = {
  image: "Gambar",
  screenshot: "Tangkapan layar",
  artwork: "Artwork",
  banner: "Spanduk",
  video: "Video",
};

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
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<UploadedAsset | null>(null);
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
    clearErrors();
    reset(emptyValues);
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
    setNotice(null);
    // Tambah baru wajib diawali unggahan R2 yang sukses; record DB hanya
    // dibuat setelah berkas terunggah (unggahan gagal tidak membuat record).
    const fileUrl =
      editingId === null ? uploaded?.publicUrl : uploaded?.publicUrl;
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
        message: "Unggah berkas terlebih dahulu sebelum menyimpan.",
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
    setNotice(null);
    clearErrors();
    reset({
      kind: item.kind,
      title: item.title ?? "",
      sortOrder: item.sortOrder,
    });
  }

  async function remove(item: GalleryAsset) {
    if (!window.confirm(`Hapus aset galeri “${item.title || item.fileUrl}”?`))
      return;
    requestVersion.current += 1;
    setDeletingId(item.id);
    setLoadError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/gallery/${item.id}`, {
        method: "DELETE",
      });
      const result = parseGalleryApiResult<GalleryDeleteData>(
        await response.json(),
      );
      if (!result.ok) {
        setLoadError(result.error.message);
        return;
      }
      if (!result.data.r2Deleted) {
        setNotice(
          "Record terhapus dari daftar, tetapi objek R2-nya tidak ditemukan (mungkin URL luar atau sudah hilang).",
        );
      }
      if (editingId === item.id) cancelEdit();
      await loadGallery();
      router.refresh();
    } catch {
      setLoadError("Aset galeri tidak dapat dihapus. Coba lagi.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid max-w-4xl gap-8">
      <section aria-labelledby="gallery-form-heading">
        <h1 id="gallery-form-heading">Kelola Galeri</h1>
        <form
          onSubmit={(event) => {
            void handleSubmit(submit)(event);
          }}
          className="grid gap-4 border border-line bg-ink-800 p-6"
        >
          <div>
            <label htmlFor="gallery-file" className={adminLabelClass}>
              Berkas
            </label>
            <AssetUploader
              purpose="galeri"
              onUploaded={(asset) => setUploaded(asset)}
            />
            {editingId === null && uploaded ? (
              <p className={adminHelpClass}>Terunggah: {uploaded.publicUrl}</p>
            ) : null}
            {editingId !== null ? (
              <p className={adminHelpClass}>
                Kosongkan unggahan untuk mempertahankan berkas lama.
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="gallery-kind" className={adminLabelClass}>
              Jenis
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
            {errors.kind ? (
              <p
                id="gallery-kind-error"
                role="alert"
                className={adminErrorClass}
              >
                {errors.kind.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="gallery-title" className={adminLabelClass}>
              Judul (opsional)
            </label>
            <input
              id="gallery-title"
              type="text"
              className={adminInputClass}
              {...register("title")}
            />
            {errors.title ? (
              <p
                id="gallery-title-error"
                role="alert"
                className={adminErrorClass}
              >
                {errors.title.message}
              </p>
            ) : null}
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
              className={`${adminInputClass} max-w-40`}
              {...register("sortOrder", { valueAsNumber: true })}
            />
            {errors.sortOrder ? (
              <p
                id="gallery-sort-order-error"
                role="alert"
                className={adminErrorClass}
              >
                {errors.sortOrder.message}
              </p>
            ) : null}
          </div>
          {errors.root ? (
            <p role="alert" className={adminErrorClass}>
              {errors.root.message}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={adminButtonClass("primary", "md")}
            >
              {isSubmitting
                ? "Menyimpan..."
                : editingId === null
                  ? "Tambah aset"
                  : "Simpan perubahan"}
            </button>
            {editingId !== null ? (
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isSubmitting}
                className={adminButtonClass("secondary", "md")}
              >
                Batal
              </button>
            ) : null}
          </div>
        </form>
      </section>
      <section aria-labelledby="gallery-list-heading" className="grid gap-4">
        <h2
          id="gallery-list-heading"
          className="font-display text-xl font-bold uppercase tracking-wider text-sand"
        >
          Daftar aset
        </h2>
        <div className="max-w-xs">
          <label htmlFor="gallery-filter" className={adminLabelClass}>
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
            <option value="semua">Semua</option>
            {galleryKinds.map((kind) => (
              <option key={kind} value={kind}>
                {kindLabels[kind]}
              </option>
            ))}
          </select>
        </div>
        {notice ? <p role="status">{notice}</p> : null}
        {items === null && loadError === null ? <p>Memuat galeri...</p> : null}
        {loadError ? (
          <div role="alert" className="space-y-3">
            <p>{loadError}</p>
            <button
              type="button"
              onClick={() => void loadGallery()}
              className={adminButtonClass("secondary", "md")}
            >
              Coba lagi
            </button>
          </div>
        ) : null}
        {visibleItems !== null && !loadError && visibleItems.length === 0 ? (
          <p>Belum ada aset galeri.</p>
        ) : null}
        {visibleItems !== null && !loadError && visibleItems.length > 0 ? (
          <ul className="grid gap-4">
            {visibleItems.map((item) => (
              <li key={item.id}>
                <article>
                  {item.kind === "video" ? (
                    <video
                      src={item.fileUrl}
                      preload="metadata"
                      muted
                      playsInline
                      controls
                      aria-label={item.title || "Video galeri"}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.fileUrl}
                      alt={item.title || `Gambar galeri ${item.id}`}
                      loading="lazy"
                    />
                  )}
                  <h3>{item.title || "(tanpa judul)"}</h3>
                  <p>
                    {kindLabels[item.kind]} · Urutan: {item.sortOrder}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => edit(item)}
                      className={adminButtonClass("secondary", "sm")}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(item)}
                      disabled={deletingId === item.id}
                      className={adminButtonClass("danger", "sm")}
                    >
                      {deletingId === item.id ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
