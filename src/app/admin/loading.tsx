import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div
      role="status"
      aria-label="Memuat dasbor admin..."
      aria-live="polite"
      className="space-y-8"
    >
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-32" />
      </header>

      <section className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col space-y-3 rounded-2xl border border-zinc-200 bg-white p-5"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-zinc-100 bg-zinc-50 p-4"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
