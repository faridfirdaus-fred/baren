// Parser dan normalisasi respons komentar untuk panel admin (E15-3).

import { parseApiEnvelope, type ApiEnvelope } from "./api/client-response.ts";

export type AdminComment = {
  id: number;
  body: string;
  userName: string;
  userPhotoUrl: string | null;
  createdAt: string;
};

function isComment(value: unknown): value is Omit<
  AdminComment,
  "userName" | "userPhotoUrl"
> & {
  userName?: unknown;
  userPhotoUrl?: unknown;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "number" &&
    "body" in value &&
    typeof value.body === "string" &&
    "createdAt" in value &&
    typeof value.createdAt === "string"
  );
}

export function parseAdminComments(
  value: unknown,
): ApiEnvelope<AdminComment[]> {
  if (
    typeof value === "object" &&
    value !== null &&
    "comments" in value &&
    Array.isArray(value.comments)
  ) {
    return {
      ok: true,
      data: value.comments.filter(isComment).map((comment) => ({
        id: comment.id,
        body: comment.body,
        userName:
          typeof comment.userName === "string" && comment.userName.trim()
            ? comment.userName
            : "Anonim",
        userPhotoUrl:
          typeof comment.userPhotoUrl === "string" &&
          comment.userPhotoUrl.trim()
            ? comment.userPhotoUrl
            : null,
        createdAt: comment.createdAt,
      })),
    };
  }

  const envelope = parseApiEnvelope<unknown>(value);
  if (!envelope.ok) return envelope;
  return { ok: false, message: "Respons server tidak valid." };
}
