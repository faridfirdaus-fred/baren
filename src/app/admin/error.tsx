"use client";

import { adminButtonClass } from "@/components/admin/button-styles";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <section
      aria-live="assertive"
      className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4"
    >
      <p className="text-sm font-medium text-zinc-700">
        Halaman admin tidak dapat dimuat. Silakan coba lagi.
      </p>
      <button
        type="button"
        onClick={reset}
        className={adminButtonClass("primary", "md")}
      >
        Coba lagi
      </button>
    </section>
  );
}
