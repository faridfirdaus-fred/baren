import { describe, it } from "node:test";
import assert from "node:assert/strict";

const {
  resolveGameFeaturesCopy,
  resolveGalleryCopy,
  resolveNewsCopy,
  resolveFaqCopy,
  resolveHowToPlayCopy,
  resolveCommentsCopy,
  resolveContactCopy,
} = await import("./landing-content.ts");

describe("landing-content resolvers", () => {
  const customSettings = {
    namaGame: "BAREN",
    tagline: "Rebut benteng.",
    logoUrl: null,
    faviconUrl: null,
    emailKontak: "admin@baren.game",
    featuresEyebrow: "FITUR UNGGULAN",
    featuresTitle: "PILIH STRATEGI ANDA",
    featuresEmptyMessage: "Fitur sedang dalam pengembangan.",
    howToPlayTitle: "PANDUAN PERTANDINGAN",
    galleryEyebrow: "DOKUMENTASI",
    galleryTitle: "AKSI NYATA",
    galleryDescription: "Koleksi visual medan tempur.",
    galleryEmptyTitle: "SEGERA DIBUKA",
    galleryEmptyMessage: "Media visual sedang disiapkan.",
    newsTitle: "KABAR TERKINI",
    newsCtaLabel: "LIHAT SEMUA BERITA",
    faqEyebrow: "BANTUAN",
    faqTitle: "KERAP DITANYAKAN",
    commentsTitle: "DISKUSI KOMUNITAS",
    commentsLoginPrompt: "Masuk akun Google untuk berkomentar",
    commentsEmptyMessage: "Belum ada diskusi.",
    commentsSubmitLabel: "KIRIM PESAN",
    commentsSubmitError: "Gagal memproses pesan.",
    contactEyebrow: "SALURAN RESMI",
    contactTitle: "HUBUNGI STUDIO",
    contactDescription: "Hubungi pengembang melalui kanal resmi.",
    contactEmailLabel: "Surat Elektronik",
    contactSocialTitle: "Media Sosial",
    contactSocialEmptyMessage: "Belum ada kanal media sosial.",
  };

  it("resolves game features copy from settings", () => {
    const copy = resolveGameFeaturesCopy(customSettings);
    assert.deepEqual(copy, {
      eyebrow: "FITUR UNGGULAN",
      title: "PILIH STRATEGI ANDA",
      emptyMessage: "Fitur sedang dalam pengembangan.",
    });
  });

  it("resolves gallery copy from settings", () => {
    const copy = resolveGalleryCopy(customSettings);
    assert.deepEqual(copy, {
      eyebrow: "DOKUMENTASI",
      title: "AKSI NYATA",
      description: "Koleksi visual medan tempur.",
      emptyTitle: "SEGERA DIBUKA",
      emptyMessage: "Media visual sedang disiapkan.",
    });
  });

  it("resolves news copy from settings", () => {
    const copy = resolveNewsCopy(customSettings);
    assert.deepEqual(copy, {
      title: "KABAR TERKINI",
      ctaLabel: "LIHAT SEMUA BERITA",
    });
  });

  it("resolves faq copy from settings", () => {
    const copy = resolveFaqCopy(customSettings);
    assert.deepEqual(copy, {
      eyebrow: "BANTUAN",
      title: "KERAP DITANYAKAN",
    });
  });

  it("resolves how to play copy from settings", () => {
    const copy = resolveHowToPlayCopy(customSettings);
    assert.deepEqual(copy, {
      title: "PANDUAN PERTANDINGAN",
    });
  });

  it("resolves comments copy from settings", () => {
    const copy = resolveCommentsCopy(customSettings);
    assert.deepEqual(copy, {
      title: "DISKUSI KOMUNITAS",
      loginPrompt: "Masuk akun Google untuk berkomentar",
      emptyMessage: "Belum ada diskusi.",
      submitLabel: "KIRIM PESAN",
      submitError: "Gagal memproses pesan.",
    });
  });

  it("resolves contact copy from settings with valid email", () => {
    const copy = resolveContactCopy(customSettings);
    assert.deepEqual(copy, {
      eyebrow: "SALURAN RESMI",
      title: "HUBUNGI STUDIO",
      description: "Hubungi pengembang melalui kanal resmi.",
      emailLabel: "Surat Elektronik",
      contactEmail: "admin@baren.game",
      socialTitle: "Media Sosial",
      socialEmptyMessage: "Belum ada kanal media sosial.",
    });
  });

  it("handles null settings gracefully", () => {
    assert.deepEqual(resolveGameFeaturesCopy(null), {
      eyebrow: null,
      title: null,
      emptyMessage: null,
    });
    assert.deepEqual(resolveContactCopy(null), {
      eyebrow: null,
      title: null,
      description: null,
      emailLabel: null,
      contactEmail: null,
      socialTitle: null,
      socialEmptyMessage: null,
    });
  });
});
