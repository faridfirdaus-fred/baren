import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { readSocialLinks, readDownloadLinks } = await import("./links.ts");

describe("readSocialLinks/readDownloadLinks", () => {
  it("mengurutkan deterministik; daftar kosong berarti belum rilis", async () => {
    const social = {
      async list() {
        return [
          { id: 2, platform: "B", url: "https://b.id", sortOrder: 0 },
          { id: 1, platform: "A", url: "https://a.id", sortOrder: 0 },
        ];
      },
    };
    assert.deepEqual(
      (await readSocialLinks(social)).map((s) => s.id),
      [1, 2],
    );

    const kosong = {
      async list() {
        return [];
      },
    };
    assert.deepEqual(await readDownloadLinks(kosong), []);
  });
});
