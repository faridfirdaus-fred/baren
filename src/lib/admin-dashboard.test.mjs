import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { summarizeAdminDashboard } = await import("./admin-dashboard.ts");

describe("summarizeAdminDashboard", () => {
  it("keeps exact counts and latest content update", () => {
    assert.deepEqual(
      summarizeAdminDashboard({
        features: 2,
        gallery: 3,
        news: 5,
        faq: 7,
        waitlist: 11,
        contentUpdatedAt: {
          siteSettings: new Date("2026-10-10T00:00:00.000Z"),
          hero: new Date("2026-10-11T00:00:00.000Z"),
          heroBanners: new Date("2026-10-12T00:00:00.000Z"),
          about: new Date("2026-10-13T00:00:00.000Z"),
          features: new Date("2026-10-14T00:00:00.000Z"),
          howToPlaySteps: new Date("2026-10-15T00:00:00.000Z"),
          howToPlayVideo: new Date("2026-10-16T00:00:00.000Z"),
          gallery: new Date("2026-10-17T00:00:00.000Z"),
          news: new Date("2026-10-18T00:00:00.000Z"),
          faq: new Date("2026-10-19T00:00:00.000Z"),
          social: new Date("2026-10-20T00:00:00.000Z"),
          downloads: new Date("2026-10-21T00:00:00.000Z"),
        },
      }),
      {
        features: 2,
        gallery: 3,
        news: 5,
        faq: 7,
        waitlist: 11,
        latestContentUpdate: new Date("2026-10-21T00:00:00.000Z"),
      },
    );
  });

  it("returns null when all content tables are empty", () => {
    assert.deepEqual(
      summarizeAdminDashboard({
        features: 0,
        gallery: 0,
        news: 0,
        faq: 0,
        waitlist: 11,
        contentUpdatedAt: {
          siteSettings: null,
          hero: null,
          heroBanners: null,
          about: null,
          features: null,
          howToPlaySteps: null,
          howToPlayVideo: null,
          gallery: null,
          news: null,
          faq: null,
          social: null,
          downloads: null,
        },
      }),
      {
        features: 0,
        gallery: 0,
        news: 0,
        faq: 0,
        waitlist: 11,
        latestContentUpdate: null,
      },
    );
  });
});
