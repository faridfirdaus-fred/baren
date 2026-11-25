import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function FaqLoading() {
  return (
    <main
      role="status"
      aria-label="Memuat pertanyaan umum"
      className="min-h-screen bg-ink px-4 py-12 text-sand"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="border-b border-sand/15 pb-6 space-y-3">
          <Skeleton variant="admin" className="h-4 w-36" />
          <Skeleton variant="admin" className="h-4 w-48 mt-4" />
          <Skeleton variant="admin" className="h-12 w-80 max-w-full" />
          <SkeletonText variant="admin" lines={2} className="mt-3 max-w-2xl" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="border border-line bg-ink-800 p-5 flex items-center justify-between"
            >
              <Skeleton variant="admin" className="h-5 w-3/4" />
              <Skeleton variant="admin" className="h-4 w-4" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
