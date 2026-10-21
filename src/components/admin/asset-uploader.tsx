"use client";

import { useCallback, useId, useRef, useState } from "react";

import { adminButtonClass } from "./button-styles";
import {
  acceptedAttr,
  acceptedMimeTypes,
  checkClientFile,
  formatBytes,
  uploadOneFile,
  type UploadedAsset,
} from "@/lib/assets-client";

export type UploaderFileState = {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl: string | null;
  progress: number;
  status:
    | "siap"
    | "mengunggah"
    | "terunggah"
    | "menyimpan"
    | "tersimpan"
    | "gagal"
    | "gagal-simpan"
    | "dibatalkan";
  message: string | null;
  /** Hasil R2 (ada setelah PUT sukses; dipakai retry simpan tanpa reupload). */
  asset: UploadedAsset | null;
};

export type AssetUploaderProps = {
  purpose: string;
  /** Dipanggil setelah file lolos validasi klien (kompatibilitas mundur). */
  onFilesValidated?: (files: File[]) => void;
  /**
   * Dipanggil setelah objek TERUNGGAH ke R2 (bukan setelah record CMS
   * tersimpan — pemisahan E4 vs E8-6). Boleh async: komponen menunggu,
   * menampilkan "Menyimpan metadata…", dan retry-gagal-simpan tanpa
   * reupload. Tanpa callback -> status akhir "Terunggah ke R2".
   * Untuk callback sinkron void, "Tersimpan" hanya bila kontrak integrasi
   * menjamin penyimpanan selesai.
   */
  onUploaded?: (result: UploadedAsset) => void | Promise<void>;
  disabled?: boolean;
};

function toState(file: File): UploaderFileState {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
    name: file.name,
    size: file.size,
    type: file.type,
    previewUrl: file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : null,
    progress: 0,
    status: "siap",
    message: null,
    asset: null,
  };
}

/**
 * Uploader aset admin (E4-6): drag/drop + fallback pilih file, validasi
 * klien (UX), PUT langsung ke `uploadUrl` R2 via presign just-in-time,
 * progress XHR, batal per-file, retry triple-atomik, dan status bertahap
 * terunggah/menyimpan/tersimpan/gagal-simpan (pemisahan E4 vs E8-6).
 * Tak pernah POST byte file ke Worker.
 */
