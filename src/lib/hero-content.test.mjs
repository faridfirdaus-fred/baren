import test from "node:test";
import assert from "node:assert/strict";

import { toHeroContent } from "./hero-media.ts";

test("toHeroContent", async (t) => {
  await t.test("mengembalikan null bila baris null atau undefined", () => {
    assert.equal(toHeroContent(null), null);
    assert.equal(toHeroContent(undefined), null);
  });

  await t.test(
    "mengembalikan null bila tidak terbit (isPublished !== 1)",
    () => {
      const row = {
        title: "Hero Title",
        subtitle: "Subtitle",
        videoUrl: "/media/hero-loop.mp4",
        backgroundUrl: "/media/hero-poster.jpg",
        primaryCtaLabel: "Wishlist",
        primaryCtaUrl: "#daftar",
        isPublished: 0,
      };
      assert.equal(toHeroContent(row), null);
    },
  );

  await t.test("mengembalikan null bila judul kosong", () => {
    const row = {
      title: "   ",
      subtitle: null,
      videoUrl: "/media/hero-loop.mp4",
      backgroundUrl: "/media/hero-poster.jpg",
      primaryCtaLabel: "Wishlist",
      primaryCtaUrl: "#daftar",
      isPublished: 1,
    };
    assert.equal(toHeroContent(row), null);
  });

  await t.test(
    "mengembalikan null bila video atau poster absen atau tidak valid",
    () => {
      const base = {
        title: "Hero Title",
        primaryCtaLabel: "Wishlist",
        primaryCtaUrl: "#daftar",
        isPublished: 1,
      };

      assert.equal(
        toHeroContent({
          ...base,
          videoUrl: null,
          backgroundUrl: "/media/hero-poster.jpg",
        }),
        null,
      );
      assert.equal(
        toHeroContent({
          ...base,
          videoUrl: "ftp://invalid.mp4",
          backgroundUrl: "/media/hero-poster.jpg",
        }),
        null,
      );
      assert.equal(
        toHeroContent({
          ...base,
          videoUrl: "/media/hero-loop.mp4",
          backgroundUrl: "javascript:alert(1)",
        }),
        null,
      );
    },
  );

  await t.test("mengembalikan null bila primary CTA absen", () => {
    const row = {
      title: "Hero Title",
      videoUrl: "/media/hero-loop.mp4",
      backgroundUrl: "/media/hero-poster.jpg",
      primaryCtaLabel: "",
      primaryCtaUrl: "#daftar",
      isPublished: 1,
    };
    assert.equal(toHeroContent(row), null);
  });

  await t.test("berhasil memetakan baris hero lengkap dan valid", () => {
    const row = {
      title: "Rebut benteng. Kuasai arena.",
      subtitle: "Aksi taktis multipemain.",
      videoUrl: "/media/hero-loop.mp4",
      backgroundUrl: "https://example.com/poster.webp",
      primaryCtaLabel: "GABUNG WISHLIST",
      primaryCtaUrl: "#daftar",
      secondaryCtaLabel: "PELAJARI",
      secondaryCtaUrl: "https://example.com/info",
      isPublished: 1,
    };

    assert.deepEqual(toHeroContent(row), {
      title: "Rebut benteng. Kuasai arena.",
      subtitle: "Aksi taktis multipemain.",
      videoSrc: "/media/hero-loop.mp4",
      poster: "https://example.com/poster.webp",
      primaryCtaLabel: "GABUNG WISHLIST",
      primaryCtaUrl: "#daftar",
      secondaryCtaLabel: "PELAJARI",
      secondaryCtaUrl: "https://example.com/info",
    });
  });
});
