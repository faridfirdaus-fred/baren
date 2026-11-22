import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { resolvePublicAssetUrl } from "./assets-url.ts";

describe("resolvePublicAssetUrl", () => {
  it("mengembalikan null untuk input kosong / null / undefined", () => {
    assert.equal(resolvePublicAssetUrl(null), null);
    assert.equal(resolvePublicAssetUrl(undefined), null);
    assert.equal(resolvePublicAssetUrl(""), null);
    assert.equal(resolvePublicAssetUrl("   "), null);
  });

  it("mengubah URL pub-xxx.r2.dev menjadi /api/assets/...", () => {
    const input =
      "https://pub-f330816cf497437ba8aa9a6b803e3083.r2.dev/assets/ikon/2026/11/abc.webp";
    const expected = "/api/assets/assets/ikon/2026/11/abc.webp";
    assert.equal(resolvePublicAssetUrl(input), expected);
  });

  it("mengubah key assets/... langsung menjadi /api/assets/assets/...", () => {
    const input = "assets/ikon/2026/11/abc.webp";
    const expected = "/api/assets/assets/ikon/2026/11/abc.webp";
    assert.equal(resolvePublicAssetUrl(input), expected);
  });

  it("mempertahankan URL lokal atau rute yang sudah mengarah ke /api/assets", () => {
    const input = "/api/assets/assets/ikon/2026/11/abc.webp";
    assert.equal(resolvePublicAssetUrl(input), input);
  });

  it("mempertahankan URL gambar eksternal lain seperti googleusercontent atau placeholder", () => {
    const googlePhoto = "https://lh3.googleusercontent.com/a/ACg8ocI...=s96-c";
    assert.equal(resolvePublicAssetUrl(googlePhoto), googlePhoto);

    const placeholder = "/art/placeholder-feature.jpg";
    assert.equal(resolvePublicAssetUrl(placeholder), placeholder);
  });
});
