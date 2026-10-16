import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { readLandingCards } = await import("./landing-cards.ts");

function card(over) {
  return {
    id: 1,
    slot: "general",
    eyebrow: null,
    title: "Kartu",
    subtitle: null,
    body: null,
    imageUrl: null,
    ctaLabel: null,
    ctaUrl: null,
    tone: "dark",
    sortOrder: 0,
    isPublished: 1,
    ...over,
  };
}

describe("readLandingCards", () => {
  it("menyaring draf dan mengurutkan sortOrder lalu id", async () => {
    const rows = await readLandingCards({
      list: async () => [
        card({ id: 3, sortOrder: 0 }),
        card({ id: 1, sortOrder: 1 }),
        card({ id: 2, sortOrder: 0, isPublished: 0 }),
        card({ id: 4, sortOrder: 0 }),
      ],
    });
    assert.deepEqual(
      rows.map((r) => r.id),
      [3, 4, 1],
    );
  });

  it("daftar kosong menghasilkan array kosong", async () => {
    assert.deepEqual(await readLandingCards({ list: async () => [] }), []);
  });
});
