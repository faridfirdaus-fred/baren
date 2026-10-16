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
      className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded shadow-lg max-w-md ${
        type === "success"
          ? "bg-green-600 text-white"
          : "bg-red-600 text-white"
      }`}
      role="alert"
    >
      <div className="flex items-center justify-between gap-4">
        <p>{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="text-white hover:opacity-80"
          aria-label="Tutup"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
