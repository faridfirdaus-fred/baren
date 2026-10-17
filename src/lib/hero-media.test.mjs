import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { isValidMediaUrl } = await import("./hero-media.ts");

describe("isValidMediaUrl", () => {
  it("memvalidasi URL admin https dan path lokal", () => {
    assert.equal(isValidMediaUrl("https://cdn.id/hero.mp4"), true);
    assert.equal(isValidMediaUrl("/media/kustom.mp4"), true);
  });

  it("menolak kosong, http, dan skema asing", () => {
    assert.equal(isValidMediaUrl(null), false);
    assert.equal(isValidMediaUrl(undefined), false);
    assert.equal(isValidMediaUrl("  "), false);
    assert.equal(isValidMediaUrl("http://cdn.id/hero.mp4"), false);
    assert.equal(isValidMediaUrl("javascript:alert(1)"), false);
  });
});
