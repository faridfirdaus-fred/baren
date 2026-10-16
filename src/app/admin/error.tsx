"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <section aria-live="assertive">
      <p>Dasbor admin tidak dapat dimuat. Coba lagi.</p>
      <button type="button" onClick={reset}>
        Coba lagi
      </button>
    </section>
  );
}
