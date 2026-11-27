import { Skeleton } from "@/components/ui/skeleton";

export default function FaqLoading() {
  return (
    <div
      role="status"
      aria-label="Memuat pertanyaan umum"
      className="bg-white pt-24 pb-20 sm:pt-28"
    >
      <div className="container-baren max-w-4xl space-y-8">
        <div className="space-y-3 border-b border-zinc-200 pb-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
