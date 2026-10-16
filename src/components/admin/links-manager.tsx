"use client";

import { useEffect, useState } from "react";

// ===== Types =====
interface SocialLink {
  id: number;
  platform: string;
  url: string;
  sortOrder: number;
}

interface DownloadLink {
  id: number;
  platform: string;
  label: string;
  url: string;
  sortOrder: number;
}

interface Settings {
  emailKontak: string | null;
}

interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  message?: string;
  fields?: Record<string, string[]>;
}

// ===== Component =====
export function LinksManager() {
  // ===== State: Social Links =====
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

  // ===== State: Download Links =====
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([]);
  const [downloadLoading, setDownloadLoading] = useState(true);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadForm, setDownloadForm] = useState({
    platform: "",
    label: "",
    url: "",
    sortOrder: 0,
  });
  const [downloadEditingId, setDownloadEditingId] = useState<number | null>(
    null,
  );
  const [downloadFormErrors, setDownloadFormErrors] = useState<
    Record<string, string[]>
  >({});
  const [downloadSubmitting, setDownloadSubmitting] = useState(false);

  // ===== State: Email Kontak =====
  const [emailKontak, setEmailKontak] = useState("");
  const [emailLoading, setEmailLoading] = useState(true);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailFormErrors, setEmailFormErrors] = useState<
    Record<string, string[]>
  >({});
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  // ===== Load Data =====
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

  const loadDownloadLinks = async () => {
    setDownloadLoading(true);
    setDownloadError(null);
    try {
      const res = await fetch("/api/download-links");
      const json = (await res.json()) as ApiResponse<DownloadLink[]>;
      if (!json.ok) {
        setDownloadError(json.message || "Gagal memuat tautan unduhan");
        return;
      }
      setDownloadLinks(json.data || []);
    } catch (err) {
      setDownloadError("Gagal memuat tautan unduhan");
      console.error(err);
    } finally {
      setDownloadLoading(false);
    }
  };

  const loadSettings = async () => {
    setEmailLoading(true);
    setEmailError(null);
    try {
      const res = await fetch("/api/settings");
      const json = (await res.json()) as ApiResponse<Settings>;
      if (!json.ok) {
        setEmailError(json.message || "Gagal memuat pengaturan");
        return;
      }
      const settings: Settings = json.data!;
      setEmailKontak(settings.emailKontak || "");
    } catch (err) {
      setEmailError("Gagal memuat pengaturan");
      console.error(err);
    } finally {
      setEmailLoading(false);
    }
  };

  useEffect(() => {
    // Data fetching on mount is a valid pattern
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void Promise.all([loadSocialLinks(), loadDownloadLinks(), loadSettings()]);
  }, []);

  // ===== Social Links Handlers =====
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

  const handleSocialCancelEdit = () => {
    setSocialForm({ platform: "", url: "", sortOrder: 0 });
    setSocialEditingId(null);
    setSocialFormErrors({});
  };

  const handleSocialDelete = async (id: number) => {
    if (!window.confirm("Hapus tautan sosial ini?")) return;

    try {
      const res = await fetch(`/api/social-links/${id}`, { method: "DELETE" });
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

  // ===== Download Links Handlers =====
  const handleDownloadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDownloadFormErrors({});
    setDownloadSubmitting(true);

    try {
      const url = downloadEditingId
        ? `/api/download-links/${downloadEditingId}`
        : "/api/download-links";
      const method = downloadEditingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(downloadForm),
      });

      const json = (await res.json()) as ApiResponse;

      if (!json.ok) {
        if (json.fields) {
          setDownloadFormErrors(json.fields);
        } else {
          setDownloadError(json.message || "Gagal menyimpan tautan unduhan");
        }
        return;
      }

      setDownloadForm({ platform: "", label: "", url: "", sortOrder: 0 });
      setDownloadEditingId(null);
      setDownloadFormErrors({});
      await loadDownloadLinks();
    } catch (err) {
      setDownloadError("Gagal menyimpan tautan unduhan");
      console.error(err);
    } finally {
      setDownloadSubmitting(false);
    }
  };

  const handleDownloadEdit = (item: DownloadLink) => {
    setDownloadForm({
      platform: item.platform,
      label: item.label,
      url: item.url,
      sortOrder: item.sortOrder,
    });
    setDownloadEditingId(item.id);
    setDownloadFormErrors({});
  };

  const handleDownloadCancelEdit = () => {
    setDownloadForm({ platform: "", label: "", url: "", sortOrder: 0 });
    setDownloadEditingId(null);
    setDownloadFormErrors({});
  };

  const handleDownloadDelete = async (id: number) => {
    if (!window.confirm("Hapus tautan unduhan ini?")) return;

    try {
      const res = await fetch(`/api/download-links/${id}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as ApiResponse;

      if (!json.ok) {
        setDownloadError(json.message || "Gagal menghapus tautan unduhan");
        return;
      }

      await loadDownloadLinks();
    } catch (err) {
      setDownloadError("Gagal menghapus tautan unduhan");
      console.error(err);
    }
  };

  // ===== Email Kontak Handler =====
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailFormErrors({});
    setEmailSubmitting(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // String kosong tetap dikirim agar API mengubahnya menjadi null
        body: JSON.stringify({ emailKontak: emailKontak || "" }),
      });

      const json = (await res.json()) as ApiResponse;

      if (!json.ok) {
        if (json.fields) {
          setEmailFormErrors(json.fields);
        } else {
          setEmailError(json.message || "Gagal menyimpan email kontak");
        }
        return;
      }

      setEmailFormErrors({});
      await loadSettings();
    } catch (err) {
      setEmailError("Gagal menyimpan email kontak");
      console.error(err);
    } finally {
      setEmailSubmitting(false);
    }
  };

  return (
    <div>
      {/* ===== Section: Tautan Unduhan ===== */}
      <section style={{ marginBottom: "3rem" }}>
        <h2>Tautan Unduhan</h2>
        <p style={{ color: "#666", marginBottom: "1rem" }}>
          Daftar kosong akan menampilkan &quot;Segera Hadir&quot; di halaman
          publik.
        </p>

        {downloadError && (
          <div
            style={{
              padding: "1rem",
              background: "#fee",
              marginBottom: "1rem",
            }}
          >
            {downloadError}
          </div>
        )}

        {downloadLoading ? (
          <p>Memuat tautan unduhan...</p>
        ) : (
          <>
            <form
              onSubmit={handleDownloadSubmit}
              style={{ marginBottom: "2rem" }}
            >
              <h3>
                {downloadEditingId
                  ? "Edit Tautan Unduhan"
                  : "Tambah Tautan Unduhan"}
              </h3>

              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="download-platform">Platform</label>
                <input
                  id="download-platform"
                  type="text"
                  value={downloadForm.platform}
                  onChange={(e) =>
                    setDownloadForm((prev) => ({
                      ...prev,
                      platform: e.target.value,
                    }))
                  }
                  disabled={downloadSubmitting}
                  style={{ display: "block", width: "100%", padding: "0.5rem" }}
                />
                {downloadFormErrors.platform && (
                  <div style={{ color: "red", fontSize: "0.875rem" }}>
                    {downloadFormErrors.platform.join(", ")}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="download-label">Label</label>
                <input
                  id="download-label"
                  type="text"
                  value={downloadForm.label}
                  onChange={(e) =>
                    setDownloadForm((prev) => ({
                      ...prev,
                      label: e.target.value,
                    }))
                  }
                  disabled={downloadSubmitting}
                  style={{ display: "block", width: "100%", padding: "0.5rem" }}
                />
                {downloadFormErrors.label && (
                  <div style={{ color: "red", fontSize: "0.875rem" }}>
                    {downloadFormErrors.label.join(", ")}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="download-url">URL</label>
                <input
                  id="download-url"
                  type="url"
                  value={downloadForm.url}
                  onChange={(e) =>
                    setDownloadForm((prev) => ({
                      ...prev,
                      url: e.target.value,
                    }))
                  }
                  disabled={downloadSubmitting}
                  style={{ display: "block", width: "100%", padding: "0.5rem" }}
                />
                {downloadFormErrors.url && (
                  <div style={{ color: "red", fontSize: "0.875rem" }}>
                    {downloadFormErrors.url.join(", ")}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="download-sortOrder">Urutan</label>
                <input
                  id="download-sortOrder"
                  type="number"
                  value={downloadForm.sortOrder}
                  onChange={(e) =>
                    setDownloadForm((prev) => ({
                      ...prev,
                      sortOrder: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  disabled={downloadSubmitting}
                  style={{ display: "block", width: "100%", padding: "0.5rem" }}
                />
                {downloadFormErrors.sortOrder && (
                  <div style={{ color: "red", fontSize: "0.875rem" }}>
                    {downloadFormErrors.sortOrder.join(", ")}
                  </div>
                )}
              </div>

              <div>
                <button type="submit" disabled={downloadSubmitting}>
                  {downloadSubmitting
                    ? "Menyimpan..."
                    : downloadEditingId
                      ? "Simpan Perubahan"
                      : "Tambah"}
                </button>
                {downloadEditingId && (
                  <button
                    type="button"
                    onClick={handleDownloadCancelEdit}
                    disabled={downloadSubmitting}
                    style={{ marginLeft: "0.5rem" }}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>

            {downloadLinks.length === 0 && (
              <p style={{ color: "#666" }}>
                Belum ada tautan unduhan. Status: Segera Hadir.
              </p>
            )}

            {downloadLinks.length > 0 && (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {downloadLinks.map((item) => (
                  <li
                    key={item.id}
                    style={{
                      border: "1px solid #ddd",
                      padding: "1rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div>
                      <strong>Platform:</strong> {item.platform} |{" "}
                      <strong>Label:</strong> {item.label} |{" "}
                      <strong>Urutan:</strong> {item.sortOrder}
                    </div>
                    <div style={{ marginBottom: "0.5rem" }}>
                      <strong>URL:</strong> {item.url}
                    </div>
                    <div>
                      <button onClick={() => handleDownloadEdit(item)}>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDownloadDelete(item.id)}
                        style={{ marginLeft: "0.5rem" }}
                      >
                        Hapus
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      {/* ===== Section: Media Sosial ===== */}
      <section style={{ marginBottom: "3rem" }}>
        <h2>Media Sosial</h2>

        {socialError && (
          <div
            style={{
              padding: "1rem",
              background: "#fee",
              marginBottom: "1rem",
            }}
          >
            {socialError}
          </div>
        )}

        {socialLoading ? (
          <p>Memuat tautan sosial...</p>
        ) : (
          <>
            <form
              onSubmit={handleSocialSubmit}
              style={{ marginBottom: "2rem" }}
            >
              <h3>
                {socialEditingId
                  ? "Edit Tautan Sosial"
                  : "Tambah Tautan Sosial"}
              </h3>

              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="social-platform">Platform</label>
                <input
                  id="social-platform"
                  type="text"
                  value={socialForm.platform}
                  onChange={(e) =>
                    setSocialForm((prev) => ({
                      ...prev,
                      platform: e.target.value,
                    }))
                  }
                  disabled={socialSubmitting}
                  style={{ display: "block", width: "100%", padding: "0.5rem" }}
                />
                {socialFormErrors.platform && (
                  <div style={{ color: "red", fontSize: "0.875rem" }}>
                    {socialFormErrors.platform.join(", ")}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="social-url">URL</label>
                <input
                  id="social-url"
                  type="url"
                  value={socialForm.url}
                  onChange={(e) =>
                    setSocialForm((prev) => ({ ...prev, url: e.target.value }))
                  }
                  disabled={socialSubmitting}
                  style={{ display: "block", width: "100%", padding: "0.5rem" }}
                />
                {socialFormErrors.url && (
                  <div style={{ color: "red", fontSize: "0.875rem" }}>
                    {socialFormErrors.url.join(", ")}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="social-sortOrder">Urutan</label>
                <input
                  id="social-sortOrder"
                  type="number"
                  value={socialForm.sortOrder}
                  onChange={(e) =>
                    setSocialForm((prev) => ({
                      ...prev,
                      sortOrder: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  disabled={socialSubmitting}
                  style={{ display: "block", width: "100%", padding: "0.5rem" }}
                />
                {socialFormErrors.sortOrder && (
                  <div style={{ color: "red", fontSize: "0.875rem" }}>
                    {socialFormErrors.sortOrder.join(", ")}
                  </div>
                )}
              </div>

              <div>
                <button type="submit" disabled={socialSubmitting}>
                  {socialSubmitting
                    ? "Menyimpan..."
                    : socialEditingId
                      ? "Simpan Perubahan"
                      : "Tambah"}
                </button>
                {socialEditingId && (
                  <button
                    type="button"
                    onClick={handleSocialCancelEdit}
                    disabled={socialSubmitting}
                    style={{ marginLeft: "0.5rem" }}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>

            {socialLinks.length === 0 && (
              <p style={{ color: "#666" }}>
                Belum ada tautan media sosial. Tambahkan yang pertama!
              </p>
            )}

            {socialLinks.length > 0 && (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {socialLinks.map((item) => (
                  <li
                    key={item.id}
                    style={{
                      border: "1px solid #ddd",
                      padding: "1rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div>
                      <strong>Platform:</strong> {item.platform} |{" "}
                      <strong>Urutan:</strong> {item.sortOrder}
                    </div>
                    <div style={{ marginBottom: "0.5rem" }}>
                      <strong>URL:</strong> {item.url}
                    </div>
                    <div>
                      <button onClick={() => handleSocialEdit(item)}>
                        Edit
                      </button>
                      <button
                        onClick={() => handleSocialDelete(item.id)}
                        style={{ marginLeft: "0.5rem" }}
                      >
                        Hapus
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      {/* ===== Section: Email Kontak ===== */}
      <section>
        <h2>Email Kontak</h2>

        {emailError && (
          <div
            style={{
              padding: "1rem",
              background: "#fee",
              marginBottom: "1rem",
            }}
          >
            {emailError}
          </div>
        )}

        {emailLoading ? (
          <p>Memuat email kontak...</p>
        ) : (
          <form onSubmit={handleEmailSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="email-kontak">Email Kontak</label>
              <input
                id="email-kontak"
                type="email"
                value={emailKontak}
                onChange={(e) => setEmailKontak(e.target.value)}
                disabled={emailSubmitting}
                style={{ display: "block", width: "100%", padding: "0.5rem" }}
                placeholder="Kosongkan untuk menghapus"
              />
              {emailFormErrors.emailKontak && (
                <div style={{ color: "red", fontSize: "0.875rem" }}>
                  {emailFormErrors.emailKontak.join(", ")}
                </div>
              )}
            </div>

            <button type="submit" disabled={emailSubmitting}>
              {emailSubmitting ? "Menyimpan..." : "Simpan Email Kontak"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
