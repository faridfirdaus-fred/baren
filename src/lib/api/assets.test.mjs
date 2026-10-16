import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { deleteAssetObject } = await import("./assets.ts");

describe("deleteAssetObject", () => {
  it("200 deleted:false bila objek hilang (idempoten)", async () => {
    const store = {
      async head() {
        return { exists: false };
      },
      async remove() {
        throw new Error("remove tak boleh dipanggil bila hilang");
      },
    };
    const r = await deleteAssetObject(store, "assets/a.png");
    assert.deepEqual(r, {
      ok: true,
      data: { key: "assets/a.png", deleted: false },
    });
  });

  it("200 deleted:true bila ada + hapus sukses", async () => {
    let removed = null;
    const store = {
      async head() {
        return { exists: true };
      },
      async remove(key) {
        removed = key;
      },
    };
    const r = await deleteAssetObject(store, "assets/a.png");
    assert.deepEqual(r, {
      ok: true,
      data: { key: "assets/a.png", deleted: true },
    });
    assert.equal(removed, "assets/a.png");
  });

  it("500 bila head gagal", async () => {
    const store = {
      async head() {
        throw new Error("binding down");
      },
      async remove() {},
    };
    const r = await deleteAssetObject(store, "assets/a.png");
    assert.equal(r.ok, false);
    assert.equal(r.status, 500);
  });

  it("500 bila remove gagal setelah ada", async () => {
    const store = {
      async head() {
        return { exists: true };
      },
      async remove() {
        throw new Error("r2 down");
      },
    };
    const r = await deleteAssetObject(store, "assets/a.png");
    assert.equal(r.ok, false);
    assert.equal(r.status, 500);
  });
});
