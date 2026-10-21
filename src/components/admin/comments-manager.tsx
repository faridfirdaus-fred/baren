"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { adminButtonClass } from "./button-styles";
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

  if (loading) return <p>Memuat komentar...</p>;
  if (error)
    return (
      <p
        role="alert"
        className="border border-ember/40 bg-ember/10 p-4 text-sm text-ember"
      >
        {error}
      </p>
    );

  return (
    <div>
      <p
        className="mb-4 text-sm text-sand-600"
        data-testid="admin-comments-total"
      >
        Total {total} komentar.
        {comments.length < total
          ? ` Menampilkan ${comments.length} komentar.`
          : null}
      </p>

      {comments.length === 0 ? (
        <p className="text-sand-600">Belum ada komentar.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li
              key={comment.id}
              id={`komentar-${comment.id}`}
              className="flex scroll-mt-24 gap-3 border border-line bg-ink-800 p-4"
            >
              {comment.userPhotoUrl ? (
                <Image
                  src={comment.userPhotoUrl}
                  width={36}
                  height={36}
                  alt=""
                  unoptimized
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand/10 text-sm font-bold text-sand"
                  data-testid="comment-avatar-fallback"
                >
                  {comment.userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="mb-2 text-sm text-sand">{comment.body}</p>
                <p className="mb-2 text-xs text-sand-600">
                  Oleh: {comment.userName} |{" "}
                  <time dateTime={comment.createdAt}>
                    {formatDateTimeId(comment.createdAt) ??
                      "Waktu tidak tersedia"}
                  </time>
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget({
                      id: comment.id,
                      preview: comment.body.slice(0, 50),
                    })
                  }
                  className={adminButtonClass("danger", "sm")}
                >
                  Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        title="Hapus Komentar"
        message={`Yakin hapus "${deleteTarget?.preview}"...?`}
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
