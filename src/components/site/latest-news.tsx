import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ScrollRevealWrapper } from "@/components/site/scroll-reveal-wrapper";
import type { NewsItem } from "@/lib/news-content";
import { resolvePublicAssetUrl } from "@/lib/assets-url";

type Props = {
  items: NewsItem[];
  title?: string | null;
  ctaLabel?: string | null;
};

export function LatestNews({ items, title, ctaLabel }: Props) {
  if (items.length === 0) return null;
  const resolvedTitle = title?.trim() || "Kabar & Event BAREN";
  const resolvedCta = ctaLabel?.trim() || "Semua Berita";

  return (
    <ScrollRevealWrapper>
      <section id="berita" className="w-full bg-white py-16 sm:py-24">
        <div className="container-baren">
          <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-col items-start gap-3">
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
                {resolvedTitle}
              </h2>
            </div>
            <Link
              href="/berita"
              className="inline-flex items-center gap-1.5 self-start rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-xs font-semibold text-zinc-800 transition-colors hover:border-zinc-300 hover:bg-zinc-50 sm:self-auto"
            >
              <span>{resolvedCta}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:gap-7 md:grid-cols-3">
            {items.map((item) => {
              const coverSrc =
                (item.coverUrl && resolvePublicAssetUrl(item.coverUrl)) ||
                item.coverUrl ||
                "/art/event-art.jpg";
              return (
                <Link
                  key={item.id}
                  href={`/berita/${item.slug}`}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-900/5"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
                    <Image
                      src={coverSrc}
                      fill
                      sizes="(min-width:768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={item.title}
                      unoptimized
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-xs font-medium text-zinc-400">
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )
                        : "Pembaruan Terbaru"}
                    </span>
                    <h3 className="mt-1.5 line-clamp-2 text-lg font-bold leading-snug tracking-tight text-zinc-950 transition-colors group-hover:text-[#c83820]">
                      {item.title}
                    </h3>
                    {item.excerpt && (
                      <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-600">
                        {item.excerpt}
                      </p>
                    )}

                    <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-[#c83820]">
                      <span>Baca & lihat foto</span>
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </ScrollRevealWrapper>
  );
}
