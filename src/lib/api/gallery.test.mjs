import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { readGallery } = await import("./gallery.ts");

describe("readGallery", () => {
  it("meneruskan filter kind dan mengurutkan deterministik", async () => {
    let gotKind;
    const store = {
      async list(kind) {
        gotKind = kind;
        return [
          { id: 2, kind: "video", title: null, fileUrl: "b", sortOrder: 0 },
          { id: 1, kind: "video", title: null, fileUrl: "a", sortOrder: 0 },
        ];
      },
    };
    const r = await readGallery(store, "video");
    assert.equal(gotKind, "video");
    assert.deepEqual(
      r.map((g) => g.id),
      [1, 2],
    );
  });
});
