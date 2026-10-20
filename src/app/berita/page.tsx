import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllPublishedNews } from "@/lib/news-content";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Artikel & Berita | BAREN",
  description:
    "Semua artikel, catatan pembaruan, dan kabar terbaru seputar game BAREN.",
};

export default async function NewsIndexPage() {
  const items = await getAllPublishedNews();

  return (
    <main className="min-h-screen bg-sand px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 pb-6">
          <div>
            <Link
              href="/#berita"
              className="inline-block text-sm font-semibold uppercase tracking-wider text-ember-700 hover:underline"
            >
              ← Kembali ke Beranda
            </Link>
            <h1 className="display-xl mt-3 text-ink">SEMUA ARTIKEL</h1>
            <p className="mt-2 text-ink-600">
              Kabar terbaru, pembaruan fitur, dan pengumuman komunitas BAREN.
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="border border-ink/15 bg-white p-12 text-center text-ink-600">
            Belum ada artikel yang dipublikasikan.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/berita/${item.slug}`}
                className="group flex flex-col border border-ink/10 bg-white transition hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
              >
                <div className="relative aspect-video overflow-hidden bg-ink-700">
                  {item.coverUrl ? (
                    <Image
                      src={item.coverUrl}
                      fill
                      sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={item.title}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-ink-400">
                      No cover
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ember-700">
                    BERITA
                    <span className="text-ink-400">•</span>
                    <span className="font-normal text-ink-500">
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "—"}
                    </span>
                  </p>
                  <h2 className="mt-2 text-xl font-bold leading-snug text-ink transition-colors group-hover:text-ember-700">
                    {item.title}
                  </h2>
                  {item.excerpt && (
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-600">
                      {item.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
