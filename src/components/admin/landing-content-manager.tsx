"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { AssetUploader } from "./asset-uploader";
import { adminButtonClass } from "./button-styles";
import {
  adminInputClass,
  adminTextareaClass,
  adminLabelClass,
  adminErrorClass,
} from "./form-styles";
import { Toast } from "./toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { UploadedAsset } from "@/lib/assets-client";
import { resolvePublicAssetUrl } from "@/lib/assets-url";

type SectionKey =
  "about" | "features" | "howToPlay" | "gallery" | "news" | "faqComments";

interface AboutState {
  title: string;
  body: string;
  imageUrl: string;
}

interface LandingSettingsState {
  featuresEyebrow: string;
  featuresTitle: string;
  howToPlayTitle: string;
  galleryEyebrow: string;
  galleryTitle: string;
  galleryDescription: string;
  newsTitle: string;
  newsCtaLabel: string;
  faqEyebrow: string;
  faqTitle: string;
  commentsTitle: string;
  emailKontak: string;
}

const defaultSettings: LandingSettingsState = {
  featuresEyebrow: "",
  featuresTitle: "",
  howToPlayTitle: "",
  galleryEyebrow: "",
  galleryTitle: "",
  galleryDescription: "",
  newsTitle: "",
  newsCtaLabel: "",
  faqEyebrow: "",
  faqTitle: "",
  commentsTitle: "",
  emailKontak: "",
};

const defaultAbout: AboutState = {
  title: "Adu strategi Bebentengan dalam satu layar",
  body: "BAREN terinspirasi dari permainan tradisional Baren atau Bebentengan. Dua tim beranggotakan dua pemain berlomba menjaga markas sendiri sambil menyusup ke wilayah lawan dalam satu layar bersama.",
  imageUrl: "/art/about-art.jpg",
};

interface ApiResponse {
  ok: boolean;
  data?: Record<string, unknown>;
  message?: string;
  fields?: Record<string, string[]>;
}

const SECTIONS: Array<{
  key: SectionKey;
  title: string;
  desc: string;
}> = [
  {
    key: "about",
    title: "Tentang Game",
    desc: "Judul, cerita konsep permainan, dan gambar seksi Tentang Game",
  },
  {
    key: "features",
    title: "Seksi Fitur",
    desc: "Label atas dan judul seksi Fitur Game",
  },
  {
    key: "howToPlay",
    title: "Seksi Cara Bermain",
    desc: "Judul pengantar seksi panduan bermain",
  },
  {
    key: "gallery",
    title: "Seksi Galeri",
    desc: "Label, judul, dan pengantar singkat Galeri",
  },
  {
    key: "news",
    title: "Seksi Berita & Event",
    desc: "Judul seksi berita dan teks tombol lihat semua",
  },
  {
    key: "faqComments",
    title: "FAQ, Komentar & Kontak",
    desc: "Judul FAQ, judul komentar, serta email kontak footer",
  },
];

