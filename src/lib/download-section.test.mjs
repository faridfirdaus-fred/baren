import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

describe("DownloadSection Steam-only (E14-4)", () => {
  const content = readFileSync(
    "src/components/site/download-section.tsx",
    "utf8",
  );

  it("tidak mengandung teks DISTRIBUSI", () => {
    assert.doesNotMatch(content, /DISTRIBUSI/);
  });

  it("hanya menampilkan kartu Steam dengan status Segera Hadir", () => {
    assert.match(content, /Steam/);
    assert.match(content, /Segera Hadir/);
  });

  it("tidak mengandung Play Store atau App Store", () => {
    assert.doesNotMatch(content, /Play Store/i);
    assert.doesNotMatch(content, /App Store/i);
  });

  it("memiliki tombol Gabung Wishlist menuju #daftar", () => {
    assert.match(content, /href=["']#daftar["']/);
    assert.match(content, /Gabung Wishlist/);
  });

  it("tidak lagi mengimpor getDownloadItems", () => {
    assert.doesNotMatch(content, /getDownloadItems/);
  });
});
