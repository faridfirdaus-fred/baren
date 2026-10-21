/**
 * E16-2: konfigurasi enam kartu metrik dasbor admin.
 * Setiap kartu adalah navigasi menuju halaman pengelolaan data sumbernya.
 */

import type { DashboardCounts } from "./dashboard";

export type DashboardMetricKey = keyof DashboardCounts;

export type DashboardMetric = {
  key: DashboardMetricKey;
  label: string;
  value: number;
  href: string;
  description: string;
  actionLabel: string;
};

export function buildDashboardMetrics(
  counts: DashboardCounts,
): DashboardMetric[] {
  return [
    {
      key: "features",
      label: "Fitur",
      value: counts.features,
      href: "/admin/features",
      description: "Jumlah fitur game yang tersimpan",
      actionLabel: "Kelola Fitur",
    },
    {
      key: "galleryAssets",
      label: "Galeri",
      value: counts.galleryAssets,
      href: "/admin/gallery",
      description: "Jumlah aset galeri (gambar/video)",
      actionLabel: "Kelola Galeri",
    },
    {
      key: "news",
      label: "Berita",
      value: counts.news,
      href: "/admin/news",
      description: "Seluruh berita, termasuk draf",
      actionLabel: "Kelola Berita",
    },
    {
      key: "faq",
      label: "FAQ",
      value: counts.faq,
      href: "/admin/faq",
      description: "Jumlah pasangan tanya-jawab",
      actionLabel: "Kelola FAQ",
    },
    {
      key: "wishlist",
      label: "Wishlist",
      value: counts.wishlist,
      href: "/admin/wishlist",
      description: "Jumlah email terdaftar",
      actionLabel: "Kelola Wishlist",
    },
    {
      key: "comments",
      label: "Komentar",
      value: counts.comments,
      href: "/admin/comments",
      description: "Seluruh komentar pengunjung",
      actionLabel: "Kelola Komentar",
    },
  ];
}
