import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { normalizeNewsTiming, readNewsPage } = await import("./news.ts");

describe("normalizeNewsTiming", () => {
  it("draf selalu publishedAt null", () => {
    assert.deepEqual(
      normalizeNewsTiming(
        { status: "draft", publishedAt: "2026-01-01T00:00:00Z" },
        "2026-10-16T00:00:00Z",
      ),
      { status: "draft", publishedAt: null },
    );
  });

  it("terbit tanpa tanggal memakai kini; dengan tanggal dipertahankan", () => {
    assert.deepEqual(
      normalizeNewsTiming({ status: "published" }, "2026-10-16T00:00:00Z"),
      { status: "published", publishedAt: "2026-10-16T00:00:00Z" },
    );
    assert.deepEqual(
      normalizeNewsTiming(
        { status: "published", publishedAt: "2026-01-01T00:00:00Z" },
        "2026-10-16T00:00:00Z",
      ),
      { status: "published", publishedAt: "2026-01-01T00:00:00Z" },
    );
  });

  it("default status draf", () => {
    assert.deepEqual(normalizeNewsTiming({}, "2026-10-16T00:00:00Z"), {
      status: "draft",
      publishedAt: null,
    });
  });
});

describe("readNewsPage", () => {
  it("membuang body dan menghitung totalPages", async () => {
    const store = {
      async listPublished() {
        return {
          items: [
            {
              id: 1,
              slug: "a",
              title: "A",
              excerpt: null,
              body: "PANJANG",
              coverUrl: null,
              status: "published",
              publishedAt: "2026-10-16T00:00:00Z",
              createdAt: "2026-10-16T00:00:00Z",
              updatedAt: "2026-10-16T00:00:00Z",
            },
          ],
          total: 10,
        };
      },
    };
    const r = await readNewsPage(store, 1, 9);
    assert.equal(r.items[0].body, undefined);
    assert.ok(!("body" in r.items[0]));
    assert.deepEqual(
      {
        page: r.page,
        perPage: r.perPage,
        total: r.total,
        totalPages: r.totalPages,
      },
      { page: 1, perPage: 9, total: 10, totalPages: 2 },
    );
  });
});
