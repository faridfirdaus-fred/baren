"use client";

import { useEffect, useState } from "react";
import { adminButtonClass } from "./button-styles";
import {
  adminInputClass,
  adminTextareaClass,
  adminLabelClass,
  adminErrorClass,
} from "./form-styles";
import { Toast } from "./toast";

interface LandingSettingsState {
  featuresEyebrow: string;
  featuresTitle: string;
  featuresEmptyMessage: string;
  howToPlayTitle: string;
  galleryEyebrow: string;
  galleryTitle: string;
  galleryDescription: string;
  galleryEmptyTitle: string;
  galleryEmptyMessage: string;
  newsTitle: string;
  newsCtaLabel: string;
  faqEyebrow: string;
  faqTitle: string;
  commentsTitle: string;
  commentsLoginPrompt: string;
  commentsEmptyMessage: string;
  commentsSubmitLabel: string;
  commentsSubmitError: string;
  contactEyebrow: string;
  contactTitle: string;
  contactDescription: string;
  contactEmailLabel: string;
  emailKontak: string;
  contactSocialTitle: string;
  contactSocialEmptyMessage: string;
}

const defaultState: LandingSettingsState = {
  featuresEyebrow: "",
  featuresTitle: "",
  featuresEmptyMessage: "",
  howToPlayTitle: "",
  galleryEyebrow: "",
  galleryTitle: "",
  galleryDescription: "",
  galleryEmptyTitle: "",
  galleryEmptyMessage: "",
  newsTitle: "",
  newsCtaLabel: "",
  faqEyebrow: "",
  faqTitle: "",
  commentsTitle: "",
  commentsLoginPrompt: "",
  commentsEmptyMessage: "",
  commentsSubmitLabel: "",
  commentsSubmitError: "",
  contactEyebrow: "",
  contactTitle: "",
  contactDescription: "",
  contactEmailLabel: "",
  emailKontak: "",
  contactSocialTitle: "",
  contactSocialEmptyMessage: "",
};

interface ApiResponse {
  ok: boolean;
  data?: Record<string, string | null>;
  message?: string;
  fields?: Record<string, string[]>;
}

