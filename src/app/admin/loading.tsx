export default function AdminLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center"
    >
      <div className="relative border border-line bg-ink-800/90 px-8 py-6 shadow-2xl backdrop-blur-md">
        {/* Tactical Corner Accents */}
        <span
          className="pointer-events-none absolute -top-px -left-px h-2.5 w-2.5 border-t-2 border-l-2 border-ember"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -top-px -right-px h-2.5 w-2.5 border-t-2 border-r-2 border-ember"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -bottom-px -left-px h-2.5 w-2.5 border-b-2 border-l-2 border-ember"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -bottom-px -right-px h-2.5 w-2.5 border-b-2 border-r-2 border-ember"
          aria-hidden="true"
        />

        <div className="flex items-center gap-3">
          <span
            className="inline-block h-2 w-2 rounded-full bg-ember animate-ping"
            aria-hidden="true"
          />
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-sand">
            Memuat dasbor admin...
          </p>
        </div>
      </div>
    </div>
  );
}
