"use client";

import { adminButtonClass } from "./button-styles";

interface DeleteConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-xs"
      onClick={onCancel}
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="dialog-title"
          className="text-lg font-bold tracking-tight text-zinc-900"
        >
          {title}
        </h2>
        <p className="mb-6 mt-2 text-sm leading-relaxed text-zinc-600">
          {message}
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className={adminButtonClass("secondary", "md")}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={adminButtonClass("danger", "md")}
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
