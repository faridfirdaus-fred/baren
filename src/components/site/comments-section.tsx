"use client";

import { useState } from "react";
import Image from "next/image";
import { Send } from "lucide-react";

import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { joinWishlistAction } from "@/components/site/actions";

type Comment = {
  id: number;
  body: string;
  userName: string;
  userPhotoUrl: string | null;
  createdAt: string;
};

type Props = {
  initialComments: Comment[];
  userSession: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  title?: string | null;
  loginPrompt?: string | null;
  emptyMessage?: string | null;
  submitLabel?: string | null;
  submitError?: string | null;
};

export function CommentsSection({
  initialComments,
  userSession,
  title,
  loginPrompt,
  emptyMessage,
  submitLabel,
  submitError,
}: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const ref = useScrollReveal<HTMLElement>();

  const resolvedTitle = title?.trim() || "Bagaimana pendapatmu?";
  const resolvedSubmitLabel = submitLabel?.trim() || "Kirim";
  const resolvedSubmitError = submitError?.trim() || "Gagal mengirim komentar";
  const resolvedLoginPrompt =
    loginPrompt?.trim() || "Masuk dengan Google untuk berkomentar";
  const resolvedEmptyMessage =
    emptyMessage?.trim() ||
    "Belum ada komentar. Jadilah yang pertama memberikan masukan!";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSession) {
      setError(resolvedLoginPrompt);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || resolvedSubmitError);
      }

      const { comment } = (await res.json()) as { comment: Comment };
      setComments([comment, ...comments]);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : resolvedSubmitError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      ref={ref}
      id="komentar"
      className="scroll-reveal w-full border-t border-zinc-100 bg-white py-16 sm:py-24"
    >
      <div className="container-baren">
        <div className="mb-10 flex flex-col items-center gap-3 text-center sm:mb-12">
          <span className="pill-eyebrow">KOMENTAR</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
            {resolvedTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Form Komentar */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6">
              <h3 className="mb-4 text-base font-bold text-zinc-950">
                Tinggalkan komentar
              </h3>

              {userSession ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                    {userSession.image ? (
                      <Image
                        src={userSession.image}
                        width={34}
                        height={34}
                        className="h-8.5 w-8.5 rounded-full object-cover"
                        alt={userSession.name ?? "Pengguna"}
                      />
                    ) : (
                      <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                        {(userSession.name || "P")[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-zinc-900">
                      {userSession.name}
                    </span>
                  </div>

                  <div>
                    <label htmlFor="comment-textarea" className="sr-only">
                      Tulis komentar Anda
                    </label>
                    <textarea
                      id="comment-textarea"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Tulis kesan atau masukanmu untuk game BAREN..."
                      className="w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none"
                      rows={4}
                      maxLength={500}
                      disabled={submitting}
                      aria-describedby="char-count"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span id="char-count" className="text-xs text-zinc-400">
                      {body.length}/500 karakter
                    </span>
                    <button
                      type="submit"
                      disabled={submitting || !body.trim()}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>
                        {submitting ? "Mengirim..." : resolvedSubmitLabel}
                      </span>
                    </button>
                  </div>
                  {error && (
                    <p className="text-xs font-medium text-red-600">{error}</p>
                  )}
                </form>
              ) : (
                <div className="flex flex-col gap-4">
                  <textarea
                    placeholder="Tulis kesan atau masukanmu untuk game BAREN..."
                    disabled
                    aria-label="Kolom komentar memerlukan login"
                    className="w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 text-sm text-zinc-400 placeholder:text-zinc-400"
                    rows={3}
                  />
                  <form action={joinWishlistAction}>
                    <button
                      type="submit"
                      className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-xs font-semibold text-zinc-800 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>{resolvedLoginPrompt}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Daftar Komentar */}
          <div className="flex flex-col gap-3 lg:col-span-7">
            {comments.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/60 p-10 text-center">
                <p className="text-sm text-zinc-500">{resolvedEmptyMessage}</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3.5 rounded-2xl border border-zinc-200 bg-white p-5"
                >
                  {comment.userPhotoUrl ? (
                    <Image
                      src={comment.userPhotoUrl}
                      width={40}
                      height={40}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                      alt={comment.userName}
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-700">
                      {(comment.userName || "P")[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-950">
                        {comment.userName}
                      </span>
                      <span className="text-xs text-zinc-400">
                        •{" "}
                        {new Date(comment.createdAt).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed break-words whitespace-pre-wrap text-zinc-600">
                      {comment.body}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
