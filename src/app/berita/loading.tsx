import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function NewsIndexLoading() {
  return (
    <div
      role="status"
      aria-label="Memuat artikel berita"
      className="bg-white pt-24 pb-20 sm:pt-28"
    >
      <div className="container-baren">
        <div className="mb-10 space-y-3 border-b border-zinc-200 pb-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-3xl border border-zinc-200 bg-white"
            >
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="space-y-3 p-6">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-4/5" />
                <SkeletonText lines={2} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
