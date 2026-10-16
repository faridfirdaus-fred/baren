"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  fetchLinksApiResult,
  parseLinksApiResult,
  type DownloadLink,
  type Settings,
  type SocialLink,
} from "@/lib/admin-links-client";
import {
  downloadCreateSchema,
  socialCreateSchema,
  type DownloadCreate,
  type SocialCreate,
} from "@/lib/validation/links";

const emptySocial: SocialCreate = { platform: "", url: "", sortOrder: 0 };
const emptyDownload: DownloadCreate = {
  platform: "",
  label: "",
  url: "",
  sortOrder: 0,
};

type ApiError = { message: string; fields?: Record<string, string[]> };

function addSocialErrors(
  error: ApiError,
  form: ReturnType<typeof useForm<SocialCreate>>,
) {
  if (error.fields?.platform?.[0]) {
    form.setError("platform", {
      type: "server",
      message: error.fields.platform[0],
    });
  }
  if (error.fields?.url?.[0]) {
    form.setError("url", { type: "server", message: error.fields.url[0] });
  }
  if (error.fields?.sortOrder?.[0]) {
    form.setError("sortOrder", {
      type: "server",
      message: error.fields.sortOrder[0],
    });
  }
  form.setError("root", { type: "server", message: error.message });
}

function addDownloadErrors(
  error: ApiError,
  form: ReturnType<typeof useForm<DownloadCreate>>,
) {
  if (error.fields?.platform?.[0]) {
    form.setError("platform", {
      type: "server",
      message: error.fields.platform[0],
    });
  }
  if (error.fields?.label?.[0]) {
    form.setError("label", { type: "server", message: error.fields.label[0] });
  }
  if (error.fields?.url?.[0]) {
    form.setError("url", { type: "server", message: error.fields.url[0] });
  }
  if (error.fields?.sortOrder?.[0]) {
    form.setError("sortOrder", {
      type: "server",
      message: error.fields.sortOrder[0],
    });
  }
  form.setError("root", { type: "server", message: error.message });
}

