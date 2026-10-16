import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { isExternalUrl, externalLinkProps } = await import("./external-link.ts");

describe("externalLinkProps (E7-6: EI-07 tautan keluar tab baru)", () => {
  it("menambahkan target=_blank dan rel=noopener noreferrer untuk https/http", () => {
    assert.deepEqual(externalLinkProps("https://store.steampowered.com"), {
      target: "_blank",
      rel: "noopener noreferrer",
    });
    assert.deepEqual(externalLinkProps("http://example.com"), {
      target: "_blank",
      rel: "noopener noreferrer",
    });
    assert.deepEqual(externalLinkProps("//cdn.example.com"), {
      target: "_blank",
      rel: "noopener noreferrer",
    });
  });

  it("kosong untuk tautan internal (anchor, path lokal, kosong)", () => {
    assert.deepEqual(externalLinkProps("#unduh"), {});
    assert.deepEqual(externalLinkProps("/tentang"), {});
    assert.deepEqual(externalLinkProps(""), {});
    assert.deepEqual(externalLinkProps(null), {});
    assert.deepEqual(externalLinkProps(undefined), {});
  });

  it("isExternalUrl mendeteksi protokol dengan tepat", () => {
    assert.equal(isExternalUrl("https://baren.game"), true);
    assert.equal(isExternalUrl("http://baren.game"), true);
    assert.equal(isExternalUrl("#kontak"), false);
    assert.equal(isExternalUrl("/media/hero.mp4"), false);
  });
});
