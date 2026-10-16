// E3-7: logika FAQ (CRUD + urut deterministik).
// Tanpa impor runtime (hanya `import type`).

import type { FaqCreate, FaqUpdate } from "../validation/faq";

export type FaqRow = {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
};

export type FaqLister = { list(): Promise<FaqRow[]> };
export type FaqCreator = { create(input: FaqCreate): Promise<FaqRow> };
export type FaqById = {
  update(id: number, patch: FaqUpdate): Promise<FaqRow | null>;
  remove(id: number): Promise<FaqRow | null>;
};

/** GET publik: FAQ berurutan deterministik. */
export async function readFaq(store: FaqLister): Promise<FaqRow[]> {
  const rows = await store.list();
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
}
