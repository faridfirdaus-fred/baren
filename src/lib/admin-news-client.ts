// Helper untuk klien modul admin berita (E15-2).
// Parser daftar berita admin dan pembuat slug otomatis.

import { parseApiEnvelope, type ApiEnvelope } from "./api/client-response.ts";

export type AdminNewsItem = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  coverUrl: string | null;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminNewsFormData = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverUrl: string;
  status: "draft" | "published";
};

/**
 * Parsing respons GET /api/news?scope=admin.
 * Wajib memastikan data bertipe array untuk mencegah regresi items.map is not a function.
 */
export function parseAdminNewsList(
  value: unknown,
): ApiEnvelope<AdminNewsItem[]> {
  const parsed = parseApiEnvelope<AdminNewsItem[]>(value);
  if (!parsed.ok) return parsed;

  if (!Array.isArray(parsed.data)) {
    return {
      ok: false,
      message: "Respons server tidak valid.",
    };
  }

  return parsed;
}

/**
 * Buat slug ramah URL dari judul berita.
 * - Bersihkan karakter diakritik
 * - Huruf kecil saja
 * - Ganti tanda baca & spasi dengan tanda hubung
 * - Batasi 160 karakter
 * - Beri prefiks 'berita-' bila hasil murni angka (karena slug murni angka dilarang di [key])
 */
export function slugifyTitle(title: string): string {
  const normalized = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const truncated = normalized.slice(0, 160).replace(/-+$/, "");

  if (!truncated) return "";

  // Cegah slug murni angka agar tidak bentrok dengan ID numerik di rute [key]
  if (/^\d+$/.test(truncated)) {
    return `berita-${truncated}`;
  }

  return truncated;
}
