import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { newsCreateSchema, newsUpdateSchema } = await import("./news.ts");

const VALID = {
  title: "Rilis Beta",
  slug: "rilis-beta",
  body: "Isi berita.",
};

describe("newsCreateSchema", () => {
  it("lolos untuk berita valid + normalisasi slug", () => {
    const r = newsCreateSchema.safeParse({ ...VALID, slug: "Rilis-Beta" });
    assert.equal(r.success, true);
    assert.equal(r.data.slug, "rilis-beta");
  });

  it("menolak slug berformat salah, numerik murni, dan status asing", () => {
    assert.equal(
      newsCreateSchema.safeParse({ ...VALID, slug: "Rilis Beta!" }).success,
      false,
    );
    assert.equal(
      newsCreateSchema.safeParse({ ...VALID, slug: "123" }).success,
      false,
    );
    assert.equal(
      newsCreateSchema.safeParse({ ...VALID, status: "arsip" }).success,
      false,
    );
  });

  it("menolak body kosong dan sampul http", () => {
    assert.equal(
      newsCreateSchema.safeParse({ ...VALID, body: "  " }).success,
      false,
    );
    assert.equal(
      newsCreateSchema.safeParse({ ...VALID, coverUrl: "http://c.id/a.webp" })
        .success,
      false,
    );
  });
});

describe("newsUpdateSchema", () => {
  it("minimal satu kolom dan validasi slug saat diubah", () => {
    assert.equal(newsUpdateSchema.safeParse({}).success, false);
    assert.equal(
      newsUpdateSchema.safeParse({ status: "published" }).success,
      true,
    );
    assert.equal(
      newsUpdateSchema.safeParse({ slug: "SALAH FORMAT" }).success,
      false,
    );
  });
});
