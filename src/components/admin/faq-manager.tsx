"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";

import { adminButtonClass } from "./button-styles";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { Toast } from "./toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  adminErrorClass,
  adminInputClass,
  adminLabelClass,
  adminTextareaClass,
} from "./form-styles";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
}

interface FaqFormData {
  question: string;
  answer: string;
  sortOrder: number;
}

interface ApiResponse {
  ok: boolean;
  data?: FaqItem[];
  message?: string;
  fields?: Record<string, string[]>;
}

const DEFAULT_FAQ_SEEDS = [
  {
    question: "Berapa pemain yang bisa bermain BAREN sekaligus?",
    answer:
      "BAREN dirancang untuk 4 pemain (2 lawan 2) pada satu layar bersama menggunakan controller atau papan ketik.",
  },
  {
    question: "Di platform apa BAREN akan dirilis?",
    answer:
      "Tahap awal BAREN disiapkan untuk PC melalui Steam. Kamu sudah bisa bergabung ke wishlist sekarang agar mendapat kabar saat rilis.",
  },
  {
    question: "Apakah aturan mainnya sulit dipelajari?",
    answer:
      "Sangat mudah! Cukup sentuh benteng sendiri untuk mengisi status FRESH, tangkap lawan ke tahanan, selamatkan teman, dan rebut benteng lawan.",
  },
  {
    question: "Berapa lama durasi satu ronde permainan?",
    answer:
      "Satu ronde berlangsung cepat sekitar 3 menit, cocok dimainkan bergantian bersama teman dan keluarga maupun di acara komunitas.",
  },
];