export function AssetUploader({
  purpose,
  onFilesValidated,
  onUploaded,
  disabled = false,
}: AssetUploaderProps) {
  const inputId = useId();
  const helpId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<Map<string, File>>(new Map());
  const abortRef = useRef<Map<string, AbortController>>(new Map());
  const [files, setFiles] = useState<UploaderFileState[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patchFile = useCallback(
    (id: string, patch: Partial<UploaderFileState>) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      );
    },
    [],
  );

  /** Jalankan callback simpan-metadata; tanpa callback -> "Terunggah ke R2". */
  const runSaveCallback = useCallback(
    async (id: string, asset: UploadedAsset) => {
      if (!onUploaded) {
        patchFile(id, {
          status: "terunggah",
          message: "Terunggah ke R2.",
          asset,
        });
        return;
      }
      patchFile(id, {
        status: "menyimpan",
        message: "Terunggah. Menyimpan metadata…",
        asset,
      });
      try {
        await onUploaded(asset);
        patchFile(id, {
          status: "tersimpan",
          message: "Tersimpan.",
          asset,
        });
      } catch (error) {
        patchFile(id, {
          status: "gagal-simpan",
          message:
            error instanceof Error && error.message
              ? `Unggahan ok, simpan metadata gagal: ${error.message}`
              : "Unggahan ok, simpan metadata gagal. Coba lagi tanpa mengunggah ulang.",
          asset,
        });
      }
    },
    [onUploaded, patchFile],
  );

  /** Unggah satu file: kompres E4-7 -> presign just-in-time -> PUT R2 -> callback simpan. */
  const uploadFile = useCallback(
    async (id: string) => {
      const file = filesRef.current.get(id);
      if (!file) return;
      const controller = new AbortController();
      abortRef.current.set(id, controller);
      patchFile(id, {
        status: "mengunggah",
        progress: 0,
        message: "Menyiapkan…",
      });
      const result = await uploadOneFile(
        file,
        purpose,
        (loaded: number, total: number) =>
          patchFile(id, {
            progress: total > 0 ? Math.round((loaded / total) * 100) : 0,
            message: "Mengunggah…",
          }),
        controller.signal,
        (info) =>
          patchFile(id, {
            message: `Dikompres ${formatBytes(info.originalBytes)} → ${formatBytes(info.compressedBytes)}. Mengunggah…`,
          }),
      );
      abortRef.current.delete(id);
      if (result.ok) {
        await runSaveCallback(id, result.asset);
        return;
      }
      if (result.error.kind === "aborted") {
        patchFile(id, {
          status: "dibatalkan",
          message: "Unggahan dibatalkan.",
        });
        return;
      }
      patchFile(id, {
        status: "gagal",
        message: result.error.message,
      });
    },
    [purpose, patchFile, runSaveCallback],
  );

  /** Retry simpan-metadata tanpa reupload (pakai asset yang sudah ada). */
  const retrySave = useCallback(
    (id: string) => {
      const target = filesRef.current.get(id);
      const state = files.find((f) => f.id === id) ?? null;
      const asset = state?.asset ?? null;
      if (!target || !asset) return;
      void runSaveCallback(id, asset);
    },
    [files, runSaveCallback],
  );

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming);
      if (list.length === 0 || disabled) return;
      const accepted = acceptedMimeTypes(purpose);
      const next: UploaderFileState[] = [];
      const valid: File[] = [];
      for (const file of list) {
        const check = checkClientFile(
          { type: file.type, size: file.size, name: file.name },
          purpose,
        );
        if (!check.ok) {
          next.push({
            ...toState(file),
            status: "gagal",
            message: check.message,
          });
          continue;
        }
        const state = {
          ...toState(file),
          status: "siap" as const,
          message: null,
        };
        next.push(state);
        filesRef.current.set(state.id, file);
        valid.push(file);
      }
      const rejected = next.filter((f) => f.status === "gagal");
      setError(
        rejected.length > 0
          ? `${rejected.length} berkas ditolak (${accepted.join(", ")}; gambar ≤5 MB, video ≤50 MB).`
          : null,
      );
      setFiles((prev) => [...prev, ...next]);
      if (valid.length > 0) onFilesValidated?.(valid);
    },
    [purpose, onFilesValidated, disabled],
  );

  const cancelFile = useCallback((id: string) => {
    const controller = abortRef.current.get(id);
    if (controller) {
      controller.abort();
      return;
    }
    // Belum mulai mengunggah: batalkan pilihan.
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      filesRef.current.delete(id);
      return prev.map((f) =>
        f.id === id && f.status === "siap"
          ? { ...f, status: "dibatalkan", message: "Pemilihan dibatalkan." }
          : f,
      );
    });
  }, []);

  const clearFiles = useCallback(() => {
    setFiles((prev) => {
      for (const f of prev) {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      }
      return [];
    });
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-labelledby={inputId}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          addFiles(event.dataTransfer.files);
        }}
        className={`flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-none border-2 border-dashed px-6 py-10 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${
          dragActive
            ? "border-ember bg-ember/10"
            : "border-sand/25 bg-ink hover:border-ember/70 hover:bg-ink-700/40"
        }`}
      >
        <p
          id={inputId}
          className="font-display text-lg uppercase tracking-wide text-sand"
        >
          Seret & letakkan berkas di sini
        </p>
        <p id={helpId} className="text-sm text-sand/70">
          atau klik untuk memilih berkas ({acceptedAttr(purpose)}; gambar ≤5 MB,
          video ≤50 MB)
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedAttr(purpose)}
          className="sr-only"
          aria-label={`Pilih berkas untuk ${purpose}`}
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
          }}
        />
      </div>

      {error ? (
        <p id={errorId} role="alert" className="mt-3 text-sm text-ember">
          {error}
        </p>
      ) : null}

      {files.length > 0 ? (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-sand/70">
              {files.length} berkas dipilih. Tekan Unggah per berkas; file
              dikirim langsung ke R2, bukan ke Worker.
            </p>
            <button
              type="button"
              onClick={clearFiles}
              className={adminButtonClass("secondary", "sm", "shrink-0")}
            >
              Bersihkan
            </button>
          </div>
          <ul className="mt-3 space-y-3">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-center gap-3 rounded border border-sand/15 p-3"
              >
                {file.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={file.previewUrl}
                    alt={`Pratinjau ${file.name}`}
                    className="h-12 w-12 shrink-0 rounded object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-sand/10 text-xs text-sand/60"
                  >
                    MP4
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-sand">
                    {file.name}
                  </p>
                  <p className="text-xs text-sand/60">
                    {formatBytes(file.size)} · {file.status}
                    {file.message ? ` · ${file.message}` : ""}
                  </p>
                  <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={file.progress}
                    aria-label={`Progress ${file.name}`}
                    className="mt-1 h-1.5 w-full overflow-hidden rounded bg-sand/15"
                  >
                    <div
                      className="h-full bg-ember transition-all"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  {file.status === "siap" || file.status === "gagal" ? (
                    <button
                      type="button"
                      onClick={() => void uploadFile(file.id)}
                      disabled={disabled}
                      aria-label={`Unggah ${file.name}`}
                      className={adminButtonClass("primary", "sm")}
                    >
                      {file.status === "gagal" ? "Coba Lagi" : "Unggah"}
                    </button>
                  ) : null}
                  {file.status === "gagal-simpan" ? (
                    <button
                      type="button"
                      onClick={() => retrySave(file.id)}
                      disabled={disabled}
                      aria-label={`Coba simpan lagi ${file.name} tanpa mengunggah ulang`}
                      className={adminButtonClass("primary", "sm")}
                    >
                      Simpan Lagi
                    </button>
                  ) : null}
                  {file.status === "siap" ||
                  file.status === "mengunggah" ||
                  file.status === "gagal" ? (
                    <button
                      type="button"
                      onClick={() => cancelFile(file.id)}
                      aria-label={`Batalkan ${file.name}`}
                      className={adminButtonClass("secondary", "sm")}
                    >
                      Batal
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
