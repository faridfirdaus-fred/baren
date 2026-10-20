"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { Toast } from "./toast";
import {
  parseAdminComments,
  type AdminComment,
} from "@/lib/admin-comments-client";
import { apiErrorMessage } from "@/lib/api/client-response";

export function CommentsManager() {
  const [comments, setComments] = useState<AdminComment[]>([]);
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
      const res = await fetch("/api/comments", { cache: "no-store" });
      const parsed = parseAdminComments(await res.json());
      if (!parsed.ok) {
        setError(parsed.message);
        return;
      }
      setComments(parsed.data);
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
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      {comments.length === 0 ? (
        <p className="text-gray-500">Belum ada komentar.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-4 border rounded">
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
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-700"
                  data-testid="comment-avatar-fallback"
                >
                  {comment.userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-700 mb-2">{comment.body}</p>
                <p className="text-xs text-gray-500 mb-2">
                  Oleh: {comment.userName} |{" "}
                  {new Date(comment.createdAt).toLocaleString("id-ID")}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget({
                      id: comment.id,
                      preview: comment.body.slice(0, 50),
                    })
                  }
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
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
