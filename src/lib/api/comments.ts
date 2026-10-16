// E3-12: logika komentar landing (baca publik + rate limit tulis).
// Tanpa impor runtime (hanya `import type`).

export type CommentRow = {
  id: number;
  name: string | null;
  photoUrl: string | null;
  body: string;
  createdAt: string;
};

export type CommentLister = { list(): Promise<CommentRow[]> };

export const COMMENTS_PER_PAGE = 20;
export const COMMENTS_MAX_PER_PAGE = 50;
export const COMMENT_RATE_LIMIT = 5;
export const COMMENT_RATE_WINDOW_MS = 10 * 60_000;

/** GET publik: terbaru dulu; cursor = ID terakhir yang sudah tampil. */
export async function readComments(
  store: CommentLister,
  opts: { limit: number; cursor: number | null },
): Promise<CommentRow[]> {
  const rows = await store.list();
  const sorted = [...rows].sort((a, b) => b.id - a.id);
  const cursor = opts.cursor;
  const after = cursor === null ? sorted : sorted.filter((r) => r.id < cursor);
  return after.slice(0, opts.limit);
}

/** true bila user masih boleh kirim (maks 5 per 10 menit). */
export function checkCommentRateLimit(stamps: number[], now: number): boolean {
  const windowStart = now - COMMENT_RATE_WINDOW_MS;
  return stamps.filter((t) => t >= windowStart).length < COMMENT_RATE_LIMIT;
}
