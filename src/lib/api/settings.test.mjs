import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { readSettings, writeSettings } = await import("./settings.ts");

const emptyLandingCopy = {
  featuresEyebrow: null,
  featuresTitle: null,
  featuresEmptyMessage: null,
  howToPlayTitle: null,
  galleryEyebrow: null,
  galleryTitle: null,
  galleryDescription: null,
  galleryEmptyTitle: null,
  galleryEmptyMessage: null,
  newsTitle: null,
  newsCtaLabel: null,
  faqEyebrow: null,
  faqTitle: null,
  commentsTitle: null,
  commentsLoginPrompt: null,
  commentsEmptyMessage: null,
  commentsSubmitLabel: null,
  commentsSubmitError: null,
  contactEyebrow: null,
  contactTitle: null,
  contactDescription: null,
  contactEmailLabel: null,
  contactSocialTitle: null,
  contactSocialEmptyMessage: null,
};

function fakeDb(awal = {}) {
  const map = new Map(Object.entries(awal));
  return {
    calls: [],
    async list() {
      return [...map.entries()].map(([key, value]) => ({ key, value }));
    },
    async upsert(key, value) {
      this.calls.push([key, value]);
      map.set(key, value);
    },
  };
}

describe("readSettings", () => {
  it("memetakan baris key/value ke branding camelCase, hilang menjadi null", async () => {
    const db = fakeDb({ nama_game: "BAREN", email_kontak: "a@b.id" });
    assert.deepEqual(await readSettings(db), {
      namaGame: "BAREN",
      tagline: null,
      logoUrl: null,
      faviconUrl: null,
      emailKontak: "a@b.id",
      ...emptyLandingCopy,
    });
  });

  it("mengabaikan key yang tidak dikenal", async () => {
    const db = fakeDb({ nama_game: "BAREN", kunci_asing: "x" });
    const r = await readSettings(db);
    assert.equal(r.namaGame, "BAREN");
    assert.ok(!("kunciAsing" in r));
  });

  it("memetakan copy landing dan menjadikan key yang hilang null", async () => {
    const db = fakeDb({
      features_eyebrow: "Fitur",
      gallery_empty_message: "Belum ada galeri.",
      contact_social_title: "Ikuti kami",
    });
    const r = await readSettings(db);
    assert.equal(r.featuresEyebrow, "Fitur");
    assert.equal(r.galleryEmptyMessage, "Belum ada galeri.");
    assert.equal(r.contactSocialTitle, "Ikuti kami");
    assert.equal(r.featuresTitle, null);
    assert.equal(r.commentsSubmitError, null);
  });
});

describe("writeSettings", () => {
  it("upsert hanya kolom yang diberikan lalu membaca ulang", async () => {
    const db = fakeDb({ nama_game: "Lama" });
    const r = await writeSettings(db, { namaGame: "Baru", tagline: null });
    assert.deepEqual(db.calls, [
      ["nama_game", "Baru"],
      ["tagline", null],
    ]);
    assert.deepEqual(r, {
      namaGame: "Baru",
      tagline: null,
      logoUrl: null,
      faviconUrl: null,
      emailKontak: null,
      ...emptyLandingCopy,
    });
  });

  it("melewatkan kolom undefined", async () => {
    const db = fakeDb({});
    await writeSettings(db, { tagline: undefined });
    assert.deepEqual(db.calls, []);
  });

  it("upsert hanya copy landing yang diberikan", async () => {
    const db = fakeDb({});
    await writeSettings(db, {
      featuresTitle: "Pilih peranmu",
      galleryEmptyMessage: null,
      contactDescription: "Hubungi tim BAREN.",
    });
    assert.deepEqual(db.calls, [
      ["features_title", "Pilih peranmu"],
      ["gallery_empty_message", null],
      ["contact_description", "Hubungi tim BAREN."],
    ]);
  });
});
