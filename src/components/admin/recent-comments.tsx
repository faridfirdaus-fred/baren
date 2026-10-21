import Link from "next/link";

import { formatDateTimeId, toDateTimeAttribute } from "@/lib/admin/datetime";

export type RecentCommentItem = {
  id: number;
  body: string;
  userName: string | null;
  createdAt: Date;
};

/**
 * E16-4: bukti sumber data metrik Komentar. Maksimal tiga item dikirim
 * server component (satu kueri), tanpa fetch per item.
 */
export function RecentComments({
  comments,
}: {
  comments: RecentCommentItem[];
}) {
  return (
    <section
      aria-labelledby="komentar-terbaru"
      className="border border-line bg-ink-800 p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2
          id="komentar-terbaru"
          className="text-sm font-semibold uppercase tracking-wider text-sand-600"
        >
          Komentar Terbaru
        </h2>
        <Link
          href="/admin/comments"
          className="text-sm font-semibold text-sand underline decoration-ember underline-offset-4 transition-colors hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          Lihat semua komentar
        </Link>
      </div>

      {comments.length === 0 ? (
        <p className="mt-4 text-sm text-sand-600">
          Belum ada komentar. Komentar pengunjung akan muncul di sini.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {comments.map((comment) => (
            <li key={comment.id}>
              <Link
                href={`/admin/comments#komentar-${comment.id}`}
                className="block border border-line bg-ink p-4 transition-colors hover:border-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
              >
                <span className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-sand">
                    {comment.userName ?? "Anonim"}
                  </span>
                  <time
                    dateTime={toDateTimeAttribute(comment.createdAt)}
                    className="text-xs text-sand-600"
                  >
                    {formatDateTimeId(comment.createdAt) ??
                      "Waktu tidak tersedia"}
                  </time>
                </span>
                <span className="mt-2 line-clamp-2 block text-sm text-sand-600">
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