export function LandingContentManager() {
  const [activeSection, setActiveSection] = useState<SectionKey>("about");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aboutData, setAboutData] = useState<AboutState>(defaultAbout);
  const [formData, setFormData] =
    useState<LandingSettingsState>(defaultSettings);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsRes, aboutRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/about"),
      ]);
      const settingsJson = (await settingsRes.json()) as ApiResponse;
      const aboutJson = (await aboutRes.json()) as ApiResponse;

      if (!settingsJson.ok) {
        setError(settingsJson.message || "Gagal memuat pengaturan seksi");
        return;
      }
      const d = (settingsJson.data || {}) as Record<string, string | null>;
      setFormData({
        featuresEyebrow: d.featuresEyebrow || "",
        featuresTitle: d.featuresTitle || "",
        howToPlayTitle: d.howToPlayTitle || "",
        galleryEyebrow: d.galleryEyebrow || "",
        galleryTitle: d.galleryTitle || "",
        galleryDescription: d.galleryDescription || "",
        newsTitle: d.newsTitle || "",
        newsCtaLabel: d.newsCtaLabel || "",
        faqEyebrow: d.faqEyebrow || "",
        faqTitle: d.faqTitle || "",
        commentsTitle: d.commentsTitle || "",
        emailKontak: d.emailKontak || "",
      });

      const a = (aboutJson.data?.about || null) as Partial<AboutState> | null;
      if (a && a.title) {
        setAboutData({
          title: a.title,
          body: a.body || defaultAbout.body,
          imageUrl: a.imageUrl || defaultAbout.imageUrl,
        });
      }
    } catch (err) {
      setError("Gagal memuat pengaturan seksi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAll();
  }, []);

  const handleAboutImageUploaded = (asset: UploadedAsset) => {
    setAboutData((prev) => ({ ...prev, imageUrl: asset.publicUrl }));
    setToast({
      message: "Gambar Tentang Game diunggah. Klik Simpan untuk menerapkan.",
      type: "success",
    });
  };

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});
    try {
      const res = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: aboutData.title.trim(),
          body: aboutData.body.trim(),
          imageUrl: aboutData.imageUrl.trim() || "/art/about-art.jpg",
        }),
      });
      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        if (json.fields) setFormErrors(json.fields);
        setToast({
          message: json.message || "Gagal menyimpan seksi Tentang Game",
          type: "error",
        });
        return;
      }
      setToast({
        message: "Seksi Tentang Game berhasil disimpan",
        type: "success",
      });
    } catch {
      setToast({ message: "Terjadi kesalahan jaringan", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    // Hanya kirim field wajib bila tidak kosong, atau fallback rapi
    const payload: Record<string, string> = {
      featuresEyebrow: formData.featuresEyebrow,
      featuresTitle:
        formData.featuresTitle.trim() || "Kenapa BAREN seru dimainkan?",
      howToPlayTitle:
        formData.howToPlayTitle.trim() || "Mudah dipelajari dalam semenit",
      galleryEyebrow: formData.galleryEyebrow,
      galleryTitle:
        formData.galleryTitle.trim() || "Intip serunya kampung BAREN",
      galleryDescription: formData.galleryDescription,
      newsTitle: formData.newsTitle.trim() || "Kabar & Event BAREN",
      newsCtaLabel: formData.newsCtaLabel.trim() || "Semua Berita",
      faqEyebrow: formData.faqEyebrow,
      faqTitle: formData.faqTitle.trim() || "Pertanyaan yang sering muncul",
      commentsTitle: formData.commentsTitle.trim() || "Bagaimana pendapatmu?",
      emailKontak: formData.emailKontak.trim(),
    };

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        if (json.fields) setFormErrors(json.fields);
        setToast({
          message: json.message || "Gagal menyimpan perubahan",
          type: "error",
        });
        return;
      }
      setToast({
        message: "Judul & teks seksi berhasil disimpan",
        type: "success",
      });
    } catch {
      setToast({ message: "Terjadi kesalahan jaringan", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="space-y-6"
        role="status"
        aria-label="Memuat konten landing"
      >
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-2.5 lg:col-span-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-2xl lg:col-span-7" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        <p>{error}</p>
        <button
          type="button"
          onClick={() => void loadAll()}
          className={adminButtonClass("secondary", "md", "mt-4")}
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Kelola Konten Landing
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Pilih seksi di sebelah kiri untuk mengubah judul atau pengantarnya
            dengan cepat.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={adminButtonClass("secondary", "md")}
        >
          <ExternalLink className="h-4 w-4 text-zinc-400" />
          <span>Lihat Beranda</span>
        </a>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Pemilih Seksi */}
        <nav
          aria-label="Daftar seksi beranda"
          className="flex flex-col gap-2.5 lg:col-span-5"
        >
          {SECTIONS.map((sec) => {
            const isSelected = activeSection === sec.key;
            return (
              <button
                key={sec.key}
                type="button"
                onClick={() => {
                  setActiveSection(sec.key);
                  setFormErrors({});
                }}
                className={`flex cursor-pointer flex-col items-start rounded-2xl border bg-white p-4 text-left transition-all ${
                  isSelected
                    ? "border-zinc-900 ring-2 ring-zinc-900/10"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <span className="text-sm font-semibold text-zinc-900">
                  {sec.title}
                </span>
                <span className="mt-0.5 text-xs text-zinc-500">{sec.desc}</span>
              </button>
            );
          })}
        </nav>

        {/* Form Seksi Terpilih */}
        <div className="lg:col-span-7">
          {activeSection === "about" ? (
            <form
              onSubmit={handleSaveAbout}
              className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"
            >
              <h2 className="border-b border-zinc-100 pb-3 text-base font-bold text-zinc-900">
                Tentang Game
              </h2>
              <div>
                <label htmlFor="about-title" className={adminLabelClass}>
                  Judul Seksi *
                </label>
                <input
                  id="about-title"
                  type="text"
                  required
                  value={aboutData.title}
                  onChange={(e) =>
                    setAboutData({ ...aboutData, title: e.target.value })
                  }
                  placeholder="Adu strategi Bebentengan dalam satu layar"
                  className={adminInputClass}
                />
                {formErrors.title && (
                  <p className={adminErrorClass}>{formErrors.title[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="about-body" className={adminLabelClass}>
                  Cerita / Konsep Permainan *
                </label>
                <textarea
                  id="about-body"
                  rows={4}
                  required
                  value={aboutData.body}
                  onChange={(e) =>
                    setAboutData({ ...aboutData, body: e.target.value })
                  }
                  placeholder="Jelaskan konsep 2 vs 2 benteng-bentengan BAREN..."
                  className={adminTextareaClass}
                />
                {formErrors.body && (
                  <p className={adminErrorClass}>{formErrors.body[0]}</p>
                )}
              </div>

              <div>
                <span className={adminLabelClass}>Gambar Gameplay</span>
                {aboutData.imageUrl && (
                  <div className="relative mb-2.5 aspect-video w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                    <Image
                      src={
                        resolvePublicAssetUrl(aboutData.imageUrl) ||
                        aboutData.imageUrl
                      }
                      alt="Pratinjau Tentang Game"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <AssetUploader
                  purpose="landing-image"
                  onUploaded={handleAboutImageUploaded}
                  disabled={submitting}
                />
              </div>

              <div className="border-t border-zinc-100 pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className={adminButtonClass("primary", "md")}
                >
                  {submitting ? "Menyimpan..." : "Simpan Tentang Game"}
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleSaveSettings}
              className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"
            >
              {activeSection === "features" && (
                <>
                  <h2 className="border-b border-zinc-100 pb-3 text-base font-bold text-zinc-900">
                    Judul Seksi Fitur
                  </h2>
                  <div>
                    <label
                      htmlFor="featuresEyebrow"
                      className={adminLabelClass}
                    >
                      Label Kecil di Atas Judul
                    </label>
                    <input
                      id="featuresEyebrow"
                      type="text"
                      value={formData.featuresEyebrow}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          featuresEyebrow: e.target.value,
                        })
                      }
                      placeholder="FITUR GAME"
                      className={adminInputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="featuresTitle" className={adminLabelClass}>
                      Judul Seksi Fitur
                    </label>
                    <input
                      id="featuresTitle"
                      type="text"
                      value={formData.featuresTitle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          featuresTitle: e.target.value,
                        })
                      }
                      placeholder="Kenapa BAREN seru dimainkan?"
                      className={adminInputClass}
                    />
                  </div>
                </>
              )}

              {activeSection === "howToPlay" && (
                <>
                  <h2 className="border-b border-zinc-100 pb-3 text-base font-bold text-zinc-900">
                    Judul Seksi Cara Bermain
                  </h2>
                  <div>
                    <label htmlFor="howToPlayTitle" className={adminLabelClass}>
                      Judul Seksi Cara Bermain
                    </label>
                    <input
                      id="howToPlayTitle"
                      type="text"
                      value={formData.howToPlayTitle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          howToPlayTitle: e.target.value,
                        })
                      }
                      placeholder="Mudah dipelajari dalam semenit"
                      className={adminInputClass}
                    />
                  </div>
                </>
              )}

              {activeSection === "gallery" && (
                <>
                  <h2 className="border-b border-zinc-100 pb-3 text-base font-bold text-zinc-900">
                    Judul & Pengantar Galeri
                  </h2>
                  <div>
                    <label htmlFor="galleryEyebrow" className={adminLabelClass}>
                      Label Kecil Galeri
                    </label>
                    <input
                      id="galleryEyebrow"
                      type="text"
                      value={formData.galleryEyebrow}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          galleryEyebrow: e.target.value,
                        })
                      }
                      placeholder="GALERI"
                      className={adminInputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="galleryTitle" className={adminLabelClass}>
                      Judul Seksi Galeri
                    </label>
                    <input
                      id="galleryTitle"
                      type="text"
                      value={formData.galleryTitle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          galleryTitle: e.target.value,
                        })
                      }
                      placeholder="Intip serunya kampung BAREN"
                      className={adminInputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="galleryDescription"
                      className={adminLabelClass}
                    >
                      Deskripsi Pengantar Galeri
                    </label>
                    <textarea
                      id="galleryDescription"
                      rows={3}
                      value={formData.galleryDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          galleryDescription: e.target.value,
                        })
                      }
                      placeholder="Tangkapan layar langsung dari arena permainan dan dokumentasi event BAREN."
                      className={adminTextareaClass}
                    />
                  </div>
                </>
              )}

              {activeSection === "news" && (
                <>
                  <h2 className="border-b border-zinc-100 pb-3 text-base font-bold text-zinc-900">
                    Judul Seksi Berita & Event
                  </h2>
                  <div>
                    <label htmlFor="newsTitle" className={adminLabelClass}>
                      Judul Seksi Berita
                    </label>
                    <input
                      id="newsTitle"
                      type="text"
                      value={formData.newsTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, newsTitle: e.target.value })
                      }
                      placeholder="Kabar & Event BAREN"
                      className={adminInputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="newsCtaLabel" className={adminLabelClass}>
                      Teks Tombol Lihat Semua
                    </label>
                    <input
                      id="newsCtaLabel"
                      type="text"
                      value={formData.newsCtaLabel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newsCtaLabel: e.target.value,
                        })
                      }
                      placeholder="Semua Berita"
                      className={adminInputClass}
                    />
                  </div>
                </>
              )}

              {activeSection === "faqComments" && (
                <>
                  <h2 className="border-b border-zinc-100 pb-3 text-base font-bold text-zinc-900">
                    FAQ, Komentar & Email Kontak
                  </h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="faqEyebrow" className={adminLabelClass}>
                        Label Kecil FAQ
                      </label>
                      <input
                        id="faqEyebrow"
                        type="text"
                        value={formData.faqEyebrow}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            faqEyebrow: e.target.value,
                          })
                        }
                        placeholder="FAQ"
                        className={adminInputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="faqTitle" className={adminLabelClass}>
                        Judul Seksi FAQ
                      </label>
                      <input
                        id="faqTitle"
                        type="text"
                        value={formData.faqTitle}
                        onChange={(e) =>
                          setFormData({ ...formData, faqTitle: e.target.value })
                        }
                        placeholder="Pertanyaan yang sering muncul"
                        className={adminInputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="commentsTitle" className={adminLabelClass}>
                      Judul Seksi Komentar
                    </label>
                    <input
                      id="commentsTitle"
                      type="text"
                      value={formData.commentsTitle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          commentsTitle: e.target.value,
                        })
                      }
                      placeholder="Bagaimana pendapatmu?"
                      className={adminInputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="emailKontak" className={adminLabelClass}>
                      Email Kontak Resmi (tampil di Footer)
                    </label>
                    <input
                      id="emailKontak"
                      type="email"
                      value={formData.emailKontak}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emailKontak: e.target.value,
                        })
                      }
                      placeholder="halo@baren.game"
                      className={adminInputClass}
                    />
                    {formErrors.emailKontak && (
                      <p className={adminErrorClass}>
                        {formErrors.emailKontak[0]}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="border-t border-zinc-100 pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className={adminButtonClass("primary", "md")}
                >
                  {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

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
