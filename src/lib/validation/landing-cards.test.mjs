import { describe, it } from "node:test";
import assert from "node:assert/strict";

const {
  landingCardCreateSchema,
  landingCardReorderSchema,
  landingCardUpdateSchema,
} = await import("./landing-cards.ts");

describe("landingCardCreateSchema", () => {
  it("lolos untuk kartu lengkap yang valid", () => {
    const r = landingCardCreateSchema.safeParse({
      slot: "event",
      eyebrow: "TURNAMEN",
      title: "TURNAMEN BENTENG NUSANTARA",
      subtitle: "Taklukan batas",
      body: "Saksikan tim terbaik.",
      imageUrl: "https://contoh.id/event.webp",
      ctaLabel: "TONTON SEKARANG",
      ctaUrl: "https://contoh.id/tonton",
      tone: "dark",
    });
    assert.equal(r.success, true);
  });

  it("lolos untuk kartu teks tanpa gambar/CTA", () => {
    const r = landingCardCreateSchema.safeParse({ title: "KAMI BAREN" });
    assert.equal(r.success, true);
  });

  it("menolak ctaLabel tanpa ctaUrl dan sebaliknya", () => {
    assert.equal(
      landingCardCreateSchema.safeParse({
        title: "X",
        ctaLabel: "Main",
      }).success,
      false,
    );
    assert.equal(
      landingCardCreateSchema.safeParse({
        title: "X",
        ctaUrl: "https://contoh.id/main",
      }).success,
      false,
    );
  });

  it("menolak URL http dan tone asing", () => {
    assert.equal(
      landingCardCreateSchema.safeParse({
        title: "X",
        ctaLabel: "Main",
        ctaUrl: "http://contoh.id/main",
      }).success,
      false,
    );
    assert.equal(
      landingCardCreateSchema.safeParse({ title: "X", tone: "neon" }).success,
      false,
    );
  });
});

describe("landingCardUpdateSchema", () => {
  it("minimal satu kolom dan menolak key asing", () => {
    assert.equal(landingCardUpdateSchema.safeParse({}).success, false);
    assert.equal(
      landingCardUpdateSchema.safeParse({ sortOrder: 2 }).success,
      true,
    );
    assert.equal(landingCardUpdateSchema.safeParse({ foo: 1 }).success, false);
  });
});

describe("landingCardReorderSchema", () => {
  it("menerima daftar id dan menolak id tak valid", () => {
    assert.equal(
      landingCardReorderSchema.safeParse({ ids: [3, 1, 2] }).success,
      true,
    );
    assert.equal(
      landingCardReorderSchema.safeParse({ ids: [] }).success,
      false,
    );
    assert.equal(
      landingCardReorderSchema.safeParse({ ids: [1, -2] }).success,
      false,
    );
    assert.equal(landingCardReorderSchema.safeParse({}).success, false);
  });
});