export function FaqManager() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FaqFormData>({
    question: "",
    answer: "",
    sortOrder: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FaqItem | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loadFaqs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/faq");
      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        setError(json.message || "Gagal memuat FAQ");
        return;
      }
      const sorted = [...(json.data || [])].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.id - b.id,
      );
      setItems(sorted);
    } catch (err) {
      setError("Gagal memuat FAQ");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadFaqs();
  }, []);

  const resetForm = (nextOrder = items.length) => {
    setFormData({ question: "", answer: "", sortOrder: nextOrder });
    setEditingId(null);
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      const isEditing = editingId !== null;
      const url = isEditing ? `/api/faq/${editingId}` : "/api/faq";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sortOrder: isEditing ? formData.sortOrder : items.length,
        }),
      });

      const json = (await res.json()) as ApiResponse;

      if (!json.ok) {
        if (json.fields) {
          setFormErrors(json.fields);
        } else {
          setToast({
            message: json.message || "Gagal menyimpan FAQ",
            type: "error",
          });
        }
        return;
      }

      setToast({
        message: isEditing ? "Pertanyaan diperbarui" : "Pertanyaan ditambahkan",
        type: "success",
      });
      resetForm(items.length + (isEditing ? 0 : 1));
      await loadFaqs();
    } catch (err) {
      setToast({ message: "Gagal menyimpan FAQ", type: "error" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: FaqItem) => {
    setFormData({
      question: item.question,
      answer: item.answer,
      sortOrder: item.sortOrder,
    });
    setEditingId(item.id);
    setFormErrors({});
  };

  const moveFaq = async (idx: number, dir: "up" | "down") => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    setItems(next);
    try {
      await Promise.all(
        next.map((item, i) =>
          fetch(`/api/faq/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sortOrder: i }),
          }),
        ),
      );
      setToast({ message: "Urutan FAQ diperbarui", type: "success" });
      await loadFaqs();
    } catch {
      setToast({ message: "Gagal memperbarui urutan", type: "error" });
    }
  };

  const handleSeedDefaults = async () => {
    setSubmitting(true);
    try {
      for (const [idx, seed] of DEFAULT_FAQ_SEEDS.entries()) {
        await fetch("/api/faq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...seed, sortOrder: idx }),
        });
      }
      setToast({
        message: "4 FAQ bawaan berhasil ditambahkan.",
        type: "success",
      });
      await loadFaqs();
    } catch {
      setToast({ message: "Gagal menyalin FAQ bawaan", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/faq/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        setToast({
          message: json.message || "Gagal menghapus FAQ",
          type: "error",
        });
        return;
      }
      setToast({ message: "Pertanyaan dihapus", type: "success" });
      if (editingId === deleteTarget.id) resetForm();
      await loadFaqs();
    } catch (err) {
      setToast({ message: "Gagal menghapus FAQ", type: "error" });
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-label="Memuat FAQ">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-7">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-80 w-full rounded-2xl lg:col-span-5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Kelola FAQ
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Atur daftar pertanyaan umum yang sering ditanyakan calon pemain.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href="/#faq"
            target="_blank"
            rel="noopener noreferrer"
            className={adminButtonClass("secondary", "md")}
          >
            <ExternalLink className="h-4 w-4 text-zinc-400" />
            <span>Lihat di Beranda</span>
          </a>
          <button
            type="button"
            onClick={() => resetForm()}
            className={adminButtonClass("primary", "md")}
          >
            <Plus className="h-4 w-4" />
            <span>Pertanyaan Baru</span>
          </button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <section
          aria-labelledby="faq-list-heading"
          className="space-y-3 lg:col-span-7"
        >
          <h2
            id="faq-list-heading"
            className="px-1 text-xs font-semibold uppercase tracking-wider text-zinc-500"
          >
            Daftar FAQ ({items.length})
          </h2>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
              <Sparkles className="mb-3 h-7 w-7 text-zinc-400" />
              <h3 className="text-base font-semibold text-zinc-900">
                Belum ada FAQ tersimpan
              </h3>
              <p className="mt-1 mb-5 max-w-md text-sm text-zinc-500">
                Salin 4 pertanyaan bawaan seputar BAREN agar langsung bisa
                diedit.
              </p>
              <button
                type="button"
                onClick={handleSeedDefaults}
                disabled={submitting}
                className={adminButtonClass("primary", "md")}
              >
                <Sparkles className="h-4 w-4" />
                <span>Salin 4 FAQ Bawaan</span>
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item, idx) => {
                const isSelected = editingId === item.id;
                return (
                  <li
                    key={item.id}
                    onClick={() => handleEdit(item)}
                    className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border bg-white p-4 transition-all ${
                      isSelected
                        ? "border-zinc-900 ring-2 ring-zinc-900/10"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-700">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-900">
                        {item.question}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                        {item.answer}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          void moveFaq(idx, "up");
                        }}
                        className="rounded-lg border border-zinc-200 p-1 text-zinc-600 hover:bg-zinc-50 disabled:opacity-25"
                        title="Naikkan urutan"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === items.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          void moveFaq(idx, "down");
                        }}
                        className="rounded-lg border border-zinc-200 p-1 text-zinc-600 hover:bg-zinc-50 disabled:opacity-25"
                        title="Turunkan urutan"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item);
                        }}
                        className={adminButtonClass("secondary", "icon-sm")}
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(item);
                        }}
                        className={adminButtonClass("danger", "icon-sm")}
                        title="Hapus"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="lg:col-span-5">
          <form
            onSubmit={handleSubmit}
            className="sticky top-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"
          >
            <div className="border-b border-zinc-100 pb-3.5">
              <h2 className="text-base font-bold text-zinc-900">
                {editingId ? "Edit FAQ" : "Tambah FAQ"}
              </h2>
            </div>

            <div>
              <label htmlFor="question" className={adminLabelClass}>
                Pertanyaan *
              </label>
              <input
                id="question"
                type="text"
                required
                value={formData.question}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, question: e.target.value }))
                }
                disabled={submitting}
                placeholder="Contoh: Berapa pemain yang bisa bermain sekaligus?"
                className={adminInputClass}
              />
              {formErrors.question && (
                <p className={adminErrorClass}>
                  {formErrors.question.join(", ")}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="answer" className={adminLabelClass}>
                Jawaban *
              </label>
              <textarea
                id="answer"
                required
                value={formData.answer}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, answer: e.target.value }))
                }
                disabled={submitting}
                rows={4}
                placeholder="Tulis jawaban yang ringkas dan mudah dipahami..."
                className={adminTextareaClass}
              />
              {formErrors.answer && (
                <p className={adminErrorClass}>
                  {formErrors.answer.join(", ")}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
              <button
                type="submit"
                disabled={submitting}
                className={adminButtonClass("primary", "md", "flex-1")}
              >
                {submitting
                  ? "Menyimpan..."
                  : editingId
                    ? "Simpan Perubahan"
                    : "Tambah"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => resetForm()}
                  disabled={submitting}
                  className={adminButtonClass("secondary", "md")}
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        title="Hapus FAQ"
        message={`Hapus pertanyaan "${deleteTarget?.question}"?`}
        onConfirm={() => void handleDelete()}
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
