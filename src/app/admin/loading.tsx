import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div
      role="status"
      aria-label="Memuat dasbor admin..."
      aria-live="polite"
      className="space-y-8"
    >
      {/* Header Skeleton */}
      <header className="flex flex-col gap-4 border-b border-ink-700 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton variant="admin" className="h-10 w-64" />
          <Skeleton variant="admin" className="h-4 w-48" />
        </div>
        <Skeleton variant="admin" className="h-10 w-36" />
      </header>

      {/* Ringkasan Metrik Skeleton */}
      <section className="space-y-4">
        <Skeleton variant="admin" className="h-4 w-96 max-w-full" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col border border-line bg-ink-800 p-5 space-y-3"
            >
              <Skeleton variant="admin" className="h-4 w-28" />
              <Skeleton variant="admin" className="h-9 w-16" />
              <Skeleton variant="admin" className="h-4 w-40" />
              <Skeleton variant="admin" className="mt-auto pt-4 h-3 w-24" />
            </div>
          ))}
        </div>

        {/* Pembaruan Terakhir Skeleton */}
        <div className="border border-line bg-ink-800 p-5 space-y-2">
          <Skeleton variant="admin" className="h-4 w-44" />
          <Skeleton variant="admin" className="h-5 w-60" />
          <Skeleton variant="admin" className="h-3 w-80 max-w-full" />
        </div>
      </section>

      {/* Komentar Terbaru Skeleton */}
      <div className="border border-line bg-ink-800 p-5 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton variant="admin" className="h-5 w-36" />
          <Skeleton variant="admin" className="h-4 w-28" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-line bg-ink p-4 space-y-2">
              <div className="flex justify-between">
                <Skeleton variant="admin" className="h-4 w-24" />
                <Skeleton variant="admin" className="h-3 w-28" />
              </div>
              <Skeleton variant="admin" className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Modul Konten Skeleton */}
      <div className="space-y-3">
        <Skeleton variant="admin" className="h-4 w-32" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="border border-line bg-ink-800 px-4 py-3 h-12 flex items-center"
            >
              <Skeleton variant="admin" className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
