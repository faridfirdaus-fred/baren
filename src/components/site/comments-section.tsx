"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageSquare, Send } from "lucide-react";

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

// Fallback contoh komentar sesuai mockup BAREN-1
const DEFAULT_COMMENTS: Comment[] = [
  {
    id: 901,
    userName: "Arya",
    userPhotoUrl: null,
    body: "Desainnya lucu banget! Rumah panggung dan maskotnya bikin nostalgia permainan waktu kecil.",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 902,
    userName: "Sinta",
    userPhotoUrl: null,
    body: "Sudah masuk wishlist. Nggak sabar main 2 lawan 2 bareng keluarga di ruang tamu!",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 903,
    userName: "Rama",
    userPhotoUrl: null,
    body: "Semoga nanti ada lebih banyak karakter dan arena kampung khas daerah lainnya.",
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
];

const AVATAR_COLORS = [
  "bg-[#c83820] text-white",
  "bg-[#10b981] text-white",
  "bg-[#2563eb] text-white",
  "bg-[#d97706] text-white",
];

export function CommentsSection({
  initialComments,
  userSession,
  title,
  loginPrompt,
  emptyMessage,
  submitLabel,
  submitError,
}: Props) {
  const [comments, setComments] = useState<Comment[]>(
    initialComments.length > 0 ? initialComments : DEFAULT_COMMENTS,
  );
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const ref = useScrollReveal<HTMLElement>();

  const resolvedTitle = title?.trim() || "Bagaimana pendapatmu?";
  const resolvedSubmitLabel = submitLabel || "Kirim";
  const resolvedSubmitError = submitError || "Gagal mengirim komentar";
  const resolvedLoginPrompt =
    loginPrompt || "Masuk dengan Google untuk berkomentar";
  const resolvedEmptyMessage =
    emptyMessage ||
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
      className="scroll-reveal relative w-full py-16 sm:py-24 bg-[#faf6ee] text-[#2f180a] overflow-hidden"
    >
      <div className="container-baren">
        <div className="flex flex-col items-center text-center gap-3 mb-12 sm:mb-16">
          <span className="pill-eyebrow">
            <MessageSquare className="w-3.5 h-3.5" /> KOMENTAR
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#2f180a]">
            {resolvedTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Kolom Kiri: Form Tinggalkan Komentar */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="rounded-3xl bg-white border-2 border-[#2f180a]/12 p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-black text-[#2f180a] mb-4">
                Tinggalkan komentar
              </h3>

              {userSession ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 pb-2 border-b border-[#2f180a]/10">
                    {userSession.image ? (
                      <Image
                        src={userSession.image}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full border border-[#2f180a]/20 object-cover"
                        alt={userSession.name ?? "User"}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#c83820] text-white flex items-center justify-center font-bold text-sm">
                        {(userSession.name || "U")[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-bold text-[#2f180a]">
                      {userSession.name}
                    </span>
                  </div>

                  <div className="relative">
                    <label htmlFor="comment-textarea" className="sr-only">
                      Tulis komentar Anda
                    </label>
                    <textarea
                      id="comment-textarea"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Tulis pendapat atau masukanmu untuk game BAREN..."
                      className="w-full rounded-2xl border-2 border-[#2f180a]/12 bg-[#faf6ee]/50 p-4 text-sm text-[#2f180a] placeholder:text-[#8c7b6d] focus:border-[#f59e0b] focus:bg-white focus:outline-none transition-all resize-none"
                      rows={4}
                      maxLength={500}
                      disabled={submitting}
                      aria-describedby="char-count"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span
                      id="char-count"
                      className="text-xs font-bold text-[#8c7b6d]"
                    >
                      Maks. 500 karakter ({body.length}/500)
                    </span>
                    <button
                      type="submit"
                      disabled={submitting || !body.trim()}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#c83820] hover:bg-[#a72d18] text-white font-bold text-xs uppercase tracking-wider shadow-md disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {submitting ? "Mengirim..." : resolvedSubmitLabel}
                      </span>
                    </button>
                  </div>
                  {error && (
                    <p className="text-xs font-bold text-[#c83820] mt-1">
                      {error}
                    </p>
                  )}
                </form>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <textarea
                      placeholder="Tulis pendapat atau masukanmu untuk game BAREN..."
                      disabled
                      className="w-full rounded-2xl border-2 border-[#2f180a]/10 bg-[#faf6ee]/40 p-4 text-sm text-[#8c7b6d] placeholder:text-[#8c7b6d]/70 resize-none opacity-80"
                      rows={3}
                    />
                  </div>
                  <div className="pt-2 flex flex-col gap-2">
                    <form action={joinWishlistAction}>
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-white border-2 border-[#2f180a]/20 text-[#2f180a] font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow hover:border-[#c83820] transition-all cursor-pointer"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                </div>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Stream Komentar */}
          <div className="lg:col-span-7 flex flex-col gap-3.5 sm:gap-4">
            {comments.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-[#2f180a]/15 bg-white p-8 text-center">
                <p className="text-sm font-bold text-[#8c7b6d]">
                  {resolvedEmptyMessage}
                </p>
              </div>
            ) : (
              comments.map((comment, index) => {
                const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
                return (
                  <div
                    key={comment.id}
                    className="flex gap-4 p-5 rounded-2xl bg-white border-2 border-[#2f180a]/12 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {comment.userPhotoUrl ? (
                      <Image
                        src={comment.userPhotoUrl}
                        width={44}
                        height={44}
                        className="h-11 w-11 shrink-0 rounded-full border-2 border-[#2f180a]/15 object-cover"
                        alt={comment.userName}
                      />
                    ) : (
                      <div
                        className={`h-11 w-11 shrink-0 rounded-full flex items-center justify-center text-sm font-black shadow-sm ${avatarColor}`}
                      >
                        {(comment.userName || "P")[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-[#2f180a] text-sm">
                          {comment.userName}
                        </span>
                        <span className="text-xs text-[#8c7b6d] font-bold">
                          •{" "}
                          {new Date(comment.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-[#542d14] leading-relaxed whitespace-pre-wrap break-words">
                        {comment.body}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
