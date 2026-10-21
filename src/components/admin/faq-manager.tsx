"use client";

import { useEffect, useState } from "react";

import { adminButtonClass } from "./button-styles";
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

  // Load FAQ list
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
      setItems(json.data || []);
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

  // Handle form submission (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      const url = editingId ? `/api/faq/${editingId}` : "/api/faq";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = (await res.json()) as ApiResponse;

      if (!json.ok) {
        if (json.fields) {
          setFormErrors(json.fields);
        } else {
          setError(json.message || "Gagal menyimpan FAQ");
        }
        return;
      }

      // Success: reset form and reload
      setFormData({ question: "", answer: "", sortOrder: 0 });
      setEditingId(null);
      setFormErrors({});
      await loadFaqs();
    } catch (err) {
      setError("Gagal menyimpan FAQ");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit button
  const handleEdit = (item: FaqItem) => {
    setFormData({
      question: item.question,
      answer: item.answer,
      sortOrder: item.sortOrder,
    });
    setEditingId(item.id);
    setFormErrors({});
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setFormData({ question: "", answer: "", sortOrder: 0 });
    setEditingId(null);
    setFormErrors({});
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus FAQ ini?")) return;

    try {
      const res = await fetch(`/api/faq/${id}`, { method: "DELETE" });
      const json = (await res.json()) as ApiResponse;

      if (!json.ok) {
        setError(json.message || "Gagal menghapus FAQ");
        return;
      }

      await loadFaqs();
    } catch (err) {
      setError("Gagal menghapus FAQ");
      console.error(err);
    }
  };

  if (loading) return <p className="text-sand-600">Memuat FAQ...</p>;

  return (
    <div className="grid max-w-3xl gap-8">
      {error ? (
        <div
          role="alert"
          className="border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember"
        >
          {error}
        </div>
      ) : null}

      {/* Form tambah/edit */}
      <form
        onSubmit={handleSubmit}
        className="border border-line bg-ink-800 p-6"
      >
        <h2 className="mb-4 font-display text-xl font-bold uppercase tracking-wider text-sand">
          {editingId ? "Edit FAQ" : "Tambah FAQ"}
        </h2>

        <div className="mb-4">
          <label htmlFor="question" className={adminLabelClass}>
            Pertanyaan
          </label>
          <input
            id="question"
            type="text"
            value={formData.question}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, question: e.target.value }))
            }
            disabled={submitting}
            className={adminInputClass}
          />
          {formErrors.question ? (
            <p className={adminErrorClass}>{formErrors.question.join(", ")}</p>
          ) : null}
        </div>

        <div className="mb-4">
          <label htmlFor="answer" className={adminLabelClass}>
            Jawaban
          </label>
          <textarea
            id="answer"
            value={formData.answer}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, answer: e.target.value }))
            }
            disabled={submitting}
            rows={4}
            className={adminTextareaClass}
          />
          {formErrors.answer ? (
            <p className={adminErrorClass}>{formErrors.answer.join(", ")}</p>
          ) : null}
        </div>

        <div className="mb-4">
          <label htmlFor="sortOrder" className={adminLabelClass}>
            Urutan
          </label>
          <input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                sortOrder: parseInt(e.target.value, 10) || 0,
              }))
            }
            disabled={submitting}
            className={`${adminInputClass} max-w-40`}
          />
          {formErrors.sortOrder ? (
            <p className={adminErrorClass}>{formErrors.sortOrder.join(", ")}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className={adminButtonClass("primary", "md")}
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
              onClick={handleCancelEdit}
              disabled={submitting}
              className={adminButtonClass("secondary", "md")}
            >
              Batal
            </button>
          )}
        </div>
      </form>

      <section aria-labelledby="faq-list-heading" className="grid gap-3">
        <h2
          id="faq-list-heading"
          className="font-display text-xl font-bold uppercase tracking-wider text-sand"
        >
          Daftar FAQ
        </h2>
        {items.length === 0 ? (
          <p className="text-sand-600">
            Belum ada FAQ. Tambahkan yang pertama!
          </p>
        ) : (
          <ul className="grid gap-3">
            {items.map((item) => (
              <li key={item.id} className="border border-line bg-ink-800 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sand-600">
                    Urutan {item.sortOrder}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className={adminButtonClass("secondary", "sm")}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className={adminButtonClass("danger", "sm")}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                <p className="font-semibold text-sand">{item.question}</p>
                <p className="mt-1 text-sm text-sand-600">{item.answer}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
