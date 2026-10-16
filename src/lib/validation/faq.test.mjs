import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { faqCreateSchema, faqUpdateSchema } = await import("./faq.ts");

describe("faqCreateSchema", () => {
  it("wajib pertanyaan + jawaban", () => {
    assert.equal(
      faqCreateSchema.safeParse({ question: "Apa itu BAREN?", answer: "Game." })
        .success,
      true,
    );
    assert.equal(
      faqCreateSchema.safeParse({ question: "Apa itu BAREN?" }).success,
      false,
    );
    assert.equal(
      faqCreateSchema.safeParse({ question: "  ", answer: "Game." }).success,
      false,
    );
  });
});

describe("faqUpdateSchema", () => {
  it("minimal satu kolom dan menolak key asing", () => {
    assert.equal(faqUpdateSchema.safeParse({}).success, false);
    assert.equal(faqUpdateSchema.safeParse({ sortOrder: 2 }).success, true);
    assert.equal(faqUpdateSchema.safeParse({ foo: 1 }).success, false);
  });
});
