# Audit dan Perbaikan Tombol CTA Landing Page (Valid Navigation Targets)

**Tanggal:** 2026-10-20
**Status:** Done

## 1. Ringkasan Masalah (Bug Review)

Audit seluruh elemen tombol dan tautan CTA pada landing page (`src/components/site/*`, `src/app/(site)/*`, dan data CMS/konten) menemukan tautan tanpa tujuan navigasi valid (`href="#"`, self-looping anchor, dan inkonsistensi validasi):

1. **`LatestNews` (`src/components/site/latest-news.tsx`)**:
   - Header seksi berita menampilkan `ctaLabel` ("LIHAT SEMUA BERITA" / "BUKA HALAMAN ARTIKEL") dengan ikon `IconArrowUpRight`.
   - `href` dipatok statis ke `href="#berita"` (seksi itu sendiri). Pengguna mengklik tombol dengan ekspektasi membuka arsip artikel, tetapi hanya me-refresh scroll posisi seksi.
   - Halaman `/berita` (indeks artikel lengkap) belum ada, hanya ada `/berita/[slug]`.

2. **`SiteFooter` Legal Links (`src/components/site/site-footer.tsx` & `src/content/baren.ts`)**:
   - Tautan `legalLinks` ("KEBIJAKAN PRIVASI", "KETENTUAN PENGGUNAAN", "PREFERENSI COOKIE") memiliki `href="#"`.
   - Saat diklik pengguna, browser melompat ke posisi atas halaman (`#top`) tanpa menampilkan informasi legal.

3. **`LandingCards` CTA (`src/components/site/landing-cards.tsx` & `src/lib/validation/landing-cards.ts`)**:
   - Validasi `httpsOrAnchor` di Zod mengizinkan string `"#"` murni. Admin dapat memasukkan `#` sehingga tombol CTA kartu menjadi dead link.
   - Tautan eksternal (`https://...`) di `LandingCards` tidak dilengkapi `target="_blank"` dan `rel="noopener noreferrer"` (pelanggaran EI-07).

4. **`Hero` CTA Validation & Fallback (`src/components/site/hero.tsx`, `hero-manager.tsx`, `src/lib/validation/hero.ts`)**:
   - Validasi `heroUpdateSchema` hanya menerima `https://` (menolak internal anchor seperti `#wishlist` atau `#unduh`), sedangkan seed default menggunakan `#daftar`.
   - Admin tidak dapat menyimpan anchor internal di panel admin karena input bertipe `type="url"` dan validasi Zod menolak.
   - Bila `secondary.href === "#"`, Hero tetap merender tombol CTA sekunder sebagai link mati.
   - Target `#daftar` di hero mengarah ke div kecil teks "Tersedia di PC", bukan ke area pendaftaran/wishlist.

5. **`SiteHeader` Fallback Account Slot (`src/components/site/site-header.tsx`)**:
   - Fallback `accountSlot` tombol "MASUK" mengarah ke `href="#daftar"`, bukan ke seksi wishlist (`#wishlist` / `#unduh`).

6. **Duplikasi `id="kontak"`**:
   - Ditemukan di `contact-section.tsx:74` dan `site-footer.tsx:74`, menyebabkan fragment navigation `#kontak` ambigu di browser.

7. **Dead Code / Unused Section Components**:
   - `about-game.tsx`, `agents-section.tsx`, `event-banner.tsx`, `maps-section.tsx` sudah digantikan oleh `LandingCards` tetapi masih tersimpan di codebase dan memuat `href="#"`.

---

## 2. Rencana Solusi & Perubahan

### A. Halaman Indeks Berita Publik (`/berita`) & Perbaikan `LatestNews`

- Buat halaman publik `src/app/berita/page.tsx`:
  - Menampilkan daftar semua berita published dengan paginasi atau grid artikel lengkap.
  - Menggunakan layout dan tema BAREN yang konsisten.
  - Membaca data berita via `getLatestNews()` atau query DB publik.
- Ubah `src/components/site/latest-news.tsx`:
  - `ctaLabel` mengarah ke `href="/berita"` alih-alih `href="#berita"`.

### B. Halaman Legal / Informasi Footer (`/kebijakan-privasi` & `/ketentuan-penggunaan`)

- Buat halaman statis minimalis:
  - `src/app/(site)/kebijakan-privasi/page.tsx`
  - `src/app/(site)/ketentuan-penggunaan/page.tsx`
- Perbarui `legalLinks` di `src/content/baren.ts`:
  - `KEBIJAKAN PRIVASI` -> `href="/kebijakan-privasi"`
  - `KETENTUAN PENGGUNAAN` -> `href="/ketentuan-penggunaan"`
  - `PREFERENSI COOKIE` -> Ubah menjadi tombol/dialog ringkas preferensi cookie atau sembunyikan jika belum ada modul cookie.

### C. Penguatan Validasi & Render `LandingCards`

