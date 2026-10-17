"use client";

import { useState } from "react";
import Image from "next/image";

import { useScrollReveal } from "@/lib/use-scroll-reveal";

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

  if (!title) return null;

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
      className="scroll-reveal container mx-auto max-w-4xl px-4 py-16"
    >
      <h2 className="display-xl mb-8 text-[clamp(2rem,4vw,3.25rem)]">
        {title}
      </h2>

      {userSession ? (
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="flex gap-4">
            {userSession.image && (
              <Image
                src={userSession.image}
                width={40}
                height={40}
                className="rounded-full"
                alt={userSession.name ?? "User"}
              />
            )}
            <div className="flex-1">
              <label htmlFor="comment-textarea" className="sr-only">
                Tulis komentar Anda
              </label>
              <textarea
                id="comment-textarea"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Tulis komentar..."
                className="w-full rounded-lg border border-ink/20 bg-white px-4 py-3 text-ink focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
                rows={3}
                maxLength={500}
                disabled={submitting}
                aria-describedby="char-count"
              />
              <div className="mt-2 flex items-center justify-between">
                <span id="char-count" className="text-sm text-ink-600">
                  {body.length}/500 karakter
                </span>
                <button
                  type="submit"
                  disabled={submitting || !body.trim()}
                  className="rounded-lg bg-ember-700 px-6 py-2 font-bold uppercase tracking-wide text-white transition-colors hover:bg-ember-800 disabled:opacity-50"
                >
                  {submitting ? "Mengirim..." : resolvedSubmitLabel}
                </button>
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-12 rounded-lg border border-ink/20 bg-sand/50 p-6 text-center">
          <p className="text-ink-600">{resolvedLoginPrompt}</p>
        </div>
      )}

      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-center text-ink-600">{resolvedEmptyMessage}</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-4 rounded-lg border border-ink/10 bg-white p-6"
            >
              {comment.userPhotoUrl ? (
                <Image
                  src={comment.userPhotoUrl}
                  width={40}
                  height={40}
                  className="rounded-full"
                  alt={comment.userName}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-ink-200" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-ink">{comment.userName}</span>
                  <span className="text-sm text-ink-500">
                    {new Date(comment.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="mt-2 text-ink-700">{comment.body}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
