import type { WishlistPage } from "./api/wishlist";

export type ClientApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string; code?: string } };

export function parseWaitlistApiResponse(
  raw: unknown,
): ClientApiResult<WishlistPage> {
  if (!raw || typeof raw !== "object") {
    return {
      ok: false,
      error: { message: "Format data server tidak valid." },
    };
  }

  const res = raw as {
    ok?: boolean;
    data?: WishlistPage;
    error?: { message?: string; code?: string };
  };

  if (res.ok === true && res.data && Array.isArray(res.data.items)) {
    return { ok: true, data: res.data };
  }

  return {
    ok: false,
    error: {
      message: res.error?.message || "Gagal memuat data waiting list.",
      code: res.error?.code,
    },
  };
}

export function buildExportUrl(search?: string): string {
  const trimmed = search?.trim();
  if (!trimmed) {
    return "/api/wishlist/export";
  }
  return `/api/wishlist/export?search=${encodeURIComponent(trimmed)}`;
}

export function formatRegistrationDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
