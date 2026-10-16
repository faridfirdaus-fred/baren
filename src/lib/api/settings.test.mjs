import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { readSettings, writeSettings } = await import("./settings.ts");

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
    });
  });

  it("mengabaikan key yang tidak dikenal", async () => {
    const db = fakeDb({ nama_game: "BAREN", kunci_asing: "x" });
    const r = await readSettings(db);
    assert.equal(r.namaGame, "BAREN");
    assert.ok(!("kunciAsing" in r));
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
    });
  });

  it("melewatkan kolom undefined", async () => {
    const db = fakeDb({});
    await writeSettings(db, { namaGame: "BAREN" });
    assert.deepEqual(db.calls, [["nama_game", "BAREN"]]);
  });
});
