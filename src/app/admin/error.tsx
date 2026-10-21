"use client";

import { adminButtonClass } from "@/components/admin/button-styles";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <section aria-live="assertive" className="space-y-4">
      <p>Dasbor admin tidak dapat dimuat. Coba lagi.</p>
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
