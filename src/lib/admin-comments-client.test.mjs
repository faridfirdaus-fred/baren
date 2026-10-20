import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { parseAdminComments } = await import("./admin-comments-client.ts");

describe("parseAdminComments", () => {
  it("membaca field komentar datar", () => {
    assert.deepEqual(
      parseAdminComments({
        comments: [
          {
            id: 1,
            body: "Mantap",
            userName: "Ayu",
            userPhotoUrl: "https://example.com/ayu.jpg",
            createdAt: "2026-10-20T00:00:00.000Z",
          },
        ],
      }),
      {
        ok: true,
        data: [
          {
            id: 1,
            body: "Mantap",
            userName: "Ayu",
            userPhotoUrl: "https://example.com/ayu.jpg",
            createdAt: "2026-10-20T00:00:00.000Z",
          },
        ],
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
    });
  });

  it("meneruskan error amplop", () => {
    assert.deepEqual(
      parseAdminComments({ ok: false, error: { message: "Dilarang" } }),
      { ok: false, message: "Dilarang", code: undefined, fields: undefined },
    );
  });
});
