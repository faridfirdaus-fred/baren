import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { checkCommentRateLimit, readComments } = await import("./comments.ts");

function row(over) {
  return {
    id: 1,
    name: "Ayu",
    photoUrl: null,
    body: "Seru!",
    createdAt: "2026-10-17T00:00:00.000Z",
    ...over,
  };
}

describe("readComments", () => {
  it("terbaru dulu dan mendukung cursor", async () => {
    const rows = await readComments(
      {
        list: async () => [row({ id: 1 }), row({ id: 3 }), row({ id: 2 })],
      },
      { limit: 2, cursor: null },
    );
    assert.deepEqual(
      rows.map((r) => r.id),
      [3, 2],
    );
    const next = await readComments(
      {
        list: async () => [row({ id: 1 }), row({ id: 3 }), row({ id: 2 })],
      },
      { limit: 10, cursor: 2 },
    );
    assert.deepEqual(
      next.map((r) => r.id),
      [1],
    );
  });
});

describe("checkCommentRateLimit", () => {
  it("menolak kiriman ke-6 dalam 10 menit", () => {
    const now = Date.now();
    const stamps = [0, 1, 2, 3, 4].map((m) => now - m * 60_000);
    assert.equal(checkCommentRateLimit(stamps, now), false);
    assert.equal(checkCommentRateLimit(stamps.slice(1), now), true);
    assert.equal(checkCommentRateLimit([], now), true);
  });
});
