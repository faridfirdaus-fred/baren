// Parser dan normalisasi respons komentar untuk panel admin (E15-3/E16-3).

import { parseApiEnvelope } from "./api/client-response.ts";

export type AdminComment = {
  id: number;
  body: string;
  userName: string;
  userPhotoUrl: string | null;
  createdAt: string;
};

export type AdminCommentsEnvelope =
  | { ok: true; data: AdminComment[]; total: number }
  | {
      ok: false;
      message: string;
      code?: string;
      fields?: Record<string, string[]>;
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

/**
 * `total` hanya dipakai bila bilangan bulat dan >= jumlah item yang tampil.
 * Nilai hilang/tidak konsisten jatuh kembali ke panjang daftar agar UI tidak
 * menampilkan total yang lebih kecil dari data yang sedang dirender.
 */
function readTotal(value: unknown, count: number): number {
  return typeof value === "number" && Number.isInteger(value) && value >= count
    ? value
    : count;
}

export function parseAdminComments(value: unknown): AdminCommentsEnvelope {
  if (
    typeof value === "object" &&
    value !== null &&
    "comments" in value &&
    Array.isArray(value.comments)
  ) {
    const data = value.comments.filter(isComment).map((comment) => ({
      id: comment.id,
      body: comment.body,
      userName:
        typeof comment.userName === "string" && comment.userName.trim()
          ? comment.userName
          : "Anonim",
      userPhotoUrl:
        typeof comment.userPhotoUrl === "string" && comment.userPhotoUrl.trim()
          ? comment.userPhotoUrl
          : null,
      createdAt: comment.createdAt,
    }));

    return {
      ok: true,
      data,
      total: readTotal("total" in value ? value.total : undefined, data.length),
    };
  }

  const envelope = parseApiEnvelope<unknown>(value);
  if (!envelope.ok) return envelope;
  return { ok: false, message: "Respons server tidak valid." };
}
