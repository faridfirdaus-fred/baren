import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { fetchLinksApiResult, parseLinksApiResult } =
  await import("./admin-links-client.ts");

describe("parseLinksApiResult", () => {
  it("reads API validation field errors", () => {
    assert.deepEqual(
      parseLinksApiResult({
        ok: false,
        error: {
          message: "Data tidak valid.",
          fields: { url: ["URL harus diawali https://."] },
        },
      }),
      {
        ok: false,
        error: {
          message: "Data tidak valid.",
          fields: { url: ["URL harus diawali https://."] },
        },
      },
    );
  });

  it("rejects malformed response", () => {
    assert.deepEqual(parseLinksApiResult({ ok: true }), {
      ok: false,
      error: { message: "Respons server tidak valid." },
    });
  });
});

describe("fetchLinksApiResult", () => {
  it("turns failed fetch into section error without throwing", async () => {
    const result = await fetchLinksApiResult(async () => {
      throw new Error("offline");
    }, "/api/social-links");

    assert.deepEqual(result, {
      ok: false,
      error: {
        message: "Tautan dan pengaturan tidak dapat dimuat. Coba lagi.",
      },
    });
  });
});
