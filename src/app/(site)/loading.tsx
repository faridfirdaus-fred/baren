import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function SiteLoading() {
  return (
    <div
      role="status"
      aria-label="Memuat beranda BAREN"
      className="flex w-full flex-col bg-white pb-20"
    >
      <section className="container-baren flex min-h-svh w-full items-center pt-20 pb-12 sm:pt-24 sm:pb-16">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-4 lg:col-span-5">
            <Skeleton className="h-12 w-full max-w-lg" />
            <SkeletonText lines={2} />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-12 w-44 rounded-full" />
              <Skeleton className="h-12 w-36 rounded-full" />
            </div>
          </div>
          <Skeleton className="aspect-video w-full rounded-3xl lg:col-span-7" />
        </div>
      </section>

      <section className="container-baren py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72 w-full rounded-3xl" />
          ))}
        </div>
      </section>
    </div>
  );
}
