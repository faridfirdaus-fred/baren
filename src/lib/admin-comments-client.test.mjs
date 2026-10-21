import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { parseAdminComments } = await import("./admin-comments-client.ts");

const oneComment = {
  id: 1,
  body: "Mantap",
  userName: "Ayu",
  userPhotoUrl: "https://example.com/ayu.jpg",
  createdAt: "2026-10-20T00:00:00.000Z",
};

describe("parseAdminComments", () => {
  it("membaca field komentar datar dan total", () => {
    assert.deepEqual(
      parseAdminComments({ comments: [oneComment], total: 12 }),
      {
        ok: true,
        data: [oneComment],
        total: 12,
      },
    );
  });

  it("menormalkan nama dan foto kosong serta melewati item rusak", () => {
    const result = parseAdminComments({
      comments: [
        {
          id: 1,
          body: "Halo",
          userName: null,
          userPhotoUrl: "",
          createdAt: "2026-10-20T00:00:00.000Z",
        },
        { id: "rusak" },
      ],
    });
    assert.deepEqual(result, {
      ok: true,
      data: [
        {
          id: 1,
          body: "Halo",
          userName: "Anonim",
          userPhotoUrl: null,
          createdAt: "2026-10-20T00:00:00.000Z",
        },
      ],
      total: 1,
    });
  });

  it("jatuh kembali ke panjang data bila total hilang", () => {
    const result = parseAdminComments({ comments: [oneComment] });
    assert.equal(result.ok, true);
    assert.equal(result.ok && result.total, 1);
  });

  it("jatuh kembali ke panjang data bila total lebih kecil dari data", () => {
    const result = parseAdminComments({
      comments: [oneComment, { ...oneComment, id: 2 }],
      total: 1,
    });
    assert.equal(result.ok, true);
    assert.equal(result.ok && result.total, 2);
  });

  it("jatuh kembali ke panjang data bila total bukan bilangan bulat", () => {
    const result = parseAdminComments({
      comments: [oneComment],
      total: "12",
    });
    assert.equal(result.ok, true);
    assert.equal(result.ok && result.total, 1);
  });

  it("meneruskan error amplop", () => {
    assert.deepEqual(
      parseAdminComments({ ok: false, error: { message: "Dilarang" } }),
      { ok: false, message: "Dilarang", code: undefined, fields: undefined },
    );
  });
});
