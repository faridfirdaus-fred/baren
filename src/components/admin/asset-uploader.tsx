"use client";

import { useCallback, useId, useRef, useState } from "react";

import {
  acceptedAttr,
  acceptedMimeTypes,
  checkClientFile,
  formatBytes,
} from "@/lib/assets-client";

export type UploaderFileState = {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl: string | null;
  progress: number;
  status: "siap" | "mengunggah" | "selesai" | "gagal" | "dibatalkan";
  message: string | null;
};

export type AssetUploaderProps = {
  purpose: string;
  /** Dipanggil setelah file lolos validasi klien; integrasi presign (E4-2) menyusul. */
  onFilesValidated?: (files: File[]) => void;
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
  };
}

/**
 * Fondasi uploader aset admin (E4-6 menunggu E4-2).
 * Sudah mencakup: drag/drop + fallback pilih file, validasi klien (UX),
 * preview, status error, keyboard, dan pembatalan pilihan.
 * PUT langsung ke `uploadUrl` + simpan metadata via API ditambahkan
 * setelah endpoint presign E4-2 tersedia (butuh guard admin E2-4).
 */
export function AssetUploader({
  purpose,
  onFilesValidated,
}: AssetUploaderProps) {
  const inputId = useId();
  const helpId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploaderFileState[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming);
      if (list.length === 0) return;
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
        next.push({ ...toState(file), status: "siap", message: null });
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
    [purpose, onFilesValidated],
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.map((f) =>
        f.id === id && (f.status === "mengunggah" || f.status === "siap")
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
        className={`flex w-full flex-col items-center justify-center gap-2 rounded border-2 border-dashed px-6 py-10 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${
          dragActive ? "border-ember bg-ember/10" : "border-sand/25 bg-ink"
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
              {files.length} berkas dipilih. Unggah aktif setelah endpoint
              presign E4-2 tersedia.
            </p>
            <button
              type="button"
              onClick={clearFiles}
              className="rounded border border-sand/25 px-3 py-1.5 text-sm text-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
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
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  aria-label={`Batalkan ${file.name}`}
                  className="shrink-0 rounded border border-sand/25 px-2.5 py-1.5 text-xs text-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                >
                  Batal
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
