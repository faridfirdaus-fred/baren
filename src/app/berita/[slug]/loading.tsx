import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function NewsDetailLoading() {
  return (
    <main
      role="status"
      aria-label="Memuat detail berita"
      className="min-h-screen bg-sand py-12 px-4"
    >
      <article className="max-w-3xl mx-auto space-y-6">
        <Skeleton variant="light" className="h-4 w-36" />
        <Skeleton variant="light" className="w-full aspect-video rounded-lg" />
        <Skeleton variant="light" className="h-10 w-4/5" />
        <Skeleton variant="light" className="h-4 w-40" />
        <Skeleton variant="light" className="h-6 w-full italic" />
        <div className="space-y-4 pt-4">
          <SkeletonText variant="light" lines={5} />
          <SkeletonText variant="light" lines={6} />
          <SkeletonText variant="light" lines={4} />
        </div>
      </article>
    </main>
  );
}
