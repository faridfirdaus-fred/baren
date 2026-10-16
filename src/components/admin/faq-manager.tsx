"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";

import { parseFaqApiResult, type FaqItem } from "@/lib/admin-faq-client";

type FaqFormValues = {
  question: string;
  answer: string;
  sortOrder: number;
};

const emptyValues: FaqFormValues = { question: "", answer: "", sortOrder: 0 };

async function fetchFaq(signal?: AbortSignal) {
  const response = await fetch("/api/faq", { cache: "no-store", signal });
  return parseFaqApiResult<FaqItem[]>(await response.json());
}

export function AdminFaqManager() {
  const router = useRouter();
  const requestVersion = useRef(0);
  const [items, setItems] = useState<FaqItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FaqFormValues>({ defaultValues: emptyValues });

  const loadFaq = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoadError(null);
    try {
      const result = await fetchFaq();
      if (version !== requestVersion.current) return;
      if (!result.ok) {
        setLoadError(result.error.message);
        return;
      }
      setItems(result.data);
    } catch {
      if (version === requestVersion.current) {
        setLoadError("FAQ tidak dapat dimuat. Coba lagi.");
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const version = ++requestVersion.current;
    void fetchFaq(controller.signal)
      .then((result) => {
        if (controller.signal.aborted || version !== requestVersion.current)
          return;
        if (!result.ok) {
          setLoadError(result.error.message);
          return;
        }
        setItems(result.data);
      })
      .catch(() => {
        if (!controller.signal.aborted && version === requestVersion.current) {
          setLoadError("FAQ tidak dapat dimuat. Coba lagi.");
        }
      });
    return () => controller.abort();
  }, []);

  function cancelEdit() {
    setEditingId(null);
    clearErrors();
    reset(emptyValues);
  }

  function applyServerErrors(fields?: Record<string, string[]>) {
    for (const [name, messages] of Object.entries(fields ?? {})) {
      if (name === "question" || name === "answer" || name === "sortOrder") {
        setError(name as FieldPath<FaqFormValues>, {
          type: "server",
          message: messages[0],
        });
      }
    }
  }

  async function submit(values: FaqFormValues) {
    requestVersion.current += 1;
    clearErrors("root");
    const endpoint = editingId === null ? "/api/faq" : `/api/faq/${editingId}`;
    const method = editingId === null ? "POST" : "PUT";
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = parseFaqApiResult<FaqItem>(await response.json());
      if (!result.ok) {
        applyServerErrors(result.error.fields);
        setError("root", { type: "server", message: result.error.message });
        return;
      }
      cancelEdit();
      await loadFaq();
      router.refresh();
    } catch {
      setError("root", {
        type: "server",
        message: "FAQ tidak dapat disimpan. Coba lagi.",
      });
    }
  }

  function edit(item: FaqItem) {
    setEditingId(item.id);
    clearErrors();
    reset({
      question: item.question,
      answer: item.answer,
      sortOrder: item.sortOrder,
    });
  }

  async function remove(item: FaqItem) {
    if (!window.confirm(`Hapus FAQ “${item.question}”?`)) return;
    requestVersion.current += 1;
    setDeletingId(item.id);
    setLoadError(null);
    try {
      const response = await fetch(`/api/faq/${item.id}`, { method: "DELETE" });
      const result = parseFaqApiResult<FaqItem>(await response.json());
      if (!result.ok) {
        setLoadError(result.error.message);
        return;
      }
      if (editingId === item.id) cancelEdit();
      await loadFaq();
      router.refresh();
    } catch {
      setLoadError("FAQ tidak dapat dihapus. Coba lagi.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid max-w-4xl gap-8">
      <section aria-labelledby="faq-form-heading">
        <h1 id="faq-form-heading">Kelola FAQ</h1>
        <form
          onSubmit={(event) => {
            void handleSubmit(submit)(event);
          }}
          className="grid gap-4"
        >
          <div>
            <label htmlFor="faq-question">Pertanyaan</label>
            <input
              id="faq-question"
              type="text"
              autoFocus
              required
              {...register("question")}
              aria-invalid={Boolean(errors.question)}
              aria-describedby={
                errors.question ? "faq-question-error" : undefined
              }
            />
            {errors.question ? (
              <p id="faq-question-error" role="alert">
                {errors.question.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="faq-answer">Jawaban</label>
            <textarea
              id="faq-answer"
              rows={5}
              required
              {...register("answer")}
              aria-invalid={Boolean(errors.answer)}
              aria-describedby={errors.answer ? "faq-answer-error" : undefined}
            />
            {errors.answer ? (
              <p id="faq-answer-error" role="alert">
                {errors.answer.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="faq-sort-order">Urutan</label>
            <input
              id="faq-sort-order"
              type="number"
              min={0}
              step={1}
              required
              {...register("sortOrder", { valueAsNumber: true })}
              aria-invalid={Boolean(errors.sortOrder)}
              aria-describedby={
                errors.sortOrder ? "faq-sort-order-error" : undefined
              }
            />
            {errors.sortOrder ? (
              <p id="faq-sort-order-error" role="alert">
                {errors.sortOrder.message}
              </p>
            ) : null}
          </div>
          {errors.root ? <p role="alert">{errors.root.message}</p> : null}
          <div className="flex gap-4">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Menyimpan..."
                : editingId === null
                  ? "Tambah FAQ"
                  : "Simpan perubahan"}
            </button>
            {editingId !== null ? (
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isSubmitting}
              >
                Batal
              </button>
            ) : null}
          </div>
        </form>
      </section>
      <section aria-labelledby="faq-list-heading">
        <h2 id="faq-list-heading">Daftar FAQ</h2>
        {items === null && loadError === null ? <p>Memuat FAQ...</p> : null}
        {loadError ? (
          <div role="alert">
            <p>{loadError}</p>
            <button type="button" onClick={() => void loadFaq()}>
              Coba lagi
            </button>
          </div>
        ) : null}
        {items !== null && !loadError && items.length === 0 ? (
          <p>Belum ada FAQ.</p>
        ) : null}
        {items !== null && !loadError && items.length > 0 ? (
          <ul className="grid gap-4">
            {items.map((item) => (
              <li key={item.id}>
                <article>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                  <p>Urutan: {item.sortOrder}</p>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => edit(item)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(item)}
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
