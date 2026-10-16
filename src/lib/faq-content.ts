// E7-3: daftar FAQ untuk Server Component.
// Berhasil query (walau kosong) → rows DB; gagal (tanpa env/DB mati) → null
// sehingga pemanggil memakai fallback statis. Kosong dari DB = seksi hilang.

import { getDb } from "@/db";
import { faq } from "@/db/schema";

import { readFaq, type FaqRow } from "./api/faq";

export type FaqItem = { question: string; answer: string };

export async function getFaqItems(): Promise<FaqItem[] | null> {
  try {
    const db = getDb();
    const rows = await db.select().from(faq);
    const lister = {
      list: async (): Promise<FaqRow[]> =>
        rows.map((r) => ({
          id: r.id,
          question: r.question,
          answer: r.answer,
          sortOrder: r.sortOrder,
        })),
    };
    const ordered = await readFaq(lister);
    return ordered.map((r) => ({ question: r.question, answer: r.answer }));
  } catch {
    return null;
  }
}
