import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { isUniqueViolation, toDbResult } = await import("./db-errors.ts");

describe("isUniqueViolation", () => {
  it("true untuk error Postgres 23505", () => {
    assert.equal(isUniqueViolation({ code: "23505" }), true);
  });

  it("true untuk bungkusan DrizzleQueryError (kode di cause)", () => {
    assert.equal(
      isUniqueViolation({ message: "Failed query", cause: { code: "23505" } }),
      true,
    );
  });

  it("false untuk error lain, null, dan Error biasa", () => {
    assert.equal(isUniqueViolation({ code: "42P01" }), false);
    assert.equal(isUniqueViolation({}), false);
    assert.equal(isUniqueViolation(null), false);
    assert.equal(isUniqueViolation(new Error("boom")), false);
  });
});

describe("toDbResult", () => {
  it("konflik unik menjadi 409 dengan pesan aman pemanggil", () => {
    assert.deepEqual(toDbResult({ code: "23505" }, "Slug sudah dipakai."), {
      ok: false,
      status: 409,
      code: "CONFLICT",
      message: "Slug sudah dipakai.",
    });
  });

  it("error lain menjadi 500 generik tanpa membocorkan detail", () => {
    const r = toDbResult(new Error("NEON_DATABASE_URL is not set"));
    assert.deepEqual(r, {
      ok: false,
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Terjadi kesalahan pada server. Coba lagi nanti.",
    });
    assert.ok(!JSON.stringify(r).includes("NEON_DATABASE_URL"));
  });
});
