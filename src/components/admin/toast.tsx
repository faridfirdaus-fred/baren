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
      className={`fixed bottom-5 right-5 z-50 max-w-md rounded-xl border bg-white px-4 py-3 text-zinc-900 shadow-lg ${
        type === "success" ? "border-emerald-200" : "border-red-200"
      }`}
      role="alert"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-zinc-800">
          <span
            className={`mr-2 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${
              type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {type === "success" ? "Berhasil" : "Gagal"}
          </span>
          {message}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
          aria-label="Tutup"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
