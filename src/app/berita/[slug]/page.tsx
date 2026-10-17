import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const runtime = "edge";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface NewsItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverUrl: string | null;
  status: "draft" | "published";
  publishedAt: string | null;
}

async function getNewsItem(slug: string): Promise<NewsItem | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/news?slug=${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { ok: boolean; data?: NewsItem };
    return json.ok && json.data ? json.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsItem(slug);

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
  const item = await getNewsItem(slug);

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
            src={item.coverUrl}
            alt={item.title}
            width={1200}
            height={675}
            className="w-full aspect-video object-cover rounded-lg mb-6"
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