- Di `src/lib/validation/landing-cards.ts`:
  - Perbaiki `httpsOrAnchor`: tolak string `"#"` murni. Wajibkan `https://` atau `^#[a-z0-9-]+$` dengan panjang minimal 2 karakter (misal `#fitur`).
- Di `src/components/site/landing-cards.tsx`:
  - Jika `card.ctaUrl === "#"`, jangan render CTA.
  - Jika `card.ctaUrl` diawali `https://`, pasang `target="_blank"` dan `rel="noopener noreferrer"` (EI-07).

### D. Penyelarasan Validasi Hero & Admin UI

- Di `src/lib/validation/hero.ts`:
  - Perluas validasi `primaryCtaUrl` dan `secondaryCtaUrl` agar menerima `https://` ATAU anchor internal `^#[a-z0-9-]+$`.
- Di `src/components/admin/hero-manager.tsx`:
  - Ubah input `primaryCtaUrl` dan `secondaryCtaUrl` dari `type="url"` ke `type="text"`.
  - Berikan label bantuan bahwa kolom dapat diisi URL `https://` atau anchor (misal `#wishlist`).
- Di `src/components/site/hero.tsx`:
  - Abaikan tombol sekunder jika `secondary.href === "#"`.
  - Sinkronkan target CTA wishlist ke `#wishlist` atau `#unduh`.

### E. Penyelarasan Header & Footer

- Di `src/components/site/site-header.tsx`:
  - Ubah fallback `accountSlot` ke `href="#wishlist"`.
- Di `src/components/site/site-footer.tsx`:
  - Hapus atribut `id="kontak"` duplikat (pertahankan hanya pada `ContactSection`).

### F. Pembersihan Komponen Legacy

- Hapus file komponen yang tidak lagi dipakai (`about-game.tsx`, `agents-section.tsx`, `event-banner.tsx`, `maps-section.tsx`).

---

## 3. Matriks File yang Akan Diubah

| File                                                                            | Tindakan    | Rincian Perubahan                                                  |
| ------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------ |
| `src/app/berita/page.tsx`                                                       | Tambah      | Halaman indeks artikel published, navigasi dari landing CTA        |
| `src/app/(site)/kebijakan-privasi/page.tsx`                                     | Tambah      | Halaman kebijakan privasi BAREN                                    |
| `src/app/(site)/ketentuan-penggunaan/page.tsx`                                  | Tambah      | Halaman ketentuan penggunaan BAREN                                 |
| `src/content/baren.ts`                                                          | Ubah        | Perbarui `legalLinks` ke URL halaman legal nyata                   |
| `src/components/site/latest-news.tsx`                                           | Ubah        | Ganti `href="#berita"` ke `href="/berita"`                         |
| `src/components/site/landing-cards.tsx`                                         | Ubah        | Filter dead anchor `#`, pasang `externalLinkProps` pada `https://` |
| `src/lib/validation/landing-cards.ts`                                           | Ubah        | Tolak `"#"` kosong di Zod schema                                   |
| `src/lib/validation/hero.ts`                                                    | Ubah        | Izinkan anchor internal pada CTA hero                              |
| `src/components/admin/hero-manager.tsx`                                         | Ubah        | `type="text"` pada input CTA URL                                   |
| `src/components/site/hero.tsx`                                                  | Ubah        | Jangan render secondary CTA jika `href="#"`                        |
| `src/components/site/site-header.tsx`                                           | Ubah        | Fallback `accountSlot` arahkan ke `#wishlist`                      |
| `src/components/site/site-footer.tsx`                                           | Ubah        | Hapus duplikat `id="kontak"`                                       |
| `src/components/site/{about-game,agents-section,event-banner,maps-section}.tsx` | Hapus       | Hapus dead legacy components                                       |
| `src/lib/validation/landing-cards.test.mjs`                                     | Ubah        | Tambah unit test penolakan `"#"` murni                             |
| `src/lib/validation/hero.test.mjs`                                              | Ubah/Tambah | Tambah test izin anchor internal pada hero CTA                     |

---

## 4. Tahapan Verifikasi & DoD

1. **Unit Testing:**
   - Jalankan `node --test $(find src -name "*.test.*")`. Pastikan pengujian validasi Zod baru lulus 100%.
2. **Typecheck & Linting:**
   - `tsc --noEmit` lolos tanpa error.
   - `pnpm lint` lolos tanpa warning/error.
3. **Build Test:**
   - `pnpm build` sukses (Next.js compilation + route generation).
4. **Audit Interaksi & Navigasi (Playwright/Browser):**
   - Klik CTA "LIHAT SEMUA BERITA" membuka `/berita`.
   - Klik "KEBIJAKAN PRIVASI" dan "KETENTUAN PENGGUNAAN" membuka halaman masing-masing.
   - Tidak ada lagi elemen `<a>` atau `<button>` di beranda dengan target `href="#"`.
   - Tidak ada duplikasi ID DOM (`#kontak`).
