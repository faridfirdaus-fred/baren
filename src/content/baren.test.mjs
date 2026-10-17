import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { cta, nav } = await import("./baren.ts");

describe("copy wishlist E11-4", () => {
  it("CTA memakai istilah wishlist", () => {
    assert.match(cta.joinWishlist, /wishlist/i);
    assert.doesNotMatch(cta.joinWishlist, /waiting list/i);
  });

  it("nav tanpa Esports dan Lebih Banyak", () => {
    const labels = nav.map((n) => n.label);
    assert.ok(!labels.includes("ESPORTS"));
    assert.ok(!labels.includes("LEBIH BANYAK"));
  });
});
