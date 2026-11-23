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

// Kategori warna tag sesuai mockup
const CATEGORY_TAGS = [
  { label: "PENGUMUMAN", bg: "bg-[#0284c7] text-white" },
  { label: "EVENT", bg: "bg-[#c83820] text-white" },
  { label: "PENGEMBANGAN", bg: "bg-[#d97706] text-white" },
];

export function LatestNews({ items, title, ctaLabel }: Props) {
  if (items.length === 0) return null;
  const resolvedTitle = title?.trim() || "Berita dari BAREN";

  return (
    <ScrollRevealWrapper>
      <section
        id="berita"
        className="relative w-full py-16 sm:py-24 bg-[#faf6ee] text-[#2f180a] overflow-hidden"
      >
        <div className="container-baren">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div className="flex flex-col items-start gap-3">
              <span className="pill-eyebrow">KABAR TERBARU</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#2f180a]">
                {resolvedTitle}
              </h2>
            </div>
            {ctaLabel ? (
              <Link
                href="/berita"
                className="inline-flex items-center gap-1.5 text-sm font-black uppercase tracking-wider text-[#c83820] hover:text-[#a72d18] bg-white border-2 border-[#2f180a]/15 px-5 py-2.5 rounded-full shadow-sm hover:shadow transition-all"
              >
                {ctaLabel}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/berita"
                className="inline-flex items-center gap-1.5 text-sm font-black uppercase tracking-wider text-[#c83820] hover:text-[#a72d18] bg-white border-2 border-[#2f180a]/15 px-5 py-2.5 rounded-full shadow-sm hover:shadow transition-all"
              >
                Semua Berita
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {items.map((item, idx) => {
              const catTag = CATEGORY_TAGS[idx % CATEGORY_TAGS.length];
              return (
                <Link
                  key={item.id}
                  href={`/berita/${item.slug}`}
                  className="group flex flex-col rounded-3xl bg-white border-2 border-[#2f180a]/12 p-4 sm:p-5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200"
                >
                  {/* Thumbnail Berita */}
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#2f180a] mb-4">
                    {item.coverUrl ? (
                      <Image
                        src={
                          resolvePublicAssetUrl(item.coverUrl) || item.coverUrl
                        }
                        fill
                        sizes="(min-width:768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        alt={item.title}
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#faf6ee]/50 font-bold text-xs uppercase">
                        BAREN NEWS
                      </div>
                    )}
                    {/* Badge Kategori Mengambang */}
                    <div className="absolute top-3 left-3 z-10">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md ${catTag.bg}`}
                      >
                        {catTag.label}
                      </span>
                    </div>
                  </div>

                  {/* Tanggal & Judul */}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c7b6d] mb-1">
                    {item.publishedAt
                      ? new Date(item.publishedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "TANGGAL TERBIT"}
                  </span>
                  <h3 className="text-xl font-black text-[#2f180a] tracking-tight leading-snug group-hover:text-[#c83820] transition-colors line-clamp-2 mb-2">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="text-xs sm:text-sm text-[#542d14] line-clamp-2 leading-relaxed mb-4 flex-1">
                      {item.excerpt}
                    </p>
                  )}

                  <div className="mt-auto pt-3 border-t border-[#2f180a]/8 flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#c83820] group-hover:translate-x-0.5 transition-transform">
                    <span>Baca Selengkapnya</span>
                    <ArrowUpRight className="w-4 h-4" />
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
