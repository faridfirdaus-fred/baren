import { describe, it } from "node:test";
import assert from "node:assert/strict";

const {
  socialCreateSchema,
  socialUpdateSchema,
  downloadCreateSchema,
  downloadUpdateSchema,
} = await import("./links.ts");

describe("socialCreateSchema", () => {
  it("wajib platform + URL https", () => {
    assert.equal(
      socialCreateSchema.safeParse({
        platform: "Instagram",
        url: "https://instagram.com/baren",
      }).success,
      true,
    );
    assert.equal(
      socialCreateSchema.safeParse({
        platform: "Instagram",
        url: "http://instagram.com/baren",
      }).success,
      false,
    );
    assert.equal(socialCreateSchema.safeParse({}).success, false);
  });
});

describe("socialUpdateSchema/downloadUpdateSchema", () => {
  it("minimal satu kolom, termasuk sortOrder", () => {
    assert.equal(socialUpdateSchema.safeParse({}).success, false);
    assert.equal(
      socialUpdateSchema.safeParse({ url: "https://x.id/a" }).success,
      true,
    );
    assert.equal(socialUpdateSchema.safeParse({ sortOrder: 2 }).success, true);
    assert.equal(downloadUpdateSchema.safeParse({}).success, false);
  });
});

describe("downloadCreateSchema", () => {
  it("wajib platform + label + URL https", () => {
    assert.equal(
      downloadCreateSchema.safeParse({
        platform: "Steam",
        label: "Unduh di Steam",
        url: "https://store.steampowered.com/app/1",
      }).success,
      true,
    );
    assert.equal(
      downloadCreateSchema.safeParse({
        platform: "Steam",
        url: "https://store.steampowered.com/app/1",
      }).success,
      false,
    );
  });
});
