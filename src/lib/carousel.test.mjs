import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { shouldShowCarousel, nextIndex, prevIndex } =
  await import("./carousel.ts");

describe("shouldShowCarousel (E6-2: 0/1/2 banner)", () => {
  it("false untuk 0 dan 1 banner (tanpa kontrol geser)", () => {
    assert.equal(shouldShowCarousel(0), false);
    assert.equal(shouldShowCarousel(1), false);
  });

  it("true untuk 2 banner atau lebih", () => {
    assert.equal(shouldShowCarousel(2), true);
    assert.equal(shouldShowCarousel(5), true);
  });
});

describe("nextIndex/prevIndex (carousel + lightbox melingkar)", () => {
  it("maju dan mundur melingkar dalam batas", () => {
    assert.equal(nextIndex(0, 2), 1);
    assert.equal(nextIndex(1, 2), 0);
    assert.equal(prevIndex(0, 2), 1);
    assert.equal(prevIndex(1, 2), 0);
  });

  it("satu item selalu 0; total kosong aman (0)", () => {
    assert.equal(nextIndex(0, 1), 0);
    assert.equal(prevIndex(0, 1), 0);
    assert.equal(nextIndex(0, 0), 0);
    assert.equal(prevIndex(0, 0), 0);
  });
});
