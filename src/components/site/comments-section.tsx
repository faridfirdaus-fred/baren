"use client";

import { useState } from "react";
import Image from "next/image";

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

  const resolvedTitle = title?.trim() || "KOMENTAR KOMUNITAS";
  const resolvedSubmitLabel = submitLabel || "Kirim";
  const resolvedSubmitError = submitError || "Gagal mengirim komentar";
  const resolvedLoginPrompt =
    loginPrompt || "Silakan login dengan Google untuk berkomentar";
  const resolvedEmptyMessage = emptyMessage || "Belum ada komentar.";

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
      className="scroll-reveal container mx-auto max-w-4xl px-4 py-16 scroll-mt-24 border-t border-line/40"
    >
      <div className="flex flex-col items-center text-center mb-10">
        <p className="eyebrow text-ember">DISKUSI KOMUNITAS</p>
        <h2 className="display-xl mt-3 text-sand text-[clamp(2rem,4vw,3.25rem)]">
          {resolvedTitle}
        </h2>
      </div>

      {userSession ? (
        <form
          onSubmit={handleSubmit}
          className="mb-12 rounded border border-line bg-ink-800 p-6"
        >
          <div className="flex gap-4">
            {userSession.image ? (
              <Image
                src={userSession.image}
                width={44}
                height={44}
                className="h-11 w-11 rounded-full border border-line object-cover"
                alt={userSession.name ?? "User"}
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-700 border border-line text-sand font-bold">
                {(userSession.name || "U")[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <label htmlFor="comment-textarea" className="sr-only">
                Tulis komentar Anda
              </label>
              <textarea
                id="comment-textarea"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Tulis pendapat atau masukanmu untuk game BAREN..."
                className="w-full rounded border border-line bg-ink-900 px-4 py-3 text-sand placeholder:text-sand-600 focus:border-ember focus:outline-none focus:ring-1 focus:ring-ember transition-colors"
                rows={3}
                maxLength={500}
                disabled={submitting}
                aria-describedby="char-count"
              />
              <div className="mt-3 flex items-center justify-between">
                <span id="char-count" className="text-xs text-sand-600">
                  {body.length}/500 karakter
                </span>
                <button
                  type="submit"
                  disabled={submitting || !body.trim()}
                  className="rounded bg-ember-700 px-6 py-2.5 font-bold uppercase tracking-wider text-sand transition-colors hover:bg-ember-800 disabled:opacity-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                >
                  {submitting ? "Mengirim..." : resolvedSubmitLabel}
                </button>
              </div>
              {error && <p className="mt-2 text-sm text-ember">{error}</p>}
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-12 rounded border border-line bg-ink-800/80 p-8 text-center">
          <p className="mb-4 text-sm leading-relaxed text-sand/80 max-w-md mx-auto">
            {resolvedLoginPrompt}
          </p>
          <form action={joinWishlistAction} className="inline-flex">
            <button
              type="submit"
              className="cursor-pointer rounded bg-ember-700 px-6 py-3 font-sans text-xs font-bold uppercase tracking-wider text-sand shadow-lg transition hover:bg-ember-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              Masuk dengan Google
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="rounded border border-dashed border-line bg-ink-800/50 p-8 text-center">
            <p className="text-sm text-sand-600">{resolvedEmptyMessage}</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-4 rounded border border-line bg-ink-800 p-5 transition-colors hover:border-sand/20"
            >
              {comment.userPhotoUrl ? (
                <Image
                  src={comment.userPhotoUrl}
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 rounded-full border border-line object-cover"
                  alt={comment.userName}
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-700 border border-line text-xs font-bold text-sand">
                  {(comment.userName || "A")[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold text-sand text-sm">
                    {comment.userName}
                  </span>
                  <span className="text-xs text-sand-600">
                    {new Date(comment.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-sand/80 whitespace-pre-wrap break-words">
                  {comment.body}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
