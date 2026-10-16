import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { parseFaqApiResult } = await import("./admin-faq-client.ts");

describe("parseFaqApiResult", () => {
  it("accepts E3-7 FAQ success envelope", () => {
    assert.deepEqual(
      parseFaqApiResult({
        ok: true,
        data: [{ id: 1, question: "Apa?", answer: "Ini.", sortOrder: 0 }],
      }),
      {
        ok: true,
        data: [{ id: 1, question: "Apa?", answer: "Ini.", sortOrder: 0 }],
      },
    );
  });

  it("preserves server validation field errors", () => {
    assert.deepEqual(
      parseFaqApiResult({
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validasi gagal.",
          fields: { question: ["Pertanyaan wajib diisi."] },
        },
      }),
      {
        ok: false,
        error: {
          message: "Validasi gagal.",
          fields: { question: ["Pertanyaan wajib diisi."] },
        },
      },
    );
  });
});
