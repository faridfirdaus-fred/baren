import type { WishlistQuery } from "@/lib/validation/wishlist";

/**
 * Jumlah item wishlist per halaman - konstanta tetap 25
 */
export const WISHLIST_PER_PAGE = 25;

/**
 * Wishlist list item - representasi satu entry wishlist
 */
export interface WishlistListItem {
  id: number;
  email: string;
  name: string | null;
  createdAt: string; // ISO 8601
}

/**
 * Wishlist page - hasil pagination dengan metadata
 */
export interface WishlistPage {
  items: WishlistListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/**
 * Wishlist lister - interface untuk dependency injection
 */
export interface WishlistLister {
  items: WishlistListItem[];
  total: number;
}

/**
 * Membaca halaman wishlist dari lister yang terinjeksi.
 *
 * - Meneruskan query parameters (page, search)
 * - perPage selalu 25 (WISHLIST_PER_PAGE)
 * - Menghitung totalPages: Math.ceil(total / perPage)
 * - totalPages = 0 jika total = 0
 *
 * @param lister - Wishlist lister dengan items dan total
 * @param query - Query parameters (page, search optional)
 * @returns Wishlist page dengan pagination metadata
 */
export function readWishlistPage(
  lister: WishlistLister,
  query: WishlistQuery,
): WishlistPage {
  const { items, total } = lister;
  const { page } = query;

  const totalPages = total === 0 ? 0 : Math.ceil(total / WISHLIST_PER_PAGE);

  return {
    items,
    total,
    page,
    perPage: WISHLIST_PER_PAGE,
    totalPages,
  };
}
