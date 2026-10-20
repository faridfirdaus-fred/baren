import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { apiErrorMessage, parseApiEnvelope } =
  await import("./client-response.ts");

describe("parseApiEnvelope", () => {
  it("membaca amplop sukses", () => {
    assert.deepEqual(parseApiEnvelope({ ok: true, data: [1] }), {
      ok: true,
      data: [1],
    });
  });

  it("membaca error beserta field validasi", () => {
    assert.deepEqual(
      parseApiEnvelope({
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Data salah",
          fields: { title: ["Wajib"] },
        },
      }),
      {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Data salah",
        fields: { title: ["Wajib"] },
      },
    );
  });

  it("menangani error string dan bentuk rusak", () => {
    assert.deepEqual(parseApiEnvelope({ ok: false, error: "Ditolak" }), {
      ok: false,
      message: "Ditolak",
    });
    assert.deepEqual(parseApiEnvelope({ items: [] }), {
      ok: false,
      message: "Respons server tidak valid.",
    });
  });
});

describe("apiErrorMessage", () => {
  it("mengambil error nested, string, atau fallback", () => {
    assert.equal(
      apiErrorMessage({ error: { message: "Ditolak" } }, "Gagal"),
      "Ditolak",
    );
    assert.equal(apiErrorMessage({ error: "Tidak ada" }, "Gagal"), "Tidak ada");
    assert.equal(apiErrorMessage(null, "Gagal"), "Gagal");
  });
});
