import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";

const { parseJsonBody } = await import("./parse.ts");

const schema = z.object({ namaGame: z.string().trim().min(1, "Wajib diisi.") });

function put(body) {
  return new Request("http://uji/api/settings", { method: "PUT", body });
}

describe("parseJsonBody", () => {
  it("lolos untuk JSON valid sesuai skema", async () => {
    const r = await parseJsonBody(put('{"namaGame":"baren"}'), schema);
    assert.deepEqual(r, { ok: true, data: { namaGame: "baren" } });
  });

  it("400 untuk JSON malformed", async () => {
    const r = await parseJsonBody(put("{oops"), schema);
    assert.deepEqual(r, {
      ok: false,
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Isi permintaan bukan JSON yang valid.",
    });
  });

  it("400 dengan fields per kolom untuk JSON valid yang gagal skema", async () => {
    const r = await parseJsonBody(put('{"namaGame":""}'), schema);
    assert.equal(r.ok, false);
    assert.equal(r.status, 400);
    assert.equal(r.code, "VALIDATION_ERROR");
    assert.deepEqual(r.fields, { namaGame: ["Wajib diisi."] });
  });

  it("400 dengan fields root untuk bentuk JSON yang salah", async () => {
    const r = await parseJsonBody(put("[1,2]"), schema);
    assert.equal(r.ok, false);
    assert.equal(r.status, 400);
    assert.ok(r.fields["(data)"].length > 0);
  });

  it("400 untuk body kosong", async () => {
    const r = await parseJsonBody(
      new Request("http://uji/api/settings", { method: "PUT" }),
      schema,
    );
    assert.equal(r.ok, false);
    assert.equal(r.status, 400);
  });
});
