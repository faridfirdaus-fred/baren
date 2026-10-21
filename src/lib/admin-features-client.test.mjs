import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { parseAdminFeatures } = await import("./admin-features-client.ts");

describe("parseAdminFeatures", () => {
  it("membaca daftar fitur valid dari amplop", () => {
    assert.deepEqual(
      parseAdminFeatures({
        ok: true,
        data: [
          {
            id: 1,
            title: "Deathmatch",
            description: "Mode latihan cepat",
            iconUrl: "https://example.com/ikon.png",
            sortOrder: 2,
          },
        ],
      }),
      {
        ok: true,
        data: [
          {
            id: 1,
            title: "Deathmatch",
            description: "Mode latihan cepat",
            iconUrl: "https://example.com/ikon.png",
            sortOrder: 2,
          },
        ],
      },
    );
  });

  it("menormalkan field opsional yang hilang", () => {
    const result = parseAdminFeatures({
      ok: true,
      data: [{ id: 2, title: "Spike Rush" }],
    });
    assert.deepEqual(result, {
      ok: true,
      data: [
        {
          id: 2,
          title: "Spike Rush",
          description: null,
          iconUrl: null,
          sortOrder: 0,
        },
      ],
    });
  });

  it("melewati item rusak dan judul kosong", () => {
    const result = parseAdminFeatures({
      ok: true,
      data: [
        { id: 1, title: "Valid" },
        { id: "rusak", title: "Salah" },
        { id: 3, title: "   " },
        null,
      ],
    });
    assert.equal(result.ok, true);
    assert.equal(result.ok && result.data.length, 1);
    assert.equal(result.ok && result.data[0].title, "Valid");
  });

  it("meneruskan amplop gagal", () => {
    assert.deepEqual(
      parseAdminFeatures({ ok: false, error: { message: "Dilarang" } }),
      { ok: false, message: "Dilarang", code: undefined, fields: undefined },
    );
  });

  it("menolak data yang bukan array", () => {
    assert.deepEqual(parseAdminFeatures({ ok: true, data: {} }), {
      ok: false,
      message: "Respons server tidak valid.",
    });
  });
});
