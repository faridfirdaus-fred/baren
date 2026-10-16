import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { settingsUpdateSchema } = await import("./settings.ts");

describe("settingsUpdateSchema", () => {
  it("lolos untuk pembaruan parsial yang valid", () => {
    const r = settingsUpdateSchema.safeParse({
      namaGame: "BAREN",
      emailKontak: "Halo@Contoh.id",
    });
    assert.equal(r.success, true);
  });

  it("menolak objek kosong (minimal satu kolom)", () => {
    const r = settingsUpdateSchema.safeParse({});
    assert.equal(r.success, false);
    assert.deepEqual(r.error.issues[0].path, []);
  });

  it("menolak nama game kosong dan email tidak valid", () => {
    const r = settingsUpdateSchema.safeParse({
      namaGame: "   ",
      emailKontak: "bukan-email",
    });
    assert.equal(r.success, false);
    const paths = r.error.issues.map((i) => i.path.join("."));
    assert.ok(paths.includes("namaGame"));
    assert.ok(paths.includes("emailKontak"));
  });

  it("menolak URL http (wajib https) dan URL terlalu panjang", () => {
    const r = settingsUpdateSchema.safeParse({
      logoUrl: "http://contoh.id/logo.png",
    });
    assert.equal(r.success, false);
    assert.ok(
      r.error.issues[0].message.includes("https://"),
      `pesan tak terduga: ${r.error.issues[0].message}`,
    );

    const panjang = `https://contoh.id/${"a".repeat(2048)}`;
    const r2 = settingsUpdateSchema.safeParse({ faviconUrl: panjang });
    assert.equal(r2.success, false);
  });

  it("string kosong dianggap null (mengosongkan kolom)", () => {
    const r = settingsUpdateSchema.safeParse({ tagline: "", logoUrl: "" });
    assert.equal(r.success, true);
    assert.deepEqual(r.data, { tagline: null, logoUrl: null });
  });

  it("string kosong pada email kontak juga mengosongkan, bukan error", () => {
    const r = settingsUpdateSchema.safeParse({ emailKontak: "" });
    assert.equal(r.success, true);
    assert.deepEqual(r.data, { emailKontak: null });
  });

  it("menolak field ekstra yang tidak dikenal (typo terdeteksi)", () => {
    const r = settingsUpdateSchema.safeParse({
      namaGame: "BAREN",
      role: "admin",
    });
    assert.equal(r.success, false);
    assert.ok(
      JSON.stringify(r.error.issues).includes("role"),
      `key asing harus disebut di pesan: ${JSON.stringify(r.error.issues)}`,
    );
  });

  it("menolak tipe salah (angka untuk nama game)", () => {
    const r = settingsUpdateSchema.safeParse({ namaGame: 123 });
    assert.equal(r.success, false);
  });
});
