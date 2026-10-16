import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readDashboardSummary } from "./dashboard.ts";

describe("readDashboardSummary", () => {
  it("should pass through five counts correctly", () => {
    const mockStore = {
      features: 3,
      galleryAssets: 10,
      news: 5,
      faq: 8,
      waitlist: 42,
      contentUpdates: [null, null, null, null, null],
    };

    const result = readDashboardSummary(mockStore);

    assert.equal(result.features, 3);
    assert.equal(result.galleryAssets, 10);
    assert.equal(result.news, 5);
    assert.equal(result.faq, 8);
    assert.equal(result.waitlist, 42);
  });

  it("should select the largest timestamp from content updates", () => {
    const oldest = new Date("2026-01-01T00:00:00Z");
    const middle = new Date("2026-06-01T00:00:00Z");
    const newest = new Date("2026-12-01T00:00:00Z");

    const mockStore = {
      features: 1,
      galleryAssets: 1,
      news: 1,
      faq: 1,
      waitlist: 1,
      contentUpdates: [oldest, middle, newest, null, null],
    };

    const result = readDashboardSummary(mockStore);

    assert.equal(result.latestContentUpdatedAt?.getTime(), newest.getTime());
  });

  it("should ignore null values when selecting latest timestamp", () => {
    const older = new Date("2026-03-01T00:00:00Z");
    const newer = new Date("2026-09-01T00:00:00Z");

    const mockStore = {
      features: 2,
      galleryAssets: 2,
      news: 2,
      faq: 2,
      waitlist: 2,
      contentUpdates: [null, older, null, newer, null],
    };

    const result = readDashboardSummary(mockStore);

    assert.equal(result.latestContentUpdatedAt?.getTime(), newer.getTime());
  });

  it("should return null for latestContentUpdatedAt when all updates are null", () => {
    const mockStore = {
      features: 0,
      galleryAssets: 0,
      news: 0,
      faq: 0,
      waitlist: 0,
      contentUpdates: [null, null, null, null, null],
    };

    const result = readDashboardSummary(mockStore);

    assert.equal(result.latestContentUpdatedAt, null);
  });

  it("should handle mixed null and valid timestamps correctly", () => {
    const date1 = new Date("2026-02-15T10:30:00Z");
    const date2 = new Date("2026-08-20T14:45:00Z");

    const mockStore = {
      features: 5,
      galleryAssets: 3,
      news: 7,
      faq: 2,
      waitlist: 15,
      contentUpdates: [date1, null, date2, null, null],
    };

    const result = readDashboardSummary(mockStore);

    assert.equal(result.features, 5);
    assert.equal(result.galleryAssets, 3);
    assert.equal(result.news, 7);
    assert.equal(result.faq, 2);
    assert.equal(result.waitlist, 15);
    assert.equal(result.latestContentUpdatedAt?.getTime(), date2.getTime());
  });
});
