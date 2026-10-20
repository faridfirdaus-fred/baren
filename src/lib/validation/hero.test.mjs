import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { heroUpdateSchema, bannerCreateSchema, bannerUpdateSchema } =
  await import("./hero.ts");

describe("heroUpdateSchema", () => {
  it("lolos untuk hero lengkap yang valid", () => {
    const r = heroUpdateSchema.safeParse({
      title: "BAREN",
      subtitle: "Rebut benteng",
      backgroundUrl: "https://contoh.id/bg.webp",
      primaryCtaLabel: "Main Sekarang",
      primaryCtaUrl: "https://contoh.id/main",
      isPublished: true,
    });
    assert.equal(r.success, true);
  });

  it("menolak judul kosong, URL http, dan key asing", () => {
    const kosong = heroUpdateSchema.safeParse({ title: "  " });
    assert.equal(kosong.success, false);

    const http = heroUpdateSchema.safeParse({
      title: "BAREN",
      primaryCtaUrl: "http://contoh.id/main",
    });
    assert.equal(http.success, false);
    assert.ok(
      http.error.issues.some((i) => i.path.join(".") === "primaryCtaUrl"),
    );

    const asing = heroUpdateSchema.safeParse({ title: "BAREN", foo: 1 });
    assert.equal(asing.success, false);
  });

  it("menerima anchor internal valid dan menolak anchor kosong (#)", () => {
    const validAnchor = heroUpdateSchema.safeParse({
      title: "BAREN",
      primaryCtaUrl: "#wishlist",
      secondaryCtaUrl: "#unduh",
    });
    assert.equal(validAnchor.success, true);

    const emptyAnchor = heroUpdateSchema.safeParse({
      title: "BAREN",
      primaryCtaUrl: "#",
    });
    assert.equal(emptyAnchor.success, false);
  });
});

describe("bannerCreateSchema/bannerUpdateSchema", () => {
  it("create wajib imageUrl https", () => {
    assert.equal(
      bannerCreateSchema.safeParse({ imageUrl: "https://c.id/a.webp" }).success,
      true,
    );
    assert.equal(bannerCreateSchema.safeParse({}).success, false);
    assert.equal(
      bannerCreateSchema.safeParse({ imageUrl: "http://c.id/a.webp" }).success,
      false,
    );
  });

  it("update minimal satu kolom dan menolak sortOrder negatif", () => {
    assert.equal(bannerUpdateSchema.safeParse({}).success, false);
    assert.equal(
      bannerUpdateSchema.safeParse({ sortOrder: -1 }).success,
      false,
    );
    assert.equal(bannerUpdateSchema.safeParse({ sortOrder: 2 }).success, true);
  });
});
