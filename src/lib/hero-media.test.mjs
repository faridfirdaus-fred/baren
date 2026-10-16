import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { HERO_POSTER_FALLBACK, HERO_VIDEO_FALLBACK, pickHeroMedia } =
  await import("./hero-media.ts");

describe("pickHeroMedia", () => {
  it("memakai URL admin https dan path lokal", () => {
    assert.equal(
      pickHeroMedia("https://cdn.id/hero.mp4", HERO_VIDEO_FALLBACK),
      "https://cdn.id/hero.mp4",
    );
    assert.equal(
      pickHeroMedia("/media/kustom.mp4", HERO_VIDEO_FALLBACK),
      "/media/kustom.mp4",
    );
  });

  it("fallback untuk kosong, http, dan skema asing", () => {
    assert.equal(pickHeroMedia(null, HERO_VIDEO_FALLBACK), HERO_VIDEO_FALLBACK);
    assert.equal(
      pickHeroMedia("  ", HERO_POSTER_FALLBACK),
      HERO_POSTER_FALLBACK,
    );
    assert.equal(
      pickHeroMedia("http://cdn.id/hero.mp4", HERO_VIDEO_FALLBACK),
      HERO_VIDEO_FALLBACK,
    );
    assert.equal(
      pickHeroMedia("javascript:alert(1)", HERO_POSTER_FALLBACK),
      HERO_POSTER_FALLBACK,
    );
  });
});
