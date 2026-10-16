import type { WaitlistQuery } from "@/lib/validation/waitlist";

/**
 * Jumlah item waitlist per halaman - konstanta tetap 25
 */
export const WAITLIST_PER_PAGE = 25;

/**
 * Waitlist list item - representasi satu entry waitlist
 */
export interface WaitlistListItem {
  id: number;
  email: string;
  name: string | null;
  createdAt: string; // ISO 8601
}

/**
 * Waitlist page - hasil pagination dengan metadata
 */
export interface WaitlistPage {
  items: WaitlistListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/**
 * Waitlist lister - interface untuk dependency injection
 */
export interface WaitlistLister {
  items: WaitlistListItem[];
  total: number;
}

/**
 * Membaca halaman waitlist dari lister yang terinjeksi.
 *
 * - Meneruskan query parameters (page, search)
 * - perPage selalu 25 (WAITLIST_PER_PAGE)
 * - Menghitung totalPages: Math.ceil(total / perPage)
 * - totalPages = 0 jika total = 0
 *
 * @param lister - Waitlist lister dengan items dan total
 * @param query - Query parameters (page, search optional)
 * @returns Waitlist page dengan pagination metadata
 */
export function readWaitlistPage(
  lister: WaitlistLister,
  query: WaitlistQuery,
): WaitlistPage {
  const { items, total } = lister;
  const { page } = query;

  const totalPages = total === 0 ? 0 : Math.ceil(total / WAITLIST_PER_PAGE);

  return {
    items,
    total,
    page,
    perPage: WAITLIST_PER_PAGE,
    totalPages,
  };
}
