import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { buildDashboardMetrics } = await import("./dashboard-metrics.ts");

const counts = {
  features: 3,
  galleryAssets: 10,
  news: 5,
  faq: 8,
  wishlist: 42,
  comments: 1,
};

describe("buildDashboardMetrics", () => {
  it("mengembalikan enam metrik dengan urutan tetap", () => {
    const metrics = buildDashboardMetrics(counts);
    assert.deepEqual(
      metrics.map((metric) => metric.key),
      ["features", "galleryAssets", "news", "faq", "wishlist", "comments"],
    );
    assert.equal(metrics.length, 6);
  });

  it("meneruskan angka dari counts", () => {
    const metrics = buildDashboardMetrics(counts);
    assert.deepEqual(
      metrics.map((metric) => metric.value),
      [3, 10, 5, 8, 42, 1],
    );
  });

  it("memakai label Indonesia dan tautan pengelolaan yang valid", () => {
    const metrics = buildDashboardMetrics(counts);
    assert.deepEqual(
      metrics.map((metric) => metric.label),
      ["Fitur", "Galeri", "Berita", "FAQ", "Wishlist", "Komentar"],
    );
    assert.deepEqual(
      metrics.map((metric) => metric.href),
      [
        "/admin/features",
        "/admin/gallery",
        "/admin/news",
        "/admin/faq",
        "/admin/wishlist",
        "/admin/comments",
      ],
    );
    for (const metric of metrics) {
      assert.ok(metric.href.length > 0);
      assert.match(metric.href, /^\/admin\//);
      assert.ok(metric.description.length > 0);
      assert.ok(metric.actionLabel.startsWith("Kelola"));
    }
  });

  it("menjelaskan cakupan data sumber", () => {
    const metrics = buildDashboardMetrics(counts);
    const byKey = Object.fromEntries(metrics.map((m) => [m.key, m]));
    assert.match(byKey.news.description, /termasuk draf/);
    assert.match(byKey.comments.description, /Seluruh komentar/);
    assert.match(byKey.galleryAssets.description, /gambar\/video/);
  });
});
