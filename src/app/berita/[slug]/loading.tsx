import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function NewsDetailLoading() {
  return (
    <div
      role="status"
      aria-label="Memuat detail berita"
      className="bg-white pt-24 pb-20 sm:pt-28"
    >
      <article className="container-baren max-w-4xl space-y-5">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="aspect-video w-full rounded-3xl" />
        <SkeletonText lines={5} />
      </article>
    </div>
  );
}
