export default function AdminLoginLoading() {
  return (
    <main className="relative flex min-h-dvh flex-col justify-between overflow-x-clip bg-ink text-sand">
      {/* Background Decor */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-full max-w-3xl -translate-x-1/2 bg-ember/10 blur-[140px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#16233a_1px,transparent_1px)] [background-size:24px_24px] opacity-40"
        aria-hidden="true"
      />

      {/* Topbar HUD */}
      <header className="relative z-10 flex items-center justify-between border-b border-line/60 px-4 py-4 sm:px-8">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-sand-600">
          <span aria-hidden="true">&larr;</span> Kembali ke Situs
        </span>
        <div className="flex items-center gap-2 text-[11px] font-mono tracking-wider text-sand-600">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"
            aria-hidden="true"
          />
          <span className="hidden sm:inline">TERMINAL // </span>ADM-PORTAL
        </div>
      </header>

      {/* Center Skeleton Console */}
      <div className="relative z-10 my-auto flex w-full items-center justify-center px-4 py-8">
        <div className="relative w-full max-w-md rounded-none border border-line bg-ink-800/95 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          {/* Tactical Corner Accents */}
          <span
            className="pointer-events-none absolute -top-px -left-px h-3 w-3 border-t-2 border-l-2 border-ember"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -top-px -right-px h-3 w-3 border-t-2 border-r-2 border-ember"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 border-ember"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 border-ember"
            aria-hidden="true"
          />

          <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <span
              className="mb-4 inline-block h-2.5 w-2.5 rounded-full bg-ember animate-ping"
              aria-hidden="true"
            />
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-sand-600">
              Menghubungkan konsol admin...
            </p>
          </div>
        </div>
      </div>

      {/* Footer HUD */}
      <footer className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 px-4 py-3 text-[11px] text-sand-600 sm:px-8">
        <span>BAREN &copy; 2026. Hak cipta dilindungi.</span>
        <span className="font-mono uppercase tracking-wider">
          Sesi 60m &bull; TLS 1.3 &bull; Guard E2-4
        </span>
      </footer>
    </main>
  );
}