export function LandingContentManager() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LandingSettingsState>(defaultState);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings");
      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        setError(json.message || "Gagal memuat pengaturan landing");
        return;
      }
      if (json.data) {
        const d = json.data;
        setFormData({
          featuresEyebrow: d.featuresEyebrow || "",
          featuresTitle: d.featuresTitle || "",
          featuresEmptyMessage: d.featuresEmptyMessage || "",
          howToPlayTitle: d.howToPlayTitle || "",
          galleryEyebrow: d.galleryEyebrow || "",
          galleryTitle: d.galleryTitle || "",
          galleryDescription: d.galleryDescription || "",
          galleryEmptyTitle: d.galleryEmptyTitle || "",
          galleryEmptyMessage: d.galleryEmptyMessage || "",
          newsTitle: d.newsTitle || "",
          newsCtaLabel: d.newsCtaLabel || "",
          faqEyebrow: d.faqEyebrow || "",
          faqTitle: d.faqTitle || "",
          commentsTitle: d.commentsTitle || "",
          commentsLoginPrompt: d.commentsLoginPrompt || "",
          commentsEmptyMessage: d.commentsEmptyMessage || "",
          commentsSubmitLabel: d.commentsSubmitLabel || "",
          commentsSubmitError: d.commentsSubmitError || "",
          contactEyebrow: d.contactEyebrow || "",
          contactTitle: d.contactTitle || "",
          contactDescription: d.contactDescription || "",
          contactEmailLabel: d.contactEmailLabel || "",
          emailKontak: d.emailKontak || "",
          contactSocialTitle: d.contactSocialTitle || "",
          contactSocialEmptyMessage: d.contactSocialEmptyMessage || "",
        });
      }
    } catch (err) {
      setError("Gagal memuat pengaturan landing");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSettings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = (await res.json()) as ApiResponse;
      if (!json.ok) {
        if (json.fields) {
          setFormErrors(json.fields);
        }
        setToast({
          message: json.message || "Gagal menyimpan perubahan",
          type: "error",
        });
        return;
      }
      setToast({
        message: "Pengaturan konten landing berhasil disimpan",
        type: "success",
      });
    } catch (err) {
      setToast({
        message: "Terjadi kesalahan jaringan",
        type: "error",
      });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sand-600">
        Memuat konten landing...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-ember">
        <p>{error}</p>
        <button
          type="button"
          onClick={loadSettings}
          className={adminButtonClass("secondary", "md", "mt-4")}
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Seksi Fitur Utama */}
        <section className="rounded-lg border border-line bg-ink-800 p-6">
          <h2 className="text-xl font-bold uppercase tracking-wider text-sand">
            Seksi Fitur Utama
          </h2>
          <p className="mt-1 text-sm text-sand-600">
            Daftar kartu fitur dikelola terpisah di modul Game Content.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="featuresEyebrow" className={adminLabelClass}>
                Eyebrow Fitur
              </label>
              <input
                id="featuresEyebrow"
                name="featuresEyebrow"
                type="text"
                value={formData.featuresEyebrow}
                onChange={handleChange}
                maxLength={100}
                className={adminInputClass}
                placeholder="KEUNGGULAN"
              />
              {formErrors.featuresEyebrow && (
                <p className={adminErrorClass}>
                  {formErrors.featuresEyebrow[0]}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="featuresTitle" className={adminLabelClass}>
                Judul Seksi Fitur *
              </label>
              <input
                id="featuresTitle"
                name="featuresTitle"
                type="text"
                required
                value={formData.featuresTitle}
                onChange={handleChange}
                maxLength={200}
                className={adminInputClass}
                placeholder="FITUR UTAMA"
              />
              {formErrors.featuresTitle && (
                <p className={adminErrorClass}>{formErrors.featuresTitle[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="featuresEmptyMessage" className={adminLabelClass}>
                Pesan Kosong (bila belum ada fitur)
              </label>
              <textarea
                id="featuresEmptyMessage"
                name="featuresEmptyMessage"
                rows={2}
                value={formData.featuresEmptyMessage}
                onChange={handleChange}
                maxLength={500}
                className={adminTextareaClass}
                placeholder="Fitur belum tersedia. Tambahkan melalui panel admin."
              />
              {formErrors.featuresEmptyMessage && (
                <p className={adminErrorClass}>
                  {formErrors.featuresEmptyMessage[0]}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Seksi Cara Bermain */}
        <section className="rounded-lg border border-line bg-ink-800 p-6">
          <h2 className="text-xl font-bold uppercase tracking-wider text-sand">
            Seksi Cara Bermain
          </h2>
          <p className="mt-1 text-sm text-sand-600">
            Langkah bernomor dan video demo dikelola di modul Kelola How to
            Play.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="howToPlayTitle" className={adminLabelClass}>
                Judul Seksi Cara Bermain *
              </label>
              <input
                id="howToPlayTitle"
                name="howToPlayTitle"
                type="text"
                required
                value={formData.howToPlayTitle}
                onChange={handleChange}
                maxLength={200}
                className={adminInputClass}
                placeholder="CARA BERMAIN"
              />
              {formErrors.howToPlayTitle && (
                <p className={adminErrorClass}>
                  {formErrors.howToPlayTitle[0]}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Seksi Galeri */}
        <section className="rounded-lg border border-line bg-ink-800 p-6">
          <h2 className="text-xl font-bold uppercase tracking-wider text-sand">
            Seksi Galeri Permainan
          </h2>
          <p className="mt-1 text-sm text-sand-600">
            Aset gambar dan video galeri dikelola di modul Kelola Galeri.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="galleryEyebrow" className={adminLabelClass}>
                Eyebrow Galeri
              </label>
              <input
                id="galleryEyebrow"
                name="galleryEyebrow"
                type="text"
                value={formData.galleryEyebrow}
                onChange={handleChange}
                maxLength={100}
                className={adminInputClass}
                placeholder="MEDIA RESMI"
              />
              {formErrors.galleryEyebrow && (
                <p className={adminErrorClass}>
                  {formErrors.galleryEyebrow[0]}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="galleryTitle" className={adminLabelClass}>
                Judul Galeri *
              </label>
              <input
                id="galleryTitle"
                name="galleryTitle"
                type="text"
                required
                value={formData.galleryTitle}
                onChange={handleChange}
                maxLength={200}
                className={adminInputClass}
                placeholder="GALERI & AKSI"
              />
              {formErrors.galleryTitle && (
                <p className={adminErrorClass}>{formErrors.galleryTitle[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="galleryDescription" className={adminLabelClass}>
                Deskripsi Galeri
              </label>
              <textarea
                id="galleryDescription"
                name="galleryDescription"
                rows={2}
                value={formData.galleryDescription}
                onChange={handleChange}
                maxLength={500}
                className={adminTextareaClass}
                placeholder="Tangkapan layar, ilustrasi konsep, dan video cuplikan arena pertempuran..."
              />
              {formErrors.galleryDescription && (
                <p className={adminErrorClass}>
                  {formErrors.galleryDescription[0]}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="galleryEmptyTitle" className={adminLabelClass}>
                  Judul Kosong Galeri
                </label>
                <input
                  id="galleryEmptyTitle"
                  name="galleryEmptyTitle"
                  type="text"
                  value={formData.galleryEmptyTitle}
                  onChange={handleChange}
                  maxLength={200}
                  className={adminInputClass}
                  placeholder="Segera Hadir"
                />
                {formErrors.galleryEmptyTitle && (
                  <p className={adminErrorClass}>
                    {formErrors.galleryEmptyTitle[0]}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="galleryEmptyMessage"
                  className={adminLabelClass}
                >
                  Pesan Kosong Galeri
                </label>
                <input
                  id="galleryEmptyMessage"
                  name="galleryEmptyMessage"
                  type="text"
                  value={formData.galleryEmptyMessage}
                  onChange={handleChange}
                  maxLength={500}
                  className={adminInputClass}
                  placeholder="Media resmi BAREN sedang disiapkan..."
                />
                {formErrors.galleryEmptyMessage && (
                  <p className={adminErrorClass}>
                    {formErrors.galleryEmptyMessage[0]}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Seksi Berita & Artikel */}
        <section className="rounded-lg border border-line bg-ink-800 p-6">
          <h2 className="text-xl font-bold uppercase tracking-wider text-sand">
            Seksi Artikel / Berita
          </h2>
          <p className="mt-1 text-sm text-sand-600">
            Daftar artikel dikelola di modul Kelola Berita. Bila tidak ada
            artikel terbit, seksi otomatis disembunyikan.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="newsTitle" className={adminLabelClass}>
                Judul Seksi Artikel *
              </label>
              <input
                id="newsTitle"
                name="newsTitle"
                type="text"
                required
                value={formData.newsTitle}
                onChange={handleChange}
                maxLength={200}
                className={adminInputClass}
                placeholder="ARTIKEL TERBARU"
              />
              {formErrors.newsTitle && (
                <p className={adminErrorClass}>{formErrors.newsTitle[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="newsCtaLabel" className={adminLabelClass}>
                Label Tautan Semua Berita *
              </label>
              <input
                id="newsCtaLabel"
                name="newsCtaLabel"
                type="text"
                required
                value={formData.newsCtaLabel}
                onChange={handleChange}
                maxLength={100}
                className={adminInputClass}
                placeholder="LIHAT SEMUA BERITA"
              />
              {formErrors.newsCtaLabel && (
                <p className={adminErrorClass}>{formErrors.newsCtaLabel[0]}</p>
              )}
            </div>
          </div>
        </section>

        {/* Seksi FAQ */}
        <section className="rounded-lg border border-line bg-ink-800 p-6">
          <h2 className="text-xl font-bold uppercase tracking-wider text-sand">
            Seksi FAQ
          </h2>
          <p className="mt-1 text-sm text-sand-600">
            Daftar pertanyaan dan jawaban dikelola di modul Kelola FAQ.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="faqEyebrow" className={adminLabelClass}>
                Eyebrow FAQ
              </label>
              <input
                id="faqEyebrow"
                name="faqEyebrow"
                type="text"
                value={formData.faqEyebrow}
                onChange={handleChange}
                maxLength={100}
                className={adminInputClass}
                placeholder="PERTANYAAN UMUM"
              />
              {formErrors.faqEyebrow && (
                <p className={adminErrorClass}>{formErrors.faqEyebrow[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="faqTitle" className={adminLabelClass}>
                Judul Seksi FAQ *
              </label>
              <input
                id="faqTitle"
                name="faqTitle"
                type="text"
                required
                value={formData.faqTitle}
                onChange={handleChange}
                maxLength={200}
                className={adminInputClass}
                placeholder="SEMUA YANG PERLU KAMU KETAHUI"
              />
              {formErrors.faqTitle && (
                <p className={adminErrorClass}>{formErrors.faqTitle[0]}</p>
              )}
            </div>
          </div>
        </section>

        {/* Seksi Komentar */}
        <section className="rounded-lg border border-line bg-ink-800 p-6">
          <h2 className="text-xl font-bold uppercase tracking-wider text-sand">
            Seksi Komentar Komunitas
          </h2>
          <p className="mt-1 text-sm text-sand-600">
            Moderasi dan penghapusan komentar dilakukan di modul Kelola
            Komentar.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="commentsTitle" className={adminLabelClass}>
                Judul Seksi Komentar *
              </label>
              <input
                id="commentsTitle"
                name="commentsTitle"
                type="text"
                required
                value={formData.commentsTitle}
                onChange={handleChange}
                maxLength={200}
                className={adminInputClass}
                placeholder="KOMENTAR KOMUNITAS"
              />
              {formErrors.commentsTitle && (
                <p className={adminErrorClass}>{formErrors.commentsTitle[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="commentsLoginPrompt" className={adminLabelClass}>
                Prompt Login Pengunjung *
              </label>
              <textarea
                id="commentsLoginPrompt"
                name="commentsLoginPrompt"
                rows={2}
                required
                value={formData.commentsLoginPrompt}
                onChange={handleChange}
                maxLength={500}
                className={adminTextareaClass}
                placeholder="Masuk dengan akun Google untuk meninggalkan komentar..."
              />
              {formErrors.commentsLoginPrompt && (
                <p className={adminErrorClass}>
                  {formErrors.commentsLoginPrompt[0]}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="commentsEmptyMessage" className={adminLabelClass}>
                Pesan Belum Ada Komentar
              </label>
              <input
                id="commentsEmptyMessage"
                name="commentsEmptyMessage"
                type="text"
                value={formData.commentsEmptyMessage}
                onChange={handleChange}
                maxLength={500}
                className={adminInputClass}
                placeholder="Belum ada komentar. Jadilah yang pertama memberikan masukan!"
              />
              {formErrors.commentsEmptyMessage && (
                <p className={adminErrorClass}>
                  {formErrors.commentsEmptyMessage[0]}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="commentsSubmitLabel"
                  className={adminLabelClass}
                >
                  Label Tombol Kirim *
                </label>
                <input
                  id="commentsSubmitLabel"
                  name="commentsSubmitLabel"
                  type="text"
                  required
                  value={formData.commentsSubmitLabel}
                  onChange={handleChange}
                  maxLength={100}
                  className={adminInputClass}
                  placeholder="KIRIM KOMENTAR"
                />
                {formErrors.commentsSubmitLabel && (
                  <p className={adminErrorClass}>
                    {formErrors.commentsSubmitLabel[0]}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="commentsSubmitError"
                  className={adminLabelClass}
                >
                  Pesan Galat Pengiriman
                </label>
                <input
                  id="commentsSubmitError"
                  name="commentsSubmitError"
                  type="text"
                  value={formData.commentsSubmitError}
                  onChange={handleChange}
                  maxLength={500}
                  className={adminInputClass}
                  placeholder="Gagal mengirim komentar. Silakan coba lagi."
                />
                {formErrors.commentsSubmitError && (
                  <p className={adminErrorClass}>
                    {formErrors.commentsSubmitError[0]}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Seksi Kontak & Media Sosial */}
        <section className="rounded-lg border border-line bg-ink-800 p-6">
          <h2 className="text-xl font-bold uppercase tracking-wider text-sand">
            Seksi Kontak & Informasi
          </h2>
          <p className="mt-1 text-sm text-sand-600">
            Tautan platform media sosial dikelola di modul Kelola Tautan.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="contactEyebrow" className={adminLabelClass}>
                Eyebrow Kontak
              </label>
              <input
                id="contactEyebrow"
                name="contactEyebrow"
                type="text"
                value={formData.contactEyebrow}
                onChange={handleChange}
                maxLength={100}
                className={adminInputClass}
                placeholder="HUBUNGI KAMI"
              />
              {formErrors.contactEyebrow && (
                <p className={adminErrorClass}>
                  {formErrors.contactEyebrow[0]}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="contactTitle" className={adminLabelClass}>
                Judul Seksi Kontak *
              </label>
              <input
                id="contactTitle"
                name="contactTitle"
                type="text"
                required
                value={formData.contactTitle}
                onChange={handleChange}
                maxLength={200}
                className={adminInputClass}
                placeholder="TETAP TERHUBUNG"
              />
              {formErrors.contactTitle && (
                <p className={adminErrorClass}>{formErrors.contactTitle[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="contactDescription" className={adminLabelClass}>
                Deskripsi Kontak
              </label>
              <textarea
                id="contactDescription"
                name="contactDescription"
                rows={2}
                value={formData.contactDescription}
                onChange={handleChange}
                maxLength={500}
                className={adminTextareaClass}
                placeholder="Punya pertanyaan seputar game, kemitraan, atau ingin bergabung..."
              />
              {formErrors.contactDescription && (
                <p className={adminErrorClass}>
                  {formErrors.contactDescription[0]}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contactEmailLabel" className={adminLabelClass}>
                  Label Email Kontak *
                </label>
                <input
                  id="contactEmailLabel"
                  name="contactEmailLabel"
                  type="text"
                  required
                  value={formData.contactEmailLabel}
                  onChange={handleChange}
                  maxLength={100}
                  className={adminInputClass}
                  placeholder="EMAIL RESMI"
                />
                {formErrors.contactEmailLabel && (
                  <p className={adminErrorClass}>
                    {formErrors.contactEmailLabel[0]}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="emailKontak" className={adminLabelClass}>
                  Alamat Email Kontak
                </label>
                <input
                  id="emailKontak"
                  name="emailKontak"
                  type="email"
                  value={formData.emailKontak}
                  onChange={handleChange}
                  maxLength={320}
                  className={adminInputClass}
                  placeholder="halo@baren.game"
                />
                {formErrors.emailKontak && (
                  <p className={adminErrorClass}>{formErrors.emailKontak[0]}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contactSocialTitle" className={adminLabelClass}>
                  Judul Media Sosial *
                </label>
                <input
                  id="contactSocialTitle"
                  name="contactSocialTitle"
                  type="text"
                  required
                  value={formData.contactSocialTitle}
                  onChange={handleChange}
                  maxLength={200}
                  className={adminInputClass}
                  placeholder="IKUTI MEDIA SOSIAL"
                />
                {formErrors.contactSocialTitle && (
                  <p className={adminErrorClass}>
                    {formErrors.contactSocialTitle[0]}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contactSocialEmptyMessage"
                  className={adminLabelClass}
                >
                  Pesan Media Sosial Kosong
                </label>
                <input
                  id="contactSocialEmptyMessage"
                  name="contactSocialEmptyMessage"
                  type="text"
                  value={formData.contactSocialEmptyMessage}
                  onChange={handleChange}
                  maxLength={500}
                  className={adminInputClass}
                  placeholder="Saluran media sosial resmi akan segera diumumkan."
                />
                {formErrors.contactSocialEmptyMessage && (
                  <p className={adminErrorClass}>
                    {formErrors.contactSocialEmptyMessage[0]}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-4 border-t border-line pt-6">
          <button
            type="submit"
            disabled={submitting}
            className={adminButtonClass("primary", "md")}
          >
            {submitting ? "Menyimpan..." : "Simpan Semua Konten Landing"}
          </button>
        </div>
      </form>
    </div>
  );
}
