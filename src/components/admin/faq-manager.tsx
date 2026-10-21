"use client";

import { useEffect, useState } from "react";

import { adminButtonClass } from "./button-styles";

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

  if (loading) return <p>Memuat FAQ...</p>;

  return (
    <div>
      {error && (
        <div
          style={{ padding: "1rem", background: "#fee", marginBottom: "1rem" }}
        >
          {error}
        </div>
      )}

      {/* Form tambah/edit */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <h2>{editingId ? "Edit FAQ" : "Tambah FAQ"}</h2>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="question">Pertanyaan</label>
          <input
            id="question"
            type="text"
            value={formData.question}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, question: e.target.value }))
            }
            disabled={submitting}
            style={{ display: "block", width: "100%", padding: "0.5rem" }}
          />
          {formErrors.question && (
            <div style={{ color: "red", fontSize: "0.875rem" }}>
              {formErrors.question.join(", ")}
            </div>
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="answer">Jawaban</label>
          <textarea
            id="answer"
            value={formData.answer}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, answer: e.target.value }))
            }
            disabled={submitting}
            rows={4}
            style={{ display: "block", width: "100%", padding: "0.5rem" }}
          />
          {formErrors.answer && (
            <div style={{ color: "red", fontSize: "0.875rem" }}>
              {formErrors.answer.join(", ")}
            </div>
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="sortOrder">Urutan</label>
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
            style={{ display: "block", width: "100%", padding: "0.5rem" }}
          />
          {formErrors.sortOrder && (
            <div style={{ color: "red", fontSize: "0.875rem" }}>
              {formErrors.sortOrder.join(", ")}
            </div>
          )}
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

      {/* Empty state */}
      {items.length === 0 && (
        <p style={{ color: "#666" }}>Belum ada FAQ. Tambahkan yang pertama!</p>
      )}

      {/* FAQ list */}
      {items.length > 0 && (
        <div>
          <h2>Daftar FAQ</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {items.map((item) => (
              <li
                key={item.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "1rem",
                  marginBottom: "0.5rem",
                }}
              >
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>Urutan:</strong> {item.sortOrder}
                </div>
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>Pertanyaan:</strong> {item.question}
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <strong>Jawaban:</strong> {item.answer}
                </div>
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
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
