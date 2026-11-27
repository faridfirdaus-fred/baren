import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getAllPublishedNews } from "@/lib/news-content";
import { resolvePublicAssetUrl } from "@/lib/assets-url";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Berita & Dokumentasi Event | BAREN",
  description:
    "Kabar terbaru, dokumentasi pameran komunitas, dan catatan pengembangan game BAREN.",
};

export default async function NewsIndexPage() {
  const items = await getAllPublishedNews();

  return (
    <div className="bg-white pt-24 pb-20 sm:pt-28">
      <div className="container-baren">
        <div className="mb-10 border-b border-zinc-200 pb-6">
          <Link
            href="/#berita"
            className="inline-block text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-900"
          >
            &larr; Kembali ke Beranda
          </Link>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
            Berita & Dokumentasi Event
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">
            Kumpulan kabar terbaru, foto keseruan pameran booth komunitas, dan
            perkembangan permainan BAREN.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-12 text-center text-sm text-zinc-500">
            Belum ada artikel yang dipublikasikan.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                  <div className="relative aspect-video overflow-hidden bg-zinc-100">
                    <Image
                      src={coverSrc}
                      fill
                      sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
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
                        : "Pembaruan"}
                    </span>
                    <h2 className="mt-1.5 text-lg font-bold leading-snug tracking-tight text-zinc-950 transition-colors group-hover:text-[#c83820]">
                      {item.title}
                    </h2>
                    {item.excerpt && (
                      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-600">
                        {item.excerpt}
                      </p>
                    )}
                    <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-[#c83820]">
                      <span>Lihat selengkapnya</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
