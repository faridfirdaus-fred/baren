import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { galleryCreateSchema, galleryUpdateSchema } =
  await import("./gallery.ts");

describe("galleryCreateSchema", () => {
  it("lolos untuk kind valid + fileUrl https", () => {
    assert.equal(
      galleryCreateSchema.safeParse({
        kind: "screenshot",
        fileUrl: "https://pub.r2.dev/assets/a.webp",
      }).success,
      true,
    );
  });

  it("menolak kind asing, URL http, dan key asing", () => {
    assert.equal(
      galleryCreateSchema.safeParse({
        kind: "audio",
        fileUrl: "https://c.id/a.mp3",
      }).success,
      false,
    );
    assert.equal(
      galleryCreateSchema.safeParse({
        kind: "video",
        fileUrl: "http://c.id/v.mp4",
      }).success,
      false,
    );
    assert.equal(
      galleryCreateSchema.safeParse({
        kind: "image",
        fileUrl: "https://c.id/a.webp",
        foo: 1,
      }).success,
      false,
    );
  });
});

describe("galleryUpdateSchema", () => {
  it("minimal satu kolom dan validasi kind", () => {
    assert.equal(galleryUpdateSchema.safeParse({}).success, false);
    assert.equal(galleryUpdateSchema.safeParse({ sortOrder: 3 }).success, true);
    assert.equal(
      galleryUpdateSchema.safeParse({ kind: "audio" }).success,
      false,
    );
  });
});
