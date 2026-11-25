import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { BatikDivider } from "@/components/site/batik-divider";

export default function SiteLoading() {
  return (
    <div
      role="status"
      aria-label="Memuat beranda BAREN"
      className="flex flex-col w-full bg-[#faf6ee] text-[#2f180a] overflow-hidden"
    >
      {/* 1. Hero Skeleton */}
      <section className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-ink pt-20">
        <div className="container-baren flex flex-col items-center py-14 text-center lg:py-20">
          {/* Eyebrow Pill */}
          <Skeleton
            variant="admin"
            className="mb-6 h-8 w-72 rounded-full bg-white/10"
          />

          {/* Wordmark logo placeholder */}
          <Skeleton
            variant="admin"
            className="h-20 w-[clamp(180px,26vw,340px)] rounded-2xl bg-white/10"
          />

          {/* Title & subtitle */}
          <Skeleton
            variant="admin"
            className="mt-6 h-8 w-3/4 max-w-2xl bg-white/10"
          />
          <Skeleton
            variant="admin"
            className="mt-3 h-5 w-2/3 max-w-lg bg-white/10"
          />

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Skeleton
              variant="admin"
              className="h-12 w-44 rounded-full bg-ember/30"
            />
            <Skeleton
              variant="admin"
              className="h-12 w-36 rounded-full bg-white/10"
            />
          </div>

          {/* Available on PC */}
          <div className="mt-14 w-full border-t border-sand/15 pt-6 flex flex-col items-center">
            <Skeleton variant="admin" className="h-4 w-24 bg-white/10" />
            <Skeleton variant="admin" className="mt-3 h-6 w-40 bg-white/10" />
          </div>
        </div>
      </section>

      {/* 2. Pembatas Batik */}
      <BatikDivider />

      {/* 3. Tentang Game Skeleton */}
      <section className="relative w-full py-16 sm:py-24 bg-[#faf6ee]">
        <div className="container-baren">
          <div className="flex flex-col items-center text-center gap-3 mb-12 sm:mb-16">
            <Skeleton variant="light" className="h-7 w-36 rounded-full" />
            <Skeleton
              variant="light"
              className="h-10 sm:h-12 w-80 max-w-full"
            />
            <Skeleton variant="light" className="h-5 w-96 max-w-full" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <Skeleton
              variant="light"
              className="aspect-video w-full rounded-3xl"
            />
            <div className="space-y-4">
              <Skeleton variant="light" className="h-8 w-3/4" />
              <SkeletonText variant="light" lines={4} />
              <SkeletonText variant="light" lines={3} />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pembatas Batik */}
      <BatikDivider />

      {/* 5. Fitur Game Skeleton */}
      <section className="relative w-full py-16 sm:py-24 bg-[#faf6ee]">
        <div className="container-baren">
          <div className="flex flex-col items-center text-center gap-3 mb-12 sm:mb-16">
            <Skeleton variant="light" className="h-7 w-32 rounded-full" />
            <Skeleton
              variant="light"
              className="h-10 sm:h-12 w-96 max-w-full"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-3xl border-2 border-[#2f180a]/10 bg-white p-6 sm:p-8 space-y-4"
              >
                <Skeleton
                  variant="light"
                  className="h-14 w-14 rounded-2xl bg-[#c83820]/10"
                />
                <Skeleton variant="light" className="h-6 w-3/4" />
                <SkeletonText variant="light" lines={3} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Karakter Deck Skeleton */}
      <section className="relative w-full py-16 sm:py-24 bg-[#faf6ee]">
        <div className="container-baren">
          <div className="flex flex-col items-center text-center gap-3 mb-12 sm:mb-16">
            <Skeleton variant="light" className="h-7 w-40 rounded-full" />
            <Skeleton
              variant="light"
              className="h-10 sm:h-12 w-80 max-w-full"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-3xl border-2 border-[#2f180a]/10 bg-white p-6 space-y-4"
              >
                <Skeleton
                  variant="light"
                  className="aspect-[4/3] w-full rounded-2xl"
                />
                <div className="flex justify-between items-center">
                  <Skeleton variant="light" className="h-6 w-32" />
                  <Skeleton variant="light" className="h-6 w-20 rounded-full" />
                </div>
                <SkeletonText variant="light" lines={2} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Pembatas Batik */}
      <BatikDivider />

      {/* 8. Cara Main Skeleton */}
      <section className="relative w-full py-16 sm:py-24 bg-[#faf6ee]">
        <div className="container-baren">
          <div className="flex flex-col items-center text-center gap-3 mb-12 sm:mb-16">
            <Skeleton variant="light" className="h-7 w-36 rounded-full" />
            <Skeleton
              variant="light"
              className="h-10 sm:h-12 w-80 max-w-full"
            />
          </div>
          <Skeleton
            variant="light"
            className="aspect-video w-full max-w-4xl mx-auto rounded-3xl mb-12"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-3xl border-2 border-[#2f180a]/10 bg-white p-6 space-y-3"
              >
                <Skeleton
                  variant="light"
                  className="h-10 w-10 rounded-full bg-[#c83820]/10"
                />
                <Skeleton variant="light" className="h-5 w-3/4" />
                <SkeletonText variant="light" lines={2} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Galeri Skeleton */}
      <section className="relative w-full py-16 sm:py-24 bg-[#faf6ee]">
        <div className="container-baren">
          <div className="flex flex-col items-center text-center gap-3 mb-12 sm:mb-16">
            <Skeleton variant="light" className="h-7 w-32 rounded-full" />
            <Skeleton
              variant="light"
              className="h-10 sm:h-12 w-72 max-w-full"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                variant="light"
                className="aspect-video w-full rounded-2xl"
              />
            ))}
          </div>
        </div>
      </section>

      {/* 10. FAQ Skeleton */}
      <section className="relative w-full py-16 sm:py-24 bg-[#faf6ee]">
        <div className="container-baren max-w-3xl">
          <div className="flex flex-col items-center text-center gap-3 mb-10">
            <Skeleton variant="light" className="h-7 w-28 rounded-full" />
            <Skeleton variant="light" className="h-10 w-80 max-w-full" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl border-2 border-[#2f180a]/10 bg-white p-5 flex items-center justify-between"
              >
                <Skeleton variant="light" className="h-5 w-3/4" />
                <Skeleton variant="light" className="h-5 w-5 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
