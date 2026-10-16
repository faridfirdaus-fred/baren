export type AdminDashboardInput = {
  features: number;
  gallery: number;
  news: number;
  faq: number;
  waitlist: number;
  contentUpdatedAt: {
    siteSettings: Date | null;
    hero: Date | null;
    heroBanners: Date | null;
    about: Date | null;
    features: Date | null;
    howToPlaySteps: Date | null;
    howToPlayVideo: Date | null;
    gallery: Date | null;
    news: Date | null;
    faq: Date | null;
    social: Date | null;
    downloads: Date | null;
  };
};

export function summarizeAdminDashboard(input: AdminDashboardInput) {
  return {
    features: input.features,
    gallery: input.gallery,
    news: input.news,
    faq: input.faq,
    waitlist: input.waitlist,
    latestContentUpdate: Object.values(
      input.contentUpdatedAt,
    ).reduce<Date | null>(
      (latest, updatedAt) =>
        updatedAt && (!latest || updatedAt > latest) ? updatedAt : latest,
      null,
    ),
  };
}
