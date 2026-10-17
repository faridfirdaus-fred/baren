import { describe, it } from "node:test";
import assert from "node:assert/strict";

const {
  compressPresetFor,
  isCompressibleMime,
  normalizeCompressPurpose,
  scaledDimensions,
  shouldUseCompressed,
  webpFileName,
} = await import("./assets-compress-core.ts");

describe("isCompressibleMime", () => {
  it("jpeg/png/webp true; svg/mp4/gif false", () => {
    assert.equal(isCompressibleMime("image/jpeg"), true);
    assert.equal(isCompressibleMime("image/png"), true);
    assert.equal(isCompressibleMime("image/webp"), true);
    assert.equal(isCompressibleMime("image/svg+xml"), false);
    assert.equal(isCompressibleMime("video/mp4"), false);
    assert.equal(isCompressibleMime("image/gif"), false);
  });
});

describe("normalizeCompressPurpose", () => {
  it("normalisasi case/spasi; tak dikenal null", () => {
    assert.equal(normalizeCompressPurpose(" Hero "), "hero");
    assert.equal(normalizeCompressPurpose("NEWS"), "news");
    assert.equal(normalizeCompressPurpose("banner"), null);
  });
});

describe("compressPresetFor", () => {
  it("hero/gallery 1920 q0.8; news 1200 q0.75; logo 512 q0.85", () => {
    assert.deepEqual(compressPresetFor("hero", "image/jpeg"), {
      maxSide: 1920,
      quality: 0.8,
      mimeType: "image/webp",
    });
    assert.deepEqual(compressPresetFor("gallery", "image/png"), {
      maxSide: 1920,
      quality: 0.8,
      mimeType: "image/webp",
    });
    assert.deepEqual(compressPresetFor("news", "image/webp"), {
      maxSide: 1200,
      quality: 0.75,
      mimeType: "image/webp",
    });
    assert.deepEqual(compressPresetFor("logo", "image/png"), {
      maxSide: 512,
      quality: 0.85,
      mimeType: "image/webp",
    });
  });
  it("skip: svg, video, favicon, purpose tak dikenal", () => {
    assert.equal(compressPresetFor("gallery", "image/svg+xml"), null);
    assert.equal(compressPresetFor("hero", "video/mp4"), null);
    assert.equal(compressPresetFor("favicon", "image/png"), null);
    assert.equal(compressPresetFor("banner", "image/jpeg"), null);
  });
});

describe("scaledDimensions", () => {
  it("tanpa upscale bila sudah kecil", () => {
    assert.deepEqual(scaledDimensions(800, 600, 1920), {
      width: 800,
      height: 600,
    });
  });
  it("skala sisi terpanjang + jaga rasio", () => {
    assert.deepEqual(scaledDimensions(4000, 3000, 1920), {
      width: 1920,
      height: 1440,
    });
    assert.deepEqual(scaledDimensions(1000, 3000, 1200), {
      width: 400,
      height: 1200,
    });
  });
  it("input invalid -> 1x1 aman", () => {
    assert.deepEqual(scaledDimensions(0, 10, 1920), { width: 1, height: 1 });
  });
});

describe("webpFileName", () => {
  it("ganti ekstensi jadi .webp", () => {
    assert.equal(webpFileName("foto.JPG"), "foto.webp");
    assert.equal(webpFileName("tanpa-ekstensi"), "tanpa-ekstensi.webp");
  });
});

describe("shouldUseCompressed", () => {
  it("pakai bila lebih kecil; tolak bila >= asli atau 0", () => {
    assert.equal(shouldUseCompressed(1000, 400), true);
    assert.equal(shouldUseCompressed(1000, 1000), false);
    assert.equal(shouldUseCompressed(1000, 1500), false);
    assert.equal(shouldUseCompressed(1000, 0), false);
  });
});
