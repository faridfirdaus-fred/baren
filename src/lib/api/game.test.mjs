import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { readAbout, readFeatures, readHowToPlay } = await import("./game.ts");

describe("readAbout", () => {
  it("null bila kosong, baris bila ada", async () => {
    const kosong = {
      async get() {
        return null;
      },
      async save(i) {
        return i;
      },
    };
    assert.equal(await readAbout(kosong), null);
    const isi = {
      async get() {
        return { id: 1, title: "T", body: "B", imageUrl: null };
      },
      async save(i) {
        return i;
      },
    };
    assert.equal((await readAbout(isi)).title, "T");
  });
});

describe("readFeatures", () => {
  it("mengurutkan deterministik", async () => {
    const store = {
      async list() {
        return [
          { id: 2, title: "B", description: null, iconUrl: null, sortOrder: 0 },
          { id: 1, title: "A", description: null, iconUrl: null, sortOrder: 0 },
        ];
      },
    };
    assert.deepEqual(
      (await readFeatures(store)).map((f) => f.id),
      [1, 2],
    );
  });
});

describe("readHowToPlay", () => {
  it("langkah berurutan + video bisa null (video tidak ada)", async () => {
    const steps = {
      async list() {
        return [
          {
            id: 5,
            step: 2,
            title: "Main",
            description: null,
            mediaUrl: null,
            sortOrder: 1,
          },
          {
            id: 4,
            step: 1,
            title: "Daftar",
            description: null,
            mediaUrl: null,
            sortOrder: 0,
          },
        ];
      },
    };
    const tanpaVideo = {
      async get() {
        return null;
      },
      async save(u) {
        return u;
      },
    };
    const r = await readHowToPlay(steps, tanpaVideo);
    assert.deepEqual(
      r.steps.map((s) => s.step),
      [1, 2],
    );
    assert.equal(r.videoUrl, null);

    const adaVideo = {
      async get() {
        return "https://c.id/d.mp4";
      },
      async save(u) {
        return u;
      },
    };
    assert.equal(
      (await readHowToPlay(steps, adaVideo)).videoUrl,
      "https://c.id/d.mp4",
    );
  });
});