export function AdminLinksManager() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[] | null>(null);
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[] | null>(
    null,
  );
  const [socialError, setSocialError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [socialEditing, setSocialEditing] = useState<SocialLink | null>(null);
  const [downloadEditing, setDownloadEditing] = useState<DownloadLink | null>(
    null,
  );
  const [deleting, setDeleting] = useState<string | null>(null);
  const socialForm = useForm<SocialCreate>({
    resolver: zodResolver(socialCreateSchema),
    defaultValues: emptySocial,
  });
  const downloadForm = useForm<DownloadCreate>({
    resolver: zodResolver(downloadCreateSchema),
    defaultValues: emptyDownload,
  });
  const emailForm = useForm<{ emailKontak: string }>({
    defaultValues: { emailKontak: "" },
  });

  const loadSocial = useCallback(async () => {
    setSocialError(null);
    const result = await fetchLinksApiResult<SocialLink[]>(
      (path) => fetch(path, { cache: "no-store" }),
      "/api/social-links",
    );
    if (result.ok) setSocialLinks(result.data);
    else setSocialError(result.error.message);
  }, []);

  const loadDownloads = useCallback(async () => {
    setDownloadError(null);
    const result = await fetchLinksApiResult<DownloadLink[]>(
      (path) => fetch(path, { cache: "no-store" }),
      "/api/download-links",
    );
    if (result.ok) setDownloadLinks(result.data);
    else setDownloadError(result.error.message);
  }, []);

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    const result = await fetchLinksApiResult<Settings>(
      (path) => fetch(path, { cache: "no-store" }),
      "/api/settings",
    );
    if (result.ok) {
      emailForm.reset({ emailKontak: result.data.emailKontak ?? "" });
    } else {
      setSettingsError(result.error.message);
    }
    setSettingsLoading(false);
  }, [emailForm]);

  const load = useCallback(
    async () => Promise.all([loadSocial(), loadDownloads(), loadSettings()]),
    [loadDownloads, loadSettings, loadSocial],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  function resetSocial() {
    setSocialEditing(null);
    socialForm.clearErrors();
    socialForm.reset(emptySocial);
  }

  function resetDownload() {
    setDownloadEditing(null);
    downloadForm.clearErrors();
    downloadForm.reset(emptyDownload);
  }

  async function saveSocial(values: SocialCreate) {
    socialForm.clearErrors("root");
    try {
      const response = await fetch(
        socialEditing
          ? `/api/social-links/${socialEditing.id}`
          : "/api/social-links",
        {
          method: socialEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );
      const result = parseLinksApiResult<SocialLink>(await response.json());
      if (!result.ok) {
        addSocialErrors(result.error, socialForm);
        return;
      }
      resetSocial();
      await loadSocial();
    } catch {
      socialForm.setError("root", {
        type: "server",
        message: "Tautan sosial tidak dapat disimpan. Coba lagi.",
      });
    }
  }

  async function saveDownload(values: DownloadCreate) {
    downloadForm.clearErrors("root");
    try {
      const response = await fetch(
        downloadEditing
          ? `/api/download-links/${downloadEditing.id}`
          : "/api/download-links",
        {
          method: downloadEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );
      const result = parseLinksApiResult<DownloadLink>(await response.json());
      if (!result.ok) {
        addDownloadErrors(result.error, downloadForm);
        return;
      }
      resetDownload();
      await loadDownloads();
    } catch {
      downloadForm.setError("root", {
        type: "server",
        message: "Tautan unduhan tidak dapat disimpan. Coba lagi.",
      });
    }
  }

  function editSocial(item: SocialLink) {
    setSocialEditing(item);
    socialForm.clearErrors();
    socialForm.reset({
      platform: item.platform,
      url: item.url,
      sortOrder: item.sortOrder,
    });
  }

  function editDownload(item: DownloadLink) {
    setDownloadEditing(item);
    downloadForm.clearErrors();
    downloadForm.reset({
      platform: item.platform,
      label: item.label,
      url: item.url,
      sortOrder: item.sortOrder,
    });
  }

  async function deleteLink(
    path: "/api/social-links" | "/api/download-links",
    item: SocialLink | DownloadLink,
  ) {
    if (!window.confirm(`Hapus tautan ${item.platform}?`)) return;
    const key = `${path}-${item.id}`;
    setDeleting(key);
    if (path === "/api/social-links") setSocialError(null);
    else setDownloadError(null);
    try {
      const response = await fetch(`${path}/${item.id}`, { method: "DELETE" });
      const result = parseLinksApiResult<SocialLink | DownloadLink>(
        await response.json(),
      );
      if (!result.ok) {
        if (path === "/api/social-links") setSocialError(result.error.message);
        else setDownloadError(result.error.message);
        return;
      }
      if (path === "/api/social-links" && socialEditing?.id === item.id)
        resetSocial();
      if (path === "/api/download-links" && downloadEditing?.id === item.id) {
        resetDownload();
      }
      if (path === "/api/social-links") await loadSocial();
      else await loadDownloads();
    } catch {
      if (path === "/api/social-links") {
        setSocialError("Tautan sosial tidak dapat dihapus. Coba lagi.");
      } else {
        setDownloadError("Tautan unduhan tidak dapat dihapus. Coba lagi.");
      }
    } finally {
      setDeleting(null);
    }
  }

  async function saveEmail(values: { emailKontak: string }) {
    setSettingsError(null);
    emailForm.clearErrors("root");
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = parseLinksApiResult<Settings>(await response.json());
      if (!result.ok) {
        if (result.error.fields?.emailKontak?.[0]) {
          emailForm.setError("emailKontak", {
            type: "server",
            message: result.error.fields.emailKontak[0],
          });
        }
        emailForm.setError("root", {
          type: "server",
          message: result.error.message,
        });
        return;
      }
      emailForm.reset({ emailKontak: result.data.emailKontak ?? "" });
    } catch {
      emailForm.setError("root", {
        type: "server",
        message: "Email kontak tidak dapat disimpan. Coba lagi.",
      });
    }
  }

  return (
    <div className="grid max-w-4xl gap-8">
      <section aria-labelledby="links-heading">
        <h1 id="links-heading">Tautan dan kontak</h1>
        <form
          onSubmit={emailForm.handleSubmit(saveEmail)}
          noValidate
          className="mt-4 grid gap-4"
        >
          <div>
            <label htmlFor="contact-email">Email kontak</label>
            <input
              id="contact-email"
              type="email"
              {...emailForm.register("emailKontak")}
              aria-invalid={Boolean(emailForm.formState.errors.emailKontak)}
              aria-describedby={
                emailForm.formState.errors.emailKontak
                  ? "contact-email-error"
                  : "contact-email-help"
              }
            />
            <p id="contact-email-help">
              Kosongkan lalu simpan untuk menghapus email kontak.
            </p>
            {emailForm.formState.errors.emailKontak ? (
              <p id="contact-email-error" role="alert">
                {emailForm.formState.errors.emailKontak.message}
              </p>
            ) : null}
          </div>
          {emailForm.formState.errors.root ? (
            <p role="alert">{emailForm.formState.errors.root.message}</p>
          ) : null}
          <div>
            <button type="submit" disabled={emailForm.formState.isSubmitting}>
              {emailForm.formState.isSubmitting
                ? "Menyimpan..."
                : "Simpan email"}
            </button>
          </div>
        </form>
        {settingsLoading ? <p>Memuat email kontak...</p> : null}
        {settingsError ? (
          <div role="alert">
            <p>{settingsError}</p>
            <button type="button" onClick={() => void loadSettings()}>
              Coba lagi
            </button>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="social-links-heading" className="grid gap-4">
        <h2 id="social-links-heading">Tautan sosial</h2>
        <form
          onSubmit={socialForm.handleSubmit(saveSocial)}
          noValidate
          className="grid gap-4"
        >
          <div>
            <label htmlFor="social-platform">Platform</label>
            <input
              id="social-platform"
              type="text"
              {...socialForm.register("platform")}
              aria-invalid={Boolean(socialForm.formState.errors.platform)}
            />
            {socialForm.formState.errors.platform ? (
              <p role="alert">{socialForm.formState.errors.platform.message}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="social-url">URL</label>
            <input
              id="social-url"
              type="url"
              {...socialForm.register("url")}
              aria-invalid={Boolean(socialForm.formState.errors.url)}
            />
            {socialForm.formState.errors.url ? (
              <p role="alert">{socialForm.formState.errors.url.message}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="social-sort-order">Urutan</label>
            <input
              id="social-sort-order"
              type="number"
              min={0}
              step={1}
              {...socialForm.register("sortOrder", { valueAsNumber: true })}
              aria-invalid={Boolean(socialForm.formState.errors.sortOrder)}
            />
            {socialForm.formState.errors.sortOrder ? (
              <p role="alert">
                {socialForm.formState.errors.sortOrder.message}
              </p>
            ) : null}
          </div>
          {socialForm.formState.errors.root ? (
            <p role="alert">{socialForm.formState.errors.root.message}</p>
          ) : null}
          <div className="flex gap-4">
            <button type="submit" disabled={socialForm.formState.isSubmitting}>
              {socialForm.formState.isSubmitting
                ? "Menyimpan..."
                : socialEditing
                  ? "Simpan perubahan"
                  : "Tambah tautan sosial"}
            </button>
            {socialEditing ? (
              <button
                type="button"
                onClick={resetSocial}
                disabled={socialForm.formState.isSubmitting}
              >
                Batal
              </button>
            ) : null}
          </div>
        </form>
        {socialLinks === null && !socialError ? (
          <p>Memuat tautan sosial...</p>
        ) : null}
        {socialError ? (
          <div role="alert">
            <p>{socialError}</p>
            <button type="button" onClick={() => void loadSocial()}>
              Coba lagi
            </button>
          </div>
        ) : null}
        {socialLinks?.length === 0 && !socialError ? (
          <p>Belum ada tautan sosial.</p>
        ) : null}
        {socialLinks && socialLinks.length > 0 ? (
          <ul className="grid gap-4">
            {socialLinks.map((item) => (
              <li key={item.id}>
                <article>
                  <h3>{item.platform}</h3>
                  <p>{item.url}</p>
                  <p>Urutan: {item.sortOrder}</p>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => editSocial(item)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteLink("/api/social-links", item)}
                      disabled={deleting === `/api/social-links-${item.id}`}
                    >
                      {deleting === `/api/social-links-${item.id}`
                        ? "Menghapus..."
                        : "Hapus"}
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section aria-labelledby="download-links-heading" className="grid gap-4">
        <h2 id="download-links-heading">Tautan unduhan</h2>
        <form
          onSubmit={downloadForm.handleSubmit(saveDownload)}
          noValidate
          className="grid gap-4"
        >
          <div>
            <label htmlFor="download-platform">Platform</label>
            <input
              id="download-platform"
              type="text"
              {...downloadForm.register("platform")}
              aria-invalid={Boolean(downloadForm.formState.errors.platform)}
            />
            {downloadForm.formState.errors.platform ? (
              <p role="alert">
                {downloadForm.formState.errors.platform.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="download-label">Label</label>
            <input
              id="download-label"
              type="text"
              {...downloadForm.register("label")}
              aria-invalid={Boolean(downloadForm.formState.errors.label)}
            />
            {downloadForm.formState.errors.label ? (
              <p role="alert">{downloadForm.formState.errors.label.message}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="download-url">URL</label>
            <input
              id="download-url"
              type="url"
              {...downloadForm.register("url")}
              aria-invalid={Boolean(downloadForm.formState.errors.url)}
            />
            {downloadForm.formState.errors.url ? (
              <p role="alert">{downloadForm.formState.errors.url.message}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="download-sort-order">Urutan</label>
            <input
              id="download-sort-order"
              type="number"
              min={0}
              step={1}
              {...downloadForm.register("sortOrder", { valueAsNumber: true })}
              aria-invalid={Boolean(downloadForm.formState.errors.sortOrder)}
            />
            {downloadForm.formState.errors.sortOrder ? (
              <p role="alert">
                {downloadForm.formState.errors.sortOrder.message}
              </p>
            ) : null}
          </div>
          {downloadForm.formState.errors.root ? (
            <p role="alert">{downloadForm.formState.errors.root.message}</p>
          ) : null}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={downloadForm.formState.isSubmitting}
            >
              {downloadForm.formState.isSubmitting
                ? "Menyimpan..."
                : downloadEditing
                  ? "Simpan perubahan"
                  : "Tambah tautan unduhan"}
            </button>
            {downloadEditing ? (
              <button
                type="button"
                onClick={resetDownload}
                disabled={downloadForm.formState.isSubmitting}
              >
                Batal
              </button>
            ) : null}
          </div>
        </form>
        {downloadLinks === null && !downloadError ? (
          <p>Memuat tautan unduhan...</p>
        ) : null}
        {downloadError ? (
          <div role="alert">
            <p>{downloadError}</p>
            <button type="button" onClick={() => void loadDownloads()}>
              Coba lagi
            </button>
          </div>
        ) : null}
        {downloadLinks?.length === 0 && !downloadError ? (
          <p>Belum ada tautan unduhan. Game tetap Segera Hadir.</p>
        ) : null}
        {downloadLinks && downloadLinks.length > 0 ? (
          <ul className="grid gap-4">
            {downloadLinks.map((item) => (
              <li key={item.id}>
                <article>
                  <h3>{item.platform}</h3>
                  <p>{item.label}</p>
                  <p>{item.url}</p>
                  <p>Urutan: {item.sortOrder}</p>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => editDownload(item)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void deleteLink("/api/download-links", item)
                      }
                      disabled={deleting === `/api/download-links-${item.id}`}
                    >
                      {deleting === `/api/download-links-${item.id}`
                        ? "Menghapus..."
                        : "Hapus"}
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
