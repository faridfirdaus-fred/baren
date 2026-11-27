import Link from "next/link";

import { formatDateTimeId, toDateTimeAttribute } from "@/lib/admin/datetime";

export type RecentCommentItem = {
  id: number;
  body: string;
  userName: string | null;
  createdAt: Date;
};

export function RecentComments({
  comments,
}: {
  comments: RecentCommentItem[];
}) {
  return (
    <section
      aria-labelledby="komentar-terbaru"
      className="rounded-2xl border border-zinc-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2
          id="komentar-terbaru"
          className="text-sm font-semibold text-zinc-900"
        >
          Komentar Terbaru
        </h2>
        <Link
          href="/admin/comments"
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        >
          Lihat semua komentar &rarr;
        </Link>
      </div>

      {comments.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          Belum ada komentar. Komentar pengunjung akan muncul di sini.
        </p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {comments.map((comment) => (
            <li key={comment.id}>
              <Link
                href={`/admin/comments#komentar-${comment.id}`}
                className="block rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5 transition-colors hover:border-zinc-200 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
              >
                <span className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-zinc-900">
                    {comment.userName ?? "Anonim"}
                  </span>
                  <time
                    dateTime={toDateTimeAttribute(comment.createdAt)}
                    className="text-xs text-zinc-400"
                  >
                    {formatDateTimeId(comment.createdAt) ??
                      "Waktu tidak tersedia"}
                  </time>
                </span>
                <span className="mt-1.5 line-clamp-2 block text-sm text-zinc-600">
                  {comment.body}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
