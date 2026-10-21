"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminInputClass } from "./form-styles";

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
    <div className="grid max-w-5xl gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-wide">
            Manajemen Wishlist
          </h1>
          <p className="mt-1 text-sm text-sand/70">
            Total Pendaftar:{" "}
            <span className="font-semibold text-sand">{total}</span>
          </p>
        </div>
        <div>
          <a
            href={exportUrl}
            download
            className={adminButtonClass("primary", "md")}
          >
            {search
              ? `Ekspor CSV (${total} Hasil Filter)`
              : `Ekspor CSV (${total} Pendaftar)`}
          </a>
        </div>
      </header>

      {/* Filter dan Pencarian */}
      <section aria-labelledby="wishlist-filter-heading">
        <h2 id="wishlist-filter-heading" className="sr-only">
          Pencarian Wishlist
        </h2>
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="flex-1">
            <label htmlFor="wishlist-search" className="sr-only">
              Cari email atau nama
            </label>
            <input
              id="wishlist-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari email atau nama pendaftar..."
              className={adminInputClass}
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
                className={adminButtonClass("ghost", "md")}
              >
                Reset
              </button>
            ) : null}
          </div>
        </form>
      </section>

      {/* Konten Tabel dan Status */}
      <section aria-labelledby="wishlist-table-heading">
        <h2 id="wishlist-table-heading" className="sr-only">
          Daftar Pendaftar
        </h2>

        {error ? (
          <div
            role="alert"
            className="flex items-center justify-between border border-ember/40 bg-ember/10 p-4 text-sm text-ember"
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
        ) : null}

        {loading && !data ? (
          <p className="py-8 text-center text-sm text-sand/60">
            Memuat data wishlist...
          </p>
        ) : null}

        {data && data.items.length === 0 && !error ? (
          <div className="border border-ink-700 bg-ink-800/40 py-12 text-center text-sm text-sand/60">
            {search
              ? `Tidak ditemukan pendaftar yang cocok dengan kata kunci "${search}".`
              : "Belum ada pendaftar wishlist."}
          </div>
        ) : null}

        {data && data.items.length > 0 ? (
          <div className="overflow-x-auto border border-ink-700 bg-ink-800/30">
            <table className="w-full text-left text-sm text-sand">
              <thead className="border-b border-ink-700 bg-ink-800/80 text-xs uppercase tracking-wider text-sand/60">
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
              <tbody className="divide-y divide-ink-700/60">
                {data.items.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-ink-700/40"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-sand/50">
                      {item.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-sand">
                      {item.email}
                    </td>
                    <td className="px-4 py-3 text-sand/80">
                      {item.name || "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-sand/60">
                      {formatRegistrationDate(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Kontrol Paginasi */}
        {data && totalPages > 1 ? (
          <nav
            aria-label="Navigasi halaman wishlist"
            className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-ink-700 pt-4 sm:flex-row"
          >
            <p className="text-xs text-sand/60">
              Halaman <span className="font-semibold text-sand">{page}</span>{" "}
              dari <span className="font-semibold text-sand">{totalPages}</span>{" "}
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
        ) : null}
      </section>
    </div>
  );
}
