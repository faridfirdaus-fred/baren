import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { readFaq } = await import("./faq.ts");

describe("readFaq", () => {
  it("mengurutkan deterministik (sortOrder lalu id)", async () => {
    const store = {
      async list() {
        return [
          { id: 3, question: "C", answer: "c", sortOrder: 1 },
          { id: 2, question: "B", answer: "b", sortOrder: 0 },
          { id: 1, question: "A", answer: "a", sortOrder: 0 },
        ];
      },
    };
    assert.deepEqual(
      (await readFaq(store)).map((f) => f.id),
      [1, 2, 3],
    );
  });
});
