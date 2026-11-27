import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseNewsBody, serializeNewsBody } from "./news-gallery.ts";

describe("news-gallery (E19-5)", () => {
  it("mempertahankan artikel teks biasa tanpa foto galeri", () => {
    const text =
      "Serunya turnamen BAREN di CKG!\n\nRatusan pengunjung mencoba mode 2 vs 2.";
    const parsed = parseNewsBody(text);
    assert.equal(parsed.story, text);
    assert.deepEqual(parsed.galleryUrls, []);
    assert.equal(serializeNewsBody(parsed.story, parsed.galleryUrls), text);
  });

  it("menyimpan dan membaca teks beserta banyak foto dokumentasi event", () => {
    const urls = [
      "/art/event-art.jpg",
      "/art/event-booth-setup.jpg",
      "https://cdn.baren.game/event-1.webp",
    ];
    const serialized = serializeNewsBody("Dokumentasi booth CKG 2026.", urls);
    const parsed = parseNewsBody(serialized);
    assert.equal(parsed.story, "Dokumentasi booth CKG 2026.");
    assert.deepEqual(parsed.galleryUrls, urls);
  });

  it("mendukung artikel foto event murni meskipun teks cerita kosong", () => {
    const urls = ["/art/event-art.jpg", "/art/event-players.jpg"];
    const serialized = serializeNewsBody("   ", urls);
    assert.ok(
      serialized.length > 0,
      "body tetap terisi agar lolos validasi min(1)",
    );
    const parsed = parseNewsBody(serialized);
    assert.equal(parsed.story, "");
    assert.deepEqual(parsed.galleryUrls, urls);
  });

  it("menolak skema berbahaya seperti javascript: dari galeri", () => {
    const serialized = serializeNewsBody("Aman", [
      "javascript:alert(1)",
      "/art/event-art.jpg",
    ]);
    const parsed = parseNewsBody(serialized);
    assert.deepEqual(parsed.galleryUrls, ["/art/event-art.jpg"]);
  });
});
