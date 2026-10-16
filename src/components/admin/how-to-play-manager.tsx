"use client";

import { useEffect, useState } from "react";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { Toast } from "./toast";

interface HowToPlayStep {
  id: number;
  step: number;
  title: string;
  description: string | null;
  mediaUrl: string | null;
  sortOrder: number;
}

interface StepFormData {
  step: number;
  title: string;
  description: string;
  mediaUrl: string;
  sortOrder: number;
}

interface ApiResponse {
  ok: boolean;
  data?: { steps: HowToPlayStep[]; videoUrl: string | null };
  message?: string;
  fields?: Record<string, string[]>;
}

export function HowToPlayManager() {
  const [steps, setSteps] = useState<HowToPlayStep[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stepForm, setStepForm] = useState<StepFormData>({
    step: 1,
    title: "",
    description: "",
    mediaUrl: "",
    sortOrder: 0,
  });
  const [editingStepId, setEditingStepId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/how-to-play");
      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        setError(json.message || "Gagal memuat how-to-play");
        return;
      }
      setSteps(
        (json.data?.steps || []).sort((a, b) => a.sortOrder - b.sortOrder),
      );
      setVideoUrl(json.data?.videoUrl || "");
    } catch (err) {
      setError("Gagal memuat how-to-play");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, []);

  const handleStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      const url = editingStepId
        ? `/api/how-to-play/steps/${editingStepId}`
        : "/api/how-to-play/steps";
      const method = editingStepId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stepForm),
      });
      const json = (await res.json()) as ApiResponse;

      if (!json.ok) {
        if (json.fields) {
          setFormErrors(json.fields);
        } else {
          setToast({
            message: json.message || "Gagal menyimpan langkah",
            type: "error",
          });
        }
        return;
      }

      setToast({
        message: editingStepId ? "Langkah diperbarui" : "Langkah ditambahkan",
        type: "success",
      });
      setStepForm({
        step: 1,
        title: "",
        description: "",
        mediaUrl: "",
        sortOrder: 0,
      });
      setEditingStepId(null);
      await loadData();
    } catch (err) {
      setToast({ message: "Gagal menyimpan langkah", type: "error" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStep = (item: HowToPlayStep) => {
    setStepForm({
      step: item.step,
      title: item.title,
      description: item.description || "",
      mediaUrl: item.mediaUrl || "",
      sortOrder: item.sortOrder,
    });
    setEditingStepId(item.id);
    setFormErrors({});
  };

  const handleCancelEdit = () => {
    setStepForm({
      step: 1,
      title: "",
      description: "",
      mediaUrl: "",
      sortOrder: 0,
    });
    setEditingStepId(null);
    setFormErrors({});
  };

  const handleDeleteStep = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/how-to-play/steps/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        setToast({
          message: json.message || "Gagal menghapus langkah",
          type: "error",
        });
        return;
      }
      setToast({ message: "Langkah dihapus", type: "success" });
      await loadData();
    } catch (err) {
      setToast({ message: "Gagal menghapus langkah", type: "error" });
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/how-to-play/video", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      });
      const json = (await res.json()) as ApiResponse;

      if (!json.ok) {
        setToast({
          message: json.message || "Gagal menyimpan video",
          type: "error",
        });
        return;
      }

      setToast({ message: "Video demo disimpan", type: "success" });
      await loadData();
    } catch (err) {
      setToast({ message: "Gagal menyimpan video", type: "error" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Memuat how-to-play...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="mb-8 p-4 border rounded">
        <h3 className="font-bold mb-4">Video Demo</h3>
        <form onSubmit={handleVideoSubmit} className="space-y-4">
          <div>
            <label htmlFor="videoUrl" className="block font-medium mb-1">
              URL Video Demo
            </label>
            <input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : "Simpan Video"}
          </button>
        </form>
      </div>

      <div className="mb-8 p-4 border rounded">
        <h3 className="font-bold mb-4">
          {editingStepId ? "Edit Langkah" : "Tambah Langkah"}
        </h3>
        <form onSubmit={handleStepSubmit} className="space-y-4">
          <div>
            <label htmlFor="step" className="block font-medium mb-1">
              Nomor Langkah *
            </label>
            <input
              id="step"
              type="number"
              value={stepForm.step}
              onChange={(e) =>
                setStepForm({ ...stepForm, step: Number(e.target.value) })
              }
              className="border px-3 py-2 rounded"
              required
            />
            {formErrors.step && (
              <p className="text-red-600 text-sm mt-1">{formErrors.step[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="title" className="block font-medium mb-1">
              Judul *
            </label>
            <input
              id="title"
              type="text"
              value={stepForm.title}
              onChange={(e) =>
                setStepForm({ ...stepForm, title: e.target.value })
              }
              className="w-full border px-3 py-2 rounded"
              required
            />
            {formErrors.title && (
              <p className="text-red-600 text-sm mt-1">{formErrors.title[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block font-medium mb-1">
              Deskripsi
            </label>
            <textarea
              id="description"
              value={stepForm.description}
              onChange={(e) =>
                setStepForm({ ...stepForm, description: e.target.value })
              }
              className="w-full border px-3 py-2 rounded"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="mediaUrl" className="block font-medium mb-1">
              URL Media
            </label>
            <input
              id="mediaUrl"
              type="url"
              value={stepForm.mediaUrl}
              onChange={(e) =>
                setStepForm({ ...stepForm, mediaUrl: e.target.value })
              }
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label htmlFor="sortOrder" className="block font-medium mb-1">
              Urutan
            </label>
            <input
              id="sortOrder"
              type="number"
              value={stepForm.sortOrder}
              onChange={(e) =>
                setStepForm({ ...stepForm, sortOrder: Number(e.target.value) })
              }
              className="border px-3 py-2 rounded"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
            {editingStepId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      <h3 className="font-bold mb-4">Daftar Langkah</h3>
      {steps.length === 0 ? (
        <p className="text-gray-500">Belum ada langkah.</p>
      ) : (
        <div className="space-y-4">
          {steps.map((item) => (
            <div key={item.id} className="p-4 border rounded">
              <h4 className="font-bold">
                Langkah {item.step}: {item.title}
              </h4>
              <p className="text-sm text-gray-600 mt-2">{item.description}</p>
              {item.mediaUrl && (
                <p className="text-xs text-gray-500 mt-1">
                  Media: {item.mediaUrl}
                </p>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => handleEditStep(item)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget({ id: item.id, title: item.title })
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
        title="Hapus Langkah"
        message={`Yakin hapus "${deleteTarget?.title}"?`}
        onConfirm={handleDeleteStep}
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
