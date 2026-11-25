import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function NewsIndexLoading() {
  return (
    <main
      role="status"
      aria-label="Memuat artikel berita"
      className="min-h-screen bg-sand px-4 py-12"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 pb-6">
          <div className="space-y-2">
            <Skeleton variant="light" className="h-4 w-36" />
            <Skeleton variant="light" className="h-10 w-64" />
            <Skeleton variant="light" className="h-4 w-96 max-w-full" />
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col border border-ink/10 bg-white shadow-sm"
            >
              <Skeleton variant="light" className="aspect-video w-full" />
              <div className="flex flex-1 flex-col p-6 space-y-3">
                <Skeleton variant="light" className="h-3 w-28" />
                <Skeleton variant="light" className="h-6 w-5/6" />
                <SkeletonText variant="light" lines={3} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
