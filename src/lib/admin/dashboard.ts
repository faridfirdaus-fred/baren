/**
 * Dashboard store contract - interface untuk injeksi data dashboard
 */
export interface DashboardStore {
  features: number;
  galleryAssets: number;
  news: number;
  faq: number;
  wishlist: number;
  comments: number;
  contentUpdates: (Date | null)[];
}

/**
 * Dashboard counts - metrik jumlah untuk setiap entitas
 */
export interface DashboardCounts {
  features: number;
  galleryAssets: number;
  news: number;
  faq: number;
  wishlist: number;
  comments: number;
}

/**
 * Dashboard summary - ringkasan lengkap dashboard termasuk timestamp terbaru
 */
export interface DashboardSummary extends DashboardCounts {
  latestContentUpdatedAt: Date | null;
}

/**
 * Membaca ringkasan dashboard dari store yang terinjeksi.
 *
 * - Meneruskan lima count secara langsung
 * - Memilih timestamp terbesar dari array contentUpdates
 * - Mengabaikan nilai null
 * - Mengembalikan null untuk latestContentUpdatedAt jika semua null
 *
 * @param store - Dashboard store dengan counts dan timestamps
 * @returns Dashboard summary dengan latest content timestamp
 */
export function readDashboardSummary(store: DashboardStore): DashboardSummary {
  const {
    features,
    galleryAssets,
    news,
    faq,
    wishlist,
    comments,
    contentUpdates,
  } = store;

  // Filter null values dan cari timestamp terbesar
  const validDates = contentUpdates.filter(
    (date): date is Date => date !== null,
  );

  const latestContentUpdatedAt =
    validDates.length > 0
      ? validDates.reduce((latest, current) =>
          current > latest ? current : latest,
        )
      : null;

  return {
    features,
    galleryAssets,
    news,
    faq,
    wishlist,
    comments,
    latestContentUpdatedAt,
  };
}
