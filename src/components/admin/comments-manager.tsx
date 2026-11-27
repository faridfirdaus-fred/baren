"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { adminButtonClass } from "./button-styles";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { Toast } from "./toast";
import { formatDateTimeId } from "@/lib/admin/datetime";
import {
  parseAdminComments,
  type AdminComment,
} from "@/lib/admin-comments-client";
import { apiErrorMessage } from "@/lib/api/client-response";

export function CommentsManager() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    preview: string;
  } | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loadComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/comments?scope=admin", {
        cache: "no-store",
      });
      const parsed = parseAdminComments(await res.json());
      if (!parsed.ok) {
        setError(parsed.message);
        return;
      }
      setComments(parsed.data);
      setTotal(parsed.total);
    } catch (err) {
      setError("Gagal memuat komentar");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadComments();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/comments/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setToast({
          message: apiErrorMessage(json, "Gagal menghapus komentar"),
          type: "error",
        });
        return;
      }
      setToast({ message: "Komentar dihapus", type: "success" });
      await loadComments();
    } catch (err) {
      setToast({ message: "Gagal menghapus komentar", type: "error" });
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4" role="status" aria-label="Memuat komentar">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        {error}
      </p>
    );
  }

  return (
    <div>
      <p
        className="mb-4 text-sm text-zinc-500"
        data-testid="admin-comments-total"
      >
        Total {total} komentar.
        {comments.length < total
          ? ` Menampilkan ${comments.length} komentar.`
          : null}
      </p>

      {comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white py-12 text-center text-sm text-zinc-500">
          Belum ada komentar.
        </div>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              id={`komentar-${comment.id}`}
              className="flex scroll-mt-24 items-start justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4"
            >
              <div className="flex min-w-0 flex-1 gap-3.5">
                {comment.userPhotoUrl ? (
                  <Image
                    src={comment.userPhotoUrl}
                    width={36}
                    height={36}
                    alt=""
                    unoptimized
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-700"
                    data-testid="comment-avatar-fallback"
                  >
                    {comment.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed text-zinc-900">
                    {comment.body}
                  </p>
                  <p className="mt-1.5 text-xs text-zinc-500">
                    Oleh: {comment.userName} ·{" "}
                    <time dateTime={comment.createdAt}>
                      {formatDateTimeId(comment.createdAt) ??
                        "Waktu tidak tersedia"}
                    </time>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget({
                    id: comment.id,
                    preview: comment.body.slice(0, 50),
                  })
                }
                className={adminButtonClass("danger", "sm", "shrink-0")}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        title="Hapus Komentar"
        message={`Apakah Anda yakin ingin menghapus komentar "${deleteTarget?.preview}..."?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
