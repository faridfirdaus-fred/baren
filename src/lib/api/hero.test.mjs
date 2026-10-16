import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { readPublicHero, readPublicHome, writeHero } = await import("./hero.ts");

function heroStore(baris = null) {
  let row = baris;
  return {
    async get() {
      return row;
    },
    async save(input) {
      row = { id: 1, ...input, isPublished: input.isPublished ? 1 : 0 };
      return row;
    },
  };
}

const TERBIT = {
  id: 1,
  title: "BAREN",
  subtitle: null,
  backgroundUrl: null,
  videoUrl: null,
  primaryCtaLabel: null,
  primaryCtaUrl: null,
  secondaryCtaLabel: null,
  secondaryCtaUrl: null,
  isPublished: 1,
};

describe("readPublicHero", () => {
  it("null bila belum ada hero atau masih draf", async () => {
    assert.deepEqual(await readPublicHero(heroStore(null)), { hero: null });
    assert.deepEqual(
      await readPublicHero(heroStore({ ...TERBIT, isPublished: 0 })),
      { hero: null },
    );
  });

  it("menyembunyikan flag isPublished saat terbit", async () => {
    const r = await readPublicHero(heroStore(TERBIT));
    assert.equal(r.hero.title, "BAREN");
    assert.ok(!("isPublished" in r.hero));
  });
});

describe("readPublicHome", () => {
  it("mengurutkan banner deterministik (sortOrder lalu id)", async () => {
    const banners = {
      async list() {
        return [
          { id: 2, imageUrl: "b", sortOrder: 0 },
          { id: 1, imageUrl: "a", sortOrder: 0 },
          { id: 3, imageUrl: "c", sortOrder: 1 },
        ];
      },
    };
    const r = await readPublicHome(heroStore(TERBIT), banners);
    assert.deepEqual(
      r.banners.map((b) => b.id),
      [1, 2, 3],
    );
  });
});

describe("writeHero", () => {
  it("menyimpan dan mengembalikan tanpa flag internal", async () => {
    const r = await writeHero(heroStore(null), {
      title: "Baru",
      isPublished: true,
    });
    assert.equal(r.title, "Baru");
    assert.ok(!("isPublished" in r));
  });
});
