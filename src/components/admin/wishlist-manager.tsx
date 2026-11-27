"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Search } from "lucide-react";
import { adminInputClass } from "./form-styles";
import { Skeleton } from "@/components/ui/skeleton";

import { adminButtonClass } from "@/components/admin/button-styles";
import type { WishlistPage } from "@/lib/api/wishlist";
import {
  buildExportUrl,
  formatRegistrationDate,
  parseWishlistApiResponse,
} from "@/lib/admin-wishlist-client";

export function AdminWishlistManager() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [data, setData] = useState<WishlistPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeRequestRef = useRef(0);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    const requestId = ++activeRequestRef.current;
    const params = new URLSearchParams();
    params.set("page", String(page));
    const trimmed = search.trim();
    if (trimmed) params.set("search", trimmed);

    fetch(`/api/wishlist?${params.toString()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((raw) => {
        if (activeRequestRef.current !== requestId) return;
        const parsed = parseWishlistApiResponse(raw);
        if (!parsed.ok) {
          setError(parsed.error.message);
        } else {
          setData(parsed.data);
        }
        setLoading(false);
      })
      .catch(() => {
        if (activeRequestRef.current !== requestId) return;
        setError("Gagal memuat daftar wishlist. Silakan coba lagi.");
        setLoading(false);
      });
  }, [page, search]);

  useEffect(() => {
    const controller = new AbortController();
    const requestId = ++activeRequestRef.current;
    const params = new URLSearchParams();
    params.set("page", String(page));
    const trimmed = search.trim();
    if (trimmed) params.set("search", trimmed);

    fetch(`/api/wishlist?${params.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((raw) => {
        if (controller.signal.aborted || activeRequestRef.current !== requestId)
          return;
        const parsed = parseWishlistApiResponse(raw);
        if (!parsed.ok) {
          setError(parsed.error.message);
        } else {
          setData(parsed.data);
        }
        setLoading(false);
      })
      .catch(() => {
        if (controller.signal.aborted || activeRequestRef.current !== requestId)
          return;
        setError("Gagal memuat daftar wishlist. Silakan coba lagi.");
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [page, search]);

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setPage(1);
    setSearch(searchInput);
  }

  function handleResetSearch() {
    setLoading(true);
    setError(null);
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  function goToPage(target: number) {
    setLoading(true);
    setError(null);
    setPage(target);
  }

  const exportUrl = buildExportUrl(search);
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Daftar Wishlist
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Total Pendaftar:{" "}
            <span className="font-semibold text-zinc-900">{total}</span>
          </p>
        </div>
        <a
          href={exportUrl}
          download
          className={adminButtonClass("primary", "md")}
        >
          <Download className="h-4 w-4" />
          <span>
            {search ? `Ekspor CSV (${total} Hasil)` : `Ekspor CSV (${total})`}
          </span>
        </a>
      </header>

      <section aria-labelledby="wishlist-filter-heading">
        <h2 id="wishlist-filter-heading" className="sr-only">
          Pencarian Wishlist
        </h2>
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col gap-2.5 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <label htmlFor="wishlist-search" className="sr-only">
              Cari email atau nama
            </label>
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            <input
              id="wishlist-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari email atau nama pendaftar..."
              className={`${adminInputClass} pl-10`}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className={adminButtonClass("primary", "md")}
            >
              Cari
            </button>
            {search ? (
              <button
                type="button"
                onClick={handleResetSearch}
                disabled={loading}
                className={adminButtonClass("secondary", "md")}
              >
                Reset
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section aria-labelledby="wishlist-table-heading">
        <h2 id="wishlist-table-heading" className="sr-only">
          Daftar Pendaftar
        </h2>

        {error && (
          <div
            role="alert"
            className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={reload}
              className={adminButtonClass("secondary", "sm")}
            >
              Coba lagi
            </button>
          </div>
        )}

        {loading && !data && (
          <div
            className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5"
            role="status"
            aria-label="Memuat data wishlist..."
          >
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {data && data.items.length === 0 && !error && (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white py-12 text-center text-sm text-zinc-500">
            {search
              ? `Tidak ditemukan pendaftar yang cocok dengan "${search}".`
              : "Belum ada pendaftar wishlist."}
          </div>
        )}

        {data && data.items.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
            <table className="w-full text-left text-sm text-zinc-900">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-500">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    ID
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Nama
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Tanggal Terdaftar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.items.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-zinc-50/70"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-400">
                      #{item.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {item.email}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {item.name || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">
                      {formatRegistrationDate(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && totalPages > 1 && (
          <nav
            aria-label="Navigasi halaman wishlist"
            className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row"
          >
            <p className="text-xs text-zinc-500">
              Halaman{" "}
              <span className="font-semibold text-zinc-900">{page}</span> dari{" "}
              <span className="font-semibold text-zinc-900">{totalPages}</span>{" "}
              (Menampilkan {(page - 1) * 25 + 1}–{Math.min(page * 25, total)}{" "}
              dari {total})
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => goToPage(Math.max(1, page - 1))}
                disabled={page <= 1 || loading}
                className={adminButtonClass("secondary", "sm")}
              >
                Sebelumnya
              </button>
              <button
                type="button"
                onClick={() => goToPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages || loading}
                className={adminButtonClass("secondary", "sm")}
              >
                Berikutnya
              </button>
            </div>
          </nav>
        )}
      </section>
    </div>
  );
}
