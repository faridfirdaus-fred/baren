import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { resolvePublicAssetUrl } from "@/lib/assets-url";
import { getPublishedNewsBySlug } from "@/lib/news-content";

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
      title: "Berita Tidak Ditemukan",
    };
  }

  return {
    title: item.title,
    description: item.excerpt || undefined,
    openGraph: {
      title: item.title,
      description: item.excerpt || undefined,
      images: item.coverUrl ? [item.coverUrl] : undefined,
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

  return (
    <main className="min-h-screen bg-sand py-12 px-4">
      <article className="max-w-3xl mx-auto">
        <Link
          href="/#berita"
          className="inline-block text-ember hover:underline mb-6"
        >
          ← Kembali ke Beranda
        </Link>

        {item.coverUrl && (
          <Image
            src={resolvePublicAssetUrl(item.coverUrl) || item.coverUrl}
            alt={item.title}
            width={1200}
            height={675}
            className="w-full aspect-video object-cover rounded-lg mb-6"
            unoptimized
          />
        )}

        <h1 className="text-4xl font-bold text-ink mb-4">{item.title}</h1>

        {item.publishedAt && (
          <time
            dateTime={item.publishedAt}
            className="text-sm text-gray-600 block mb-6"
          >
            {new Intl.DateTimeFormat("id-ID", {
              dateStyle: "long",
            }).format(new Date(item.publishedAt))}
          </time>
        )}

        {item.excerpt && (
          <p className="text-lg text-gray-700 mb-8 italic">{item.excerpt}</p>
        )}

        <div
          className="prose prose-lg max-w-none text-ink"
          style={{ whiteSpace: "pre-wrap" }}
        >
          {item.body}
        </div>
      </article>
    </main>
  );
}
