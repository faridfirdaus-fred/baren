import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { ok, fail, fromResult } = await import("./response.ts");
const {
  conflict,
  forbidden,
  internalError,
  notFound,
  unauthorized,
  validationFailed,
} = await import("./response.ts");

async function body(res) {
  assert.equal(res.headers.get("content-type"), "application/json");
  return res.json();
}

describe("ok", () => {
  it("mengembalikan status 200 dan amplop { ok: true, data }", async () => {
    const res = ok({ nama: "baren" });
    assert.equal(res.status, 200);
    assert.deepEqual(await body(res), { ok: true, data: { nama: "baren" } });
  });

  it("mendukung status kustom seperti 201", async () => {
    const res = ok({ id: 1 }, 201);
    assert.equal(res.status, 201);
    assert.deepEqual(await body(res), { ok: true, data: { id: 1 } });
  });
});

describe("fail", () => {
  it("mengembalikan amplop error konsisten tanpa fields bila kosong", async () => {
    const res = fail("NOT_FOUND", "Data tidak ditemukan.", 404);
    assert.equal(res.status, 404);
    assert.deepEqual(await body(res), {
      ok: false,
      error: { code: "NOT_FOUND", message: "Data tidak ditemukan." },
    });
  });

  it("menyertakan fields bila diberikan", async () => {
    const res = fail("VALIDATION_ERROR", "Validasi gagal.", 400, {
      namaGame: ["Wajib diisi."],
    });
    assert.deepEqual(await body(res), {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validasi gagal.",
        fields: { namaGame: ["Wajib diisi."] },
      },
    });
  });
});

describe("fromResult", () => {
  it("memetakan ApiResult sukses dan gagal ke Response", async () => {
    const a = fromResult({ ok: true, data: { x: 1 } });
    assert.equal(a.status, 200);
    assert.deepEqual(await a.json(), { ok: true, data: { x: 1 } });

    const b = fromResult({
      ok: false,
      status: 409,
      code: "CONFLICT",
      message: "Slug sudah dipakai.",
    });
    assert.equal(b.status, 409);
    assert.deepEqual(await b.json(), {
      ok: false,
      error: { code: "CONFLICT", message: "Slug sudah dipakai." },
    });
  });
});

describe("pintasan status", () => {
  it("unauthorized 401, forbidden 403, notFound 404 dengan pesan Indonesia", async () => {
    const a = unauthorized();
    assert.equal(a.status, 401);
    assert.deepEqual(await a.json(), {
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Sesi tidak ditemukan. Silakan masuk kembali.",
      },
    });

    const b = forbidden();
    assert.equal(b.status, 403);
    assert.deepEqual(await b.json(), {
      ok: false,
      error: {
        code: "FORBIDDEN",
        message: "Akun Anda tidak memiliki hak akses admin.",
      },
    });

    const c = notFound("Berita");
    assert.equal(c.status, 404);
    assert.deepEqual(await c.json(), {
      ok: false,
      error: { code: "NOT_FOUND", message: "Berita tidak ditemukan." },
    });
  });

  it("validationFailed 400 dengan fields, conflict 409, internalError 500 generik", async () => {
    const a = validationFailed({ judul: ["Wajib diisi."] });
    assert.equal(a.status, 400);
    assert.deepEqual(await a.json(), {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validasi gagal. Periksa kembali kolom yang ditandai.",
        fields: { judul: ["Wajib diisi."] },
      },
    });

    const b = conflict("Slug sudah dipakai.");
    assert.equal(b.status, 409);

    const c = internalError();
    assert.equal(c.status, 500);
    assert.deepEqual(await c.json(), {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Terjadi kesalahan pada server. Coba lagi nanti.",
      },
    });
  });
});
