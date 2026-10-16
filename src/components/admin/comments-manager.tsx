"use client";

import { useEffect, useState } from "react";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { Toast } from "./toast";

interface Comment {
  id: number;
  userId: string;
  body: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  };
}

interface ApiResponse {
  comments?: Comment[];
  error?: string;
  message?: string;
}

export function CommentsManager() {
  const [comments, setComments] = useState<Comment[]>([]);
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
      const res = await fetch("/api/comments");
      const json = (await res.json()) as ApiResponse;
      if (json.error) {
        setError(json.error);
        return;
      }
      setComments(json.comments || []);
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
      const json = (await res.json()) as ApiResponse;
      if (json.error || json.message?.includes("Gagal")) {
        setToast({
          message: json.error || json.message || "Gagal menghapus komentar",
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
            <div key={comment.id} className="p-4 border rounded">
              <p className="text-sm text-gray-700 mb-2">{comment.body}</p>
              <p className="text-xs text-gray-500 mb-2">
                Oleh: {comment.user.name || comment.user.email || "Unknown"} |{" "}
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
