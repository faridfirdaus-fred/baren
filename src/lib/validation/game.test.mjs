import { describe, it } from "node:test";
import assert from "node:assert/strict";

const {
  aboutUpdateSchema,
  featureCreateSchema,
  featureUpdateSchema,
  stepCreateSchema,
  stepUpdateSchema,
  videoUpdateSchema,
} = await import("./game.ts");

describe("aboutUpdateSchema", () => {
  it("lolos valid dan menolak body kosong serta URL http", () => {
    assert.equal(
      aboutUpdateSchema.safeParse({ title: "Tentang", body: "Isi" }).success,
      true,
    );
    assert.equal(
      aboutUpdateSchema.safeParse({ title: "T", body: "  " }).success,
      false,
    );
    assert.equal(
      aboutUpdateSchema.safeParse({
        title: "T",
        body: "B",
        imageUrl: "http://c.id/a.webp",
      }).success,
      false,
    );
  });
});

describe("featureCreateSchema/featureUpdateSchema", () => {
  it("create wajib judul; update minimal satu kolom", () => {
    assert.equal(
      featureCreateSchema.safeParse({ title: "Koop" }).success,
      true,
    );
    assert.equal(featureCreateSchema.safeParse({}).success, false);
    assert.equal(featureUpdateSchema.safeParse({}).success, false);
    assert.equal(featureUpdateSchema.safeParse({ sortOrder: 1 }).success, true);
  });
});

describe("stepCreateSchema/stepUpdateSchema", () => {
  it("create wajib step >= 1 dan judul", () => {
    assert.equal(
      stepCreateSchema.safeParse({ step: 1, title: "Daftar" }).success,
      true,
    );
    assert.equal(
      stepCreateSchema.safeParse({ step: 0, title: "Daftar" }).success,
      false,
    );
  });

  it("update menolak kosong dan media http", () => {
    assert.equal(stepUpdateSchema.safeParse({}).success, false);
    assert.equal(
      stepUpdateSchema.safeParse({ mediaUrl: "http://c.id/v.mp4" }).success,
      false,
    );
  });
});

describe("videoUpdateSchema", () => {
  it("wajib URL video https", () => {
    assert.equal(
      videoUpdateSchema.safeParse({ videoUrl: "https://c.id/d.mp4" }).success,
      true,
    );
    assert.equal(videoUpdateSchema.safeParse({}).success, false);
    assert.equal(
      videoUpdateSchema.safeParse({ videoUrl: "http://c.id/d.mp4" }).success,
      false,
    );
  });
});
