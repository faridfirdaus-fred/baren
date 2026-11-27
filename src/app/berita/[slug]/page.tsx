import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { resolvePublicAssetUrl } from "@/lib/assets-url";
import type { GalleryItem } from "@/lib/gallery-content";
import { getPublishedNewsBySlug } from "@/lib/news-content";
import { parseNewsBody } from "@/lib/news-gallery";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublishedNewsBySlug(slug);

  if (!item) {
    return {
      title: "Berita Tidak Ditemukan | BAREN",
    };
  }

  const ogImage = item.coverUrl
    ? resolvePublicAssetUrl(item.coverUrl) || item.coverUrl
    : "/art/event-art.jpg";

  return {
    title: `${item.title} | BAREN`,
    description: item.excerpt || undefined,
    openGraph: {
      title: item.title,
      description: item.excerpt || undefined,
      images: [ogImage],
      type: "article",
      publishedTime: item.publishedAt || undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getPublishedNewsBySlug(slug);

  if (!item) {
    notFound();
  }

  const { story, galleryUrls } = parseNewsBody(item.body);
  const coverSrc = item.coverUrl
    ? resolvePublicAssetUrl(item.coverUrl) || item.coverUrl
    : galleryUrls[0]
      ? resolvePublicAssetUrl(galleryUrls[0]) || galleryUrls[0]
      : null;

  const eventGalleryItems: GalleryItem[] = galleryUrls.map((url, idx) => ({
    id: idx + 1,
    kind: "artwork",
    title: `${item.title} — Foto ${idx + 1}`,
    fileUrl: url,
    sortOrder: idx,
  }));

  return (
    <div className="bg-white pt-24 pb-20 sm:pt-28">
      <article className="container-baren max-w-4xl">
        <div className="mb-6 flex items-center gap-3 text-xs font-semibold text-zinc-500">
          <Link href="/berita" className="hover:text-zinc-900">
            &larr; Semua Berita
          </Link>
          <span aria-hidden="true" className="text-zinc-300">
            /
          </span>
          <Link href="/" className="hover:text-zinc-900">
            Beranda
          </Link>
        </div>

        <h1 className="text-3xl leading-tight font-extrabold tracking-tight text-zinc-950 sm:text-4xl lg:text-[2.6rem]">
          {item.title}
        </h1>

        {item.publishedAt && (
          <time
            dateTime={item.publishedAt}
            className="mt-3 block text-xs font-medium text-zinc-400"
          >
            {new Intl.DateTimeFormat("id-ID", {
              dateStyle: "long",
            }).format(new Date(item.publishedAt))}
          </time>
        )}

        {item.excerpt && (
          <p className="mt-4 text-base leading-relaxed font-medium text-zinc-600 sm:text-lg">
            {item.excerpt}
          </p>
        )}

        {coverSrc && (
          <div className="relative my-8 aspect-video w-full overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100">
            <Image
              src={coverSrc}
              alt={item.title}
              fill
              priority
              sizes="(min-width: 1024px) 896px, 100vw"
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {story && (
          <div className="mt-6 space-y-4 text-base leading-relaxed whitespace-pre-wrap text-zinc-700">
            {story}
          </div>
        )}

        {eventGalleryItems.length > 0 && (
          <section className="mt-12 border-t border-zinc-200 pt-10">
            <div className="mb-6">
              <span className="pill-eyebrow">DOKUMENTASI EVENT</span>
              <h2 className="mt-2.5 text-2xl font-bold tracking-tight text-zinc-950">
                Galeri Foto Event BAREN
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Klik foto untuk memperbesar tampilan penuh.
              </p>
            </div>
            <GalleryGrid items={eventGalleryItems} showCaptions={false} />
          </section>
        )}
      </article>
    </div>
  );
}
