"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import {
  adminInputClass,
  adminLabelClass,
  adminErrorClass,
} from "./form-styles";

import { adminButtonClass } from "@/components/admin/button-styles";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { Toast } from "@/components/admin/toast";
import { Skeleton } from "@/components/ui/skeleton";

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
  error?: {
    code?: string;
    message?: string;
    fields?: Record<string, string[]>;
  };
  fields?: Record<string, string[]>;
}

const PLATFORM_PRESETS = [
  {
    id: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/barengame",
  },
  {
    id: "tiktok",
    label: "TikTok",
    placeholder: "https://tiktok.com/@barengame",
  },
  {
    id: "youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/@barengame",
  },
  { id: "discord", label: "Discord", placeholder: "https://discord.gg/baren" },
  { id: "x", label: "X / Twitter", placeholder: "https://x.com/barengame" },
];

export function LinksManager() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [emailKontak, setEmailKontak] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [socialLoading, setSocialLoading] = useState(true);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [socialForm, setSocialForm] = useState({
    platform: "instagram",
    url: "",
    sortOrder: 0,
  });
  const [socialEditingId, setSocialEditingId] = useState<number | null>(null);
  const [socialFormErrors, setSocialFormErrors] = useState<
    Record<string, string[]>
  >({});
  const [socialSubmitting, setSocialSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SocialLink | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loadData = async () => {
    setSocialLoading(true);
    setSocialError(null);
    try {
      const [linksRes, settingsRes] = await Promise.all([
        fetch("/api/social-links"),
        fetch("/api/settings"),
      ]);
      const json = (await linksRes.json()) as ApiResponse<SocialLink[]>;
      const settingsJson = (await settingsRes.json()) as ApiResponse<
        Record<string, string | null>
      >;
      if (!json.ok) {
        setSocialError(
          json.error?.message || json.message || "Gagal memuat tautan sosial",
        );
        return;
      }
      setSocialLinks(
        [...(json.data || [])].sort(
          (a, b) => a.sortOrder - b.sortOrder || a.id - b.id,
        ),
      );
      if (settingsJson.ok && settingsJson.data) {
        setEmailKontak(settingsJson.data.emailKontak || "");
      }
    } catch (err) {
      setSocialError("Gagal memuat tautan sosial");
      console.error(err);
    } finally {
      setSocialLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, []);

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEmail(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailKontak: emailKontak.trim() }),
      });
      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        const msg =
          json.error?.fields?.emailKontak?.[0] ||
          json.error?.message ||
          json.message ||
          "Gagal menyimpan email kontak";
        setToast({ message: msg, type: "error" });
        return;
      }
      setToast({ message: "Email kontak disimpan", type: "success" });
    } catch {
      setToast({ message: "Gagal menyimpan email kontak", type: "error" });
    } finally {
      setSavingEmail(false);
    }
  };

  const resetSocialForm = () => {
    setSocialForm({
      platform: "instagram",
      url: "",
      sortOrder: socialLinks.length,
    });
    setSocialEditingId(null);
    setSocialFormErrors({});
    setSocialError(null);
  };

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSocialFormErrors({});
    setSocialError(null);
    setSocialSubmitting(true);

    try {
      const isEditing = socialEditingId !== null;
      const url = isEditing
        ? `/api/social-links/${socialEditingId}`
        : "/api/social-links";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...socialForm,
          sortOrder: isEditing ? socialForm.sortOrder : socialLinks.length,
        }),
      });

      const json = (await res.json()) as ApiResponse;

      if (!json.ok) {
        const fields = json.error?.fields || json.fields;
        if (fields && Object.keys(fields).length > 0) {
          setSocialFormErrors(fields);
        } else {
          setSocialError(
            json.error?.message ||
              json.message ||
              "Gagal menyimpan tautan sosial",
          );
        }
        return;
      }

      setToast({
        message: isEditing ? "Tautan diperbarui" : "Tautan ditambahkan",
        type: "success",
      });
      resetSocialForm();
      await loadData();
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
    setSocialError(null);
  };

  const handleSocialDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/social-links/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        setToast({
          message:
            json.error?.message ||
            json.message ||
            "Gagal menghapus tautan sosial",
          type: "error",
        });
        return;
      }
      setToast({ message: "Tautan sosial dihapus", type: "success" });
      if (socialEditingId === deleteTarget.id) resetSocialForm();
      await loadData();
    } catch (err) {
      setToast({ message: "Gagal menghapus tautan sosial", type: "error" });
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const activePreset = PLATFORM_PRESETS.find(
    (p) => p.id === socialForm.platform.toLowerCase(),
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Tautan Sosial & Kontak
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Kelola saluran media sosial resmi dan alamat email kontak BAREN.
          </p>
        </div>
        <button
          type="button"
          onClick={resetSocialForm}
          className={adminButtonClass("primary", "md")}
        >
          <Plus className="h-4 w-4" />
          <span>Tautan Baru</span>
        </button>
      </header>

      {/* Email Kontak Ringkas */}
      <form
        onSubmit={handleSaveEmail}
        className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label htmlFor="contact-email-input" className={adminLabelClass}>
            Email Kontak Resmi (tampil di Footer)
          </label>
          <input
            id="contact-email-input"
            type="email"
            value={emailKontak}
            onChange={(e) => setEmailKontak(e.target.value)}
            placeholder="halo@baren.game"
            className={adminInputClass}
          />
        </div>
        <button
          type="submit"
          disabled={savingEmail}
          className={adminButtonClass("secondary", "md")}
        >
          {savingEmail ? "Menyimpan..." : "Simpan Email"}
        </button>
      </form>

      {socialError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {socialError}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Daftar Tautan */}
        <div className="space-y-3 lg:col-span-7">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Daftar Media Sosial ({socialLinks.length})
          </h2>

          {socialLoading ? (
            <div className="space-y-3" role="status" aria-label="Memuat tautan">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : socialLinks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
              Belum ada tautan sosial. Pilih platform di sebelah kanan untuk
              menambahkan.
            </div>
          ) : (
            <ul className="space-y-2.5">
              {socialLinks.map((link) => {
                const isSelected = socialEditingId === link.id;
                return (
                  <li
                    key={link.id}
                    onClick={() => handleSocialEdit(link)}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border bg-white p-4 transition-all ${
                      isSelected
                        ? "border-zinc-900 ring-2 ring-zinc-900/10"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="inline-block rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold uppercase text-zinc-700">
                        {link.platform}
                      </span>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 flex items-center gap-1 truncate text-xs text-zinc-500 hover:text-zinc-900 hover:underline"
                      >
                        <span className="truncate">{link.url}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSocialEdit(link);
                        }}
                        className={adminButtonClass("secondary", "icon-sm")}
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(link);
                        }}
                        className={adminButtonClass("danger", "icon-sm")}
                        title="Hapus"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Form Tautan */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSocialSubmit}
            className="sticky top-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"
          >
            <h2 className="border-b border-zinc-100 pb-3.5 text-base font-bold text-zinc-900">
              {socialEditingId ? "Edit Tautan Sosial" : "Tambah Tautan Sosial"}
            </h2>

            <div>
              <span className={adminLabelClass}>Pilih Platform</span>
              <div className="flex flex-wrap gap-1.5">
                {PLATFORM_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSocialForm((prev) => ({ ...prev, platform: p.id }));
                      if (socialFormErrors.platform) {
                        setSocialFormErrors((prev) => ({
                          ...prev,
                          platform: [],
                        }));
                      }
                    }}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      socialForm.platform.toLowerCase() === p.id
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <input
                id="social-platform"
                type="text"
                required
                value={socialForm.platform}
                onChange={(e) => {
                  setSocialForm((prev) => ({
                    ...prev,
                    platform: e.target.value,
                  }));
                  if (socialFormErrors.platform) {
                    setSocialFormErrors((prev) => ({ ...prev, platform: [] }));
                  }
                }}
                disabled={socialSubmitting}
                aria-label="Platform"
                placeholder="instagram"
                className={`${adminInputClass} mt-2`}
              />
              {socialFormErrors.platform &&
                socialFormErrors.platform.length > 0 && (
                  <p className={adminErrorClass}>
                    {socialFormErrors.platform.join(", ")}
                  </p>
                )}
            </div>

            <div>
              <label htmlFor="social-url" className={adminLabelClass}>
                URL Lengkap (diawali https://) *
              </label>
              <input
                id="social-url"
                type="url"
                required
                value={socialForm.url}
                onChange={(e) => {
                  setSocialForm((prev) => ({ ...prev, url: e.target.value }));
                  if (socialFormErrors.url) {
                    setSocialFormErrors((prev) => ({ ...prev, url: [] }));
                  }
                }}
                disabled={socialSubmitting}
                placeholder={
                  activePreset?.placeholder || "https://instagram.com/barengame"
                }
                className={adminInputClass}
              />
              {socialFormErrors.url && socialFormErrors.url.length > 0 && (
                <p className={adminErrorClass}>
                  {socialFormErrors.url.join(", ")}
                </p>
              )}
            </div>

            <div className="flex gap-2 border-t border-zinc-100 pt-3">
              <button
                type="submit"
                disabled={socialSubmitting}
                className={adminButtonClass("primary", "md", "flex-1")}
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
                  onClick={resetSocialForm}
                  disabled={socialSubmitting}
                  className={adminButtonClass("secondary", "md")}
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Tautan Sosial"
        message={`Hapus tautan ${deleteTarget?.platform}?`}
        onConfirm={() => void handleSocialDelete()}
        onCancel={() => setDeleteTarget(null)}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
