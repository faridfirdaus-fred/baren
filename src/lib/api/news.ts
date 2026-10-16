// E3-6: logika berita (draf/terbit, slug, paginasi 9 deterministik).
// Daftar publik tanpa body (hemat payload); detail memuat body.
// Tanpa impor runtime (hanya `import type`).

import type { NewsCreate, NewsStatus, NewsUpdate } from "../validation/news";

export const NEWS_PER_PAGE = 9;

export type NewsRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  coverUrl: string | null;
  status: NewsStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NewsListItem = Omit<NewsRow, "body">;

export type NewsPage = {
  items: NewsListItem[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type NewsLister = {
  listPublished(
    page: number,
    perPage: number,
  ): Promise<{ items: NewsRow[]; total: number }>;
};

export type NewsCreator = {
  create(input: NewsCreate): Promise<NewsRow>;
};

export type NewsById = {
  update(id: number, patch: NewsUpdate): Promise<NewsRow | null>;
  remove(id: number): Promise<NewsRow | null>;
};

export type NewsBySlug = {
  getPublished(slug: string): Promise<NewsRow | null>;
};

function toListItem(row: NewsRow): NewsListItem {
  const { body: _hide, ...item } = row;
  void _hide;
  return item;
}

/** Aturan waktu terbit: draf selalu null; terbit tanpa tanggal memakai kini. */
export function normalizeNewsTiming<
  T extends { status?: NewsStatus; publishedAt?: string | null },
>(
  input: T,
  nowIso: string,
): T & { status: NewsStatus; publishedAt: string | null } {
  const status: NewsStatus = input.status ?? "draft";
  if (status === "draft") return { ...input, status, publishedAt: null };
  return { ...input, status, publishedAt: input.publishedAt ?? nowIso };
}

/** GET publik: halaman deterministik (diurutkan adapter), tanpa body. */
export async function readNewsPage(
  store: NewsLister,
  page: number,
  perPage: number = NEWS_PER_PAGE,
): Promise<NewsPage> {
  const { items, total } = await store.listPublished(page, perPage);
  return {
    items: items.map(toListItem),
    page,
    perPage,
    total,
    totalPages: Math.ceil(total / perPage),
  };
}
