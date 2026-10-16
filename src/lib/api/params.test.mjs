import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { parseIdParam, parsePageParam } = await import("./params.ts");

describe("parseIdParam", () => {
  it("menerima integer positif", () => {
    assert.deepEqual(parseIdParam("12"), { ok: true, data: 12 });
  });

  it("menolak nol, negatif, desimal, dan bukan angka", () => {
    for (const raw of ["0", "-1", "1.5", "abc", ""]) {
      const r = parseIdParam(raw);
      assert.equal(r.ok, false);
      assert.equal(r.status, 400);
      assert.deepEqual(r.fields, { id: ["ID tidak valid."] });
    }
  });
});

describe("parsePageParam", () => {
  it("default halaman 1 bila tanpa query", () => {
    assert.deepEqual(parsePageParam(null), { ok: true, data: 1 });
  });

  it("menerima integer >= 1 dan menolak sisanya", () => {
    assert.deepEqual(parsePageParam("3"), { ok: true, data: 3 });
    for (const raw of ["0", "-2", "1.5", "abc", ""]) {
      const r = parsePageParam(raw);
      assert.equal(r.ok, false);
      assert.equal(r.status, 400);
    }
  });
});
