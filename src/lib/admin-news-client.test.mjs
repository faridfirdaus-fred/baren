import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { parseAdminNewsList, slugifyTitle } =
  await import("./admin-news-client.ts");

const news = {
  id: 1,
  slug: "berita-uji",
  title: "Berita Uji",
  excerpt: null,
  body: "Isi berita.",
  coverUrl: null,
  status: "draft",
  publishedAt: null,
  createdAt: "2026-10-20T00:00:00.000Z",
  updatedAt: "2026-10-20T00:00:00.000Z",
};

describe("parseAdminNewsList", () => {
  it("menerima array berita admin", () => {
    const result = parseAdminNewsList({ ok: true, data: [news] });
    assert.equal(result.ok, true);
    assert.deepEqual(result.ok ? result.data : [], [news]);
  });

  it("menolak objek halaman publik agar tidak memicu items.map", () => {
    assert.deepEqual(
      parseAdminNewsList({ ok: true, data: { items: [news], page: 1 } }),
      { ok: false, message: "Respons server tidak valid." },
    );
  });

  it("meneruskan error API", () => {
    assert.deepEqual(
      parseAdminNewsList({ ok: false, error: { message: "Dilarang" } }),
      { ok: false, message: "Dilarang", code: undefined, fields: undefined },
    );
  });
});

describe("slugifyTitle", () => {
  it("menormalkan spasi, tanda baca, dan diakritik", () => {
    assert.equal(slugifyTitle("  Rébut! Benteng  "), "rebut-benteng");
  });

  it("menambah prefiks pada slug angka dan menolak judul kosong", () => {
    assert.equal(slugifyTitle("2026"), "berita-2026");
    assert.equal(slugifyTitle("!!!"), "");
  });

  it("membatasi panjang maksimal 160", () => {
    assert.equal(slugifyTitle("a".repeat(200)).length, 160);
  });
});
