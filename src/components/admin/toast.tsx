"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-md border bg-ink-800 px-4 py-3 text-sand shadow-xl ${
        type === "success" ? "border-emerald-500/50" : "border-ember/60"
      }`}
      role="alert"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm">
          <span
            className={`mr-2 font-semibold uppercase tracking-wider ${
              type === "success" ? "text-emerald-400" : "text-ember"
            }`}
          >
            {type === "success" ? "Berhasil" : "Gagal"}
          </span>
          {message}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border border-line text-sand-600 transition-colors hover:border-ember hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          aria-label="Tutup"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
