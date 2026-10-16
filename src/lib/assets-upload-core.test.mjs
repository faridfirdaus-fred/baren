import { describe, it } from "node:test";
import assert from "node:assert/strict";

const {
  presignErrorForStatus,
  isPresignTriple,
  putErrorForStatus,
  nextRetryTriple,
} = await import("./assets-upload-core.ts");

describe("presignErrorForStatus", () => {
  it("401/403 berpesan Indonesia tetap", () => {
    assert.equal(presignErrorForStatus(401).kind, "unauthorized");
    assert.equal(presignErrorForStatus(403).kind, "forbidden");
  });
  it("400 validasi memakai pesan server", () => {
    const e = presignErrorForStatus(400, "Gambar melebihi batas 5 MB.");
    assert.equal(e.kind, "validation");
    assert.match(e.message, /5 MB/);
  });
  it("500 server memakai pesan server atau fallback", () => {
    assert.equal(presignErrorForStatus(500).kind, "server");
    assert.equal(presignErrorForStatus(500, "Down").message, "Down");
  });
});

describe("isPresignTriple", () => {
  it("lolos bila key/uploadUrl/publicUrl ada", () => {
    assert.equal(
      isPresignTriple({ key: "a", uploadUrl: "u", publicUrl: "p" }),
      true,
    );
  });
  it("menolak bila salah satu hilang", () => {
    assert.equal(isPresignTriple({ key: "a", uploadUrl: "u" }), false);
    assert.equal(isPresignTriple(null), false);
    assert.equal(isPresignTriple({}), false);
  });
});

describe("putErrorForStatus", () => {
  it("403 -> signature", () => {
    assert.equal(putErrorForStatus(403).kind, "signature");
  });
  it("500/0 -> ambiguous", () => {
    assert.equal(putErrorForStatus(500).kind, "ambiguous");
    assert.equal(putErrorForStatus(0).kind, "ambiguous");
  });
});

describe("nextRetryTriple", () => {
  it("mengganti ketiga nilai sekaligus (atomik)", () => {
    const fresh = { key: "k2", uploadUrl: "u2", publicUrl: "p2" };
    assert.deepEqual(nextRetryTriple(fresh), fresh);
  });
});
