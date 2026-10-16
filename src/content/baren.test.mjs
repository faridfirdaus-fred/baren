import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { cta, faqs, nav } = await import("./baren.ts");

describe("copy wishlist E11-4", () => {
  it("CTA memakai istilah wishlist", () => {
    assert.match(cta.joinWaitlist, /wishlist/i);
    assert.doesNotMatch(cta.joinWaitlist, /waiting list/i);
  });

  it("FAQ tidak lagi menyebut waiting list", () => {
    for (const f of faqs) {
      assert.doesNotMatch(f.question, /waiting list/i);
      assert.doesNotMatch(f.answer, /waiting list/i);
    }
  });

  it("nav tanpa Esports dan Lebih Banyak", () => {
    const labels = nav.map((n) => n.label);
    assert.ok(!labels.includes("ESPORTS"));
    assert.ok(!labels.includes("LEBIH BANYAK"));
  });
});
