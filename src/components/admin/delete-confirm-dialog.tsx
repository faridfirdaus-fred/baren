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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4"
      onClick={onCancel}
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        className="w-full max-w-md border border-line bg-ink-800 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="dialog-title"
          className="font-display text-xl uppercase tracking-wide text-sand"
        >
          {title}
        </h2>
        <p className="mb-6 mt-2 text-sm text-sand-600">{message}</p>
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
