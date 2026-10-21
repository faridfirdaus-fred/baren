"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { adminButtonClass } from "@/components/admin/button-styles";

interface SocialLink {
  id: number;
  platform: string;
  url: string;
  sortOrder: number;
}

interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  message?: string;
  fields?: Record<string, string[]>;
}

export function LinksManager() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [socialLoading, setSocialLoading] = useState(true);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [socialForm, setSocialForm] = useState({
    platform: "",
    url: "",
    sortOrder: 0,
  });
  const [socialEditingId, setSocialEditingId] = useState<number | null>(null);
  const [socialFormErrors, setSocialFormErrors] = useState<
    Record<string, string[]>
  >({});
  const [socialSubmitting, setSocialSubmitting] = useState(false);

  const loadSocialLinks = async () => {
    setSocialLoading(true);
    setSocialError(null);
    try {
      const res = await fetch("/api/social-links");
      const json = (await res.json()) as ApiResponse<SocialLink[]>;
      if (!json.ok) {
        setSocialError(json.message || "Gagal memuat tautan sosial");
        return;
      }
      setSocialLinks(json.data || []);
    } catch (err) {
      setSocialError("Gagal memuat tautan sosial");
      console.error(err);
    } finally {
      setSocialLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSocialLinks();
  }, []);

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSocialFormErrors({});
    setSocialSubmitting(true);

    try {
      const url = socialEditingId
        ? `/api/social-links/${socialEditingId}`
        : "/api/social-links";
      const method = socialEditingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(socialForm),
      });

      const json = (await res.json()) as ApiResponse;

      if (!json.ok) {
        if (json.fields) {
          setSocialFormErrors(json.fields);
        } else {
          setSocialError(json.message || "Gagal menyimpan tautan sosial");
        }
        return;
      }

      setSocialForm({ platform: "", url: "", sortOrder: 0 });
      setSocialEditingId(null);
      setSocialFormErrors({});
      await loadSocialLinks();
    } catch (err) {
      setSocialError("Gagal menyimpan tautan sosial");
      console.error(err);
    } finally {
      setSocialSubmitting(false);
    }
  };

  const handleSocialEdit = (item: SocialLink) => {
    setSocialForm({
      platform: item.platform,
      url: item.url,
      sortOrder: item.sortOrder,
    });
    setSocialEditingId(item.id);
    setSocialFormErrors({});
  };

  const handleSocialCancel = () => {
    setSocialForm({ platform: "", url: "", sortOrder: 0 });
    setSocialEditingId(null);
    setSocialFormErrors({});
  };

  const handleSocialDelete = async (id: number) => {
    if (!window.confirm("Yakin ingin menghapus tautan sosial ini?")) {
      return;
    }

    try {
      const res = await fetch(`/api/social-links/${id}`, {
        method: "DELETE",
      });

      const json = (await res.json()) as ApiResponse;

      if (!json.ok) {
        setSocialError(json.message || "Gagal menghapus tautan sosial");
        return;
      }

      await loadSocialLinks();
    } catch (err) {
      setSocialError("Gagal menghapus tautan sosial");
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Pengalihan Info Kontak ke Konten Landing */}
      <div className="rounded-lg border border-line bg-ink-800 p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold uppercase tracking-wider text-sand">
              Email & Copy Seksi Kontak
            </h2>
            <p className="mt-1 text-sm text-sand-500">
              Email resmi, judul seksi, deskripsi, dan pesan kosong sekarang
              dikelola di halaman Konten Landing.
            </p>
          </div>
          <Link
            href="/admin/landing"
            className={adminButtonClass("secondary", "md")}
          >
            Buka Konten Landing &rarr;
          </Link>
        </div>
      </div>

      {/* Kelola Tautan Media Sosial */}
      <div className="rounded-lg border border-line bg-ink-800 p-6">
        <h2 className="text-xl font-bold uppercase tracking-wider text-sand">
          Tautan Media Sosial Resmi
        </h2>
        <p className="mt-1 text-sm text-sand-500">
          Tautan ke platform sosial seperti Discord, Instagram, YouTube, atau
          TikTok.
        </p>

        {socialError && (
          <div className="mt-4 rounded bg-red-900/40 p-4 text-sm text-red-300">
            {socialError}
          </div>
        )}

        <form onSubmit={handleSocialSubmit} className="mt-6 space-y-4">
          <h3 className="text-base font-semibold text-sand">
            {socialEditingId
              ? "Edit Tautan Sosial"
              : "Tambah Tautan Sosial Baru"}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="social-platform"
                className="block text-sm font-medium text-sand-400"
              >
                Platform
              </label>
              <input
                id="social-platform"
                type="text"
                required
                value={socialForm.platform}
                onChange={(e) =>
                  setSocialForm((prev) => ({
                    ...prev,
                    platform: e.target.value,
                  }))
                }
                disabled={socialSubmitting}
                placeholder="discord, instagram, youtube, tiktok"
                className="mt-1 w-full rounded border border-line bg-ink-900 px-3 py-2 text-sand focus:border-ember focus:outline-none"
              />
              {socialFormErrors.platform && (
                <p className="mt-1 text-sm text-red-400">
                  {socialFormErrors.platform.join(", ")}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="social-sort"
                className="block text-sm font-medium text-sand-400"
              >
                Urutan (Sort Order)
              </label>
              <input
                id="social-sort"
                type="number"
                value={socialForm.sortOrder}
                onChange={(e) =>
                  setSocialForm((prev) => ({
                    ...prev,
                    sortOrder: parseInt(e.target.value, 10) || 0,
                  }))
                }
                disabled={socialSubmitting}
                className="mt-1 w-full rounded border border-line bg-ink-900 px-3 py-2 text-sand focus:border-ember focus:outline-none"
              />
              {socialFormErrors.sortOrder && (
                <p className="mt-1 text-sm text-red-400">
                  {socialFormErrors.sortOrder.join(", ")}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="social-url"
              className="block text-sm font-medium text-sand-400"
            >
              URL Lengkap (wajib diawali https://)
            </label>
            <input
              id="social-url"
              type="url"
              required
              value={socialForm.url}
              onChange={(e) =>
                setSocialForm((prev) => ({ ...prev, url: e.target.value }))
              }
              disabled={socialSubmitting}
              placeholder="https://discord.gg/baren"
              className="mt-1 w-full rounded border border-line bg-ink-900 px-3 py-2 text-sand focus:border-ember focus:outline-none"
            />
            {socialFormErrors.url && (
              <p className="mt-1 text-sm text-red-400">
                {socialFormErrors.url.join(", ")}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={socialSubmitting}
              className={adminButtonClass("primary", "md")}
            >
              {socialSubmitting
                ? "Menyimpan..."
                : socialEditingId
                  ? "Perbarui Tautan"
                  : "Tambah Tautan"}
            </button>
            {socialEditingId && (
              <button
                type="button"
                onClick={handleSocialCancel}
                disabled={socialSubmitting}
                className={adminButtonClass("secondary", "md")}
              >
                Batal
              </button>
            )}
          </div>
        </form>

        {/* Tabel Tautan Sosial */}
        <div className="mt-8">
          <h3 className="mb-3 text-base font-semibold text-sand">
            Daftar Tautan Sosial
          </h3>

          {socialLoading ? (
            <p className="text-sand-500">Memuat tautan sosial...</p>
          ) : socialLinks.length === 0 ? (
            <p className="text-sand-500">
              Belum ada tautan sosial. Tambahkan tautan di atas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-sand">
                <thead className="border-b border-line bg-ink-900 text-xs uppercase text-sand-400">
                  <tr>
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3">URL</th>
                    <th className="px-4 py-3">Urutan</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {socialLinks.map((link) => (
                    <tr key={link.id} className="hover:bg-ink-700/50">
                      <td className="px-4 py-3 font-medium uppercase text-sand">
                        {link.platform}
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-sand-400">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-ember hover:underline"
                        >
                          {link.url}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sand-400">
                        {link.sortOrder}
                      </td>
                      <td className="space-x-2 px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleSocialEdit(link)}
                          className={adminButtonClass("secondary", "sm")}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSocialDelete(link.id)}
                          className={adminButtonClass("danger", "sm")}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
