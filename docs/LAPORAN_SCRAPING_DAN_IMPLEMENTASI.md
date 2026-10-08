# Laporan: Scraping Referensi VALORANT → Landing Page BAREN (Next.js)

Tanggal: 8 Oktober 2026
Referensi: `https://playvalorant.com/id-id/`
Acuan dokumen: `docs/PRD.md` §11A, `docs/SRS.md` §3.6 (DG-01..DG-10) & §3.2 (FR-PUB-01..17)

---

## 1. Ringkasan

Situs referensi VALORANT di-scrape dengan **Playwright** untuk mengambil **pola tata letak dan design token**
(ukuran, warna, tipografi, ritme spasi, urutan seksi). Hasilnya diterjemahkan menjadi **spesifikasi desain**
dan sebuah **brief implementasi**, lalu **opencode** dipakai untuk menulis kode landing page BAREN di proyek
Next.js 16 (App Router) + Tailwind CSS v4 yang sudah ada.

**Penting (kepatuhan):** hanya *pola layout & gaya umum* yang diadopsi. Aset berhak cipta Riot Games
(gambar, video, logo, teks, font proprietary) **tidak disalin**. Seluruh aset visual BAREN dibuat dari nol
secara generatif (SVG/Canvas → JPG/MP4) sesuai catatan risiko pada `docs/PRD.md` §11A.

---

## 2. Cara Scraping Dijalankan

```bash
node scripts/scrape.mjs        # HTML mentah, konten, token, screenshot desktop+mobile, unduh aset
node scripts/detail.mjs        # tipografi, header, footer, isi per seksi, CSS variables
node scripts/sections.mjs      # screenshot per seksi (untuk perbandingan visual)
node scripts/bottom.mjs        # deteksi footer & blok bawah
```

Teknik yang dipakai di `scripts/scrape.mjs`:
- **Auto-scroll** bertahap sampai dasar halaman agar konten *lazy-load* ter-render.
- **Penutupan otomatis** dialog cookie/consent (Osano/OneTrust) + pembersihan backdrop penghalang.
- **Ekstraksi terstruktur** via `page.evaluate()`: heading, gambar, video, link, tombol, paragraf,
  `background-image`, dan outline per-`<section>`.
- **Sampling design token**: frekuensi `font-family`, `color`, `background-color` dari seluruh elemen terlihat.
- **Ekstraksi CSS custom properties** (`:root`) langsung dari `document.styleSheets`.
- Screenshot `fullPage` + *fold* untuk dua viewport (1440×900 dan 390×844 iPhone 13).

---

## 3. Hasil Ekstraksi (angka terukur)

| Metrik | Nilai |
| --- | --- |
| Tinggi dokumen referensi | 4507px (desktop) / 4192px (mobile) |
| Jumlah seksi | 6 seksi konten + header + footer |
| Warna dasar | `#0F1923` (gelap), `#ECE8E1` (terang) |
| Warna aksen | `#FF4655` |
| Display font | `Tungsten-Bold, "Riot Sans"` @ 94.84px |
| Body font | `DINNextW1G` @ 18px / line-height 28px |
| Nav font | `Inter` @ 13px / 600 / uppercase / ls 1.04px |
| Tombol CTA | padding `18px 32px`, 18px/500 uppercase, **radius 0px** |
| Container | max-width 1440px, padding horizontal 48px |
| Grid artikel | 3 kolom, kartu 427px |

Detail lengkap: **`docs/DESIGN_SPEC_VALORANT_REF.md`**.

---

## 4. Aset BAREN yang Dibuat Sendiri

Dihasilkan oleh `scripts/gen-art.mjs` + `scripts/hero-scene.html` (Canvas → frames → ffmpeg).
Motif khas: **benteng-bentengan** — siluet benteng bergerigi, garis pertahanan putus-putus,
node rebutan, dot-grid taktis, ember melayang.

| Aset | Ukuran | Ukuran file |
| --- | --- | --- |
| `public/media/hero-loop.mp4` | 1280×720, 6s, h264 | 82 KB |
| `public/media/hero-poster.jpg` | 1920×1080 | 62 KB |
| `public/art/event-art.jpg` | 3440×1020 | 50 KB |
| `public/art/about-art.jpg` | 1600×900 | 32 KB |
| `public/art/agents-art.jpg` / `maps-art.jpg` | 1232×1232 | ~35 KB |
| `public/art/cover-1..3.jpg` | 1920×1080 | ~65 KB (komposisi berbeda) |
| `public/art/feature-1..3.jpg` | 800×800 | ~20 KB |
| `public/brand/baren-mark.svg`, `baren-wordmark.png` | 64×64 / 736×138 | kecil |

---

## 5. Kode yang Dihasilkan opencode

**Konfigurasi:** `opencode.json` (model `omniroute/openrouter/openai/gpt-5.6-luna-pro`).
Model dijalankan bertahap (fondasi → konten/ikon/CTA → seksi → seksi akhir → perakitan) dengan
instruksi eksplisit "langsung tulis file, jangan bertanya" dan `--pure` untuk menonaktifkan skill
yang membuat model berhenti meminta konfirmasi.

**File baru/ubah (14):**

```
src/content/baren.ts                    konten terstruktur + interface (22 ekspor)
src/components/site/icon.tsx            12 ikon inline SVG
src/components/site/cta-button.tsx      tombol (ember | ink | ghost)
src/components/site/section-shell.tsx   pembungkus seksi (dark | light | ember)
src/components/site/hero.tsx            video latar + wordmark + CTA + platform
src/components/site/latest-news.tsx     grid 3 kartu artikel
src/components/site/event-banner.tsx    banner turnamen full-bleed
src/components/site/about-game.tsx      layout 2 kolom
src/components/site/game-features.tsx   grid 3 kartu fitur
src/components/site/agents-section.tsx  panel aksen ember
src/components/site/maps-section.tsx    layout 2 kolom (teks kiri)
src/components/site/faq-accordion.tsx   accordion aksesibel ("use client")
src/components/site/site-header.tsx     nav + transparan→solid + menu mobile
src/components/site/site-footer.tsx     footer + sosial + legal
src/app/(site)/layout.tsx               header + main + footer
src/app/(site)/page.tsx                 susunan 8 seksi
src/app/globals.css                     token @theme Tailwind v4
src/app/layout.tsx                      font Inter + Anton, metadata, lang="id"
```

---

## 6. Hasil Verifikasi

| Pemeriksaan | Hasil |
| --- | --- |
| `pnpm exec tsc --noEmit` | **0 error** |
| `pnpm lint` | **0 error, 0 warning** |
| `pnpm build` | **sukses** (route `/` statis) |
| Dependency baru | **tidak ada** (`package.json` tidak berubah) |
| Rujukan eksternal ke Riot | **0** (tidak ada `playvalorant`/`rgpub`) |
| Error console browser | **0** (desktop & mobile) |
| Semua gambar ter-decode | **13/13 OK**, 0 HTTP gagal |
| Video hero | `readyState 4`, 1280×720 |
| Radius tombol CTA | **0px** di semua tombol (sesuai DG-04) |
| Kontras WCAG AA | **0 pelanggaran** (audit ter-render) |
| Aksesibilitas | 1 `<h1>`, landmark header/main/footer/nav lengkap, 0 gambar tanpa `alt` (2 dekoratif `alt=""`), 0 tombol/link tanpa nama |
| Header transparan→solid | **berfungsi** (bg berubah + border 1px + blur) |
| Accordion FAQ | **berfungsi** (4 item, hanya satu terbuka, `aria-expanded` benar) |
| Menu mobile | **berfungsi** (8 link, tutup via Escape) |

Skrip verifikasi: `scripts/verify-visual.mjs`, `scripts/audit-a11y.mjs`,
`scripts/check-media.mjs`, `scripts/test-interactions.mjs`.

---

## 7. Bug yang Ditemukan & Diperbaiki

Verifikasi menemukan masalah nyata yang kemudian diperbaiki:

1. **Kontras gagal WCAG AA** — teks `sand` di atas tombol `ember` hanya **3.16:1** (butuh 4.5:1),
   dan teks `ember` di atas panel terang juga 3.16:1. Perbaikan: menambah token `--color-ember-700`
   (`#B23A1A`, 5.13:1) untuk tombol & teks di latar terang, serta `--color-ember-800` untuk hover.
   Panel aksen diubah memakai teks `ink` (5.08:1).
2. **`Anton` butuh `weight` eksplisit** — error tipe pada `next/font`.
3. **Label ganda** — eyebrow dan heading menampilkan teks sama (mis. "ARENA" di atas "ARENA").
   Diperbaiki dengan field `eyebrow` pada konten (`LOKASI`, `KARAKTER`, `KEUNGGULAN`).
4. **Kartu artikel tampak identik** — variasi komposisi ditambahkan pada generator agar
   `cover-1/2/3` benar-benar berbeda.
5. **Tangkapan layar seksi kosong** — gambar *lazy-load* belum ter-decode saat screenshot;
   skrip verifikasi kini men-scroll penuh sebelum menangkap.

---

## 8. Cara Menjalankan

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm build && pnpm start
```

Verifikasi ulang:

```bash
node scripts/verify-visual.mjs http://localhost:3000
node scripts/audit-a11y.mjs   http://localhost:3000
node scripts/test-interactions.mjs http://localhost:3000
```

Regenerasi aset (bila perlu):

```bash
node scripts/gen-art.mjs
```

---

## 9. Catatan & Kelanjutan

- Tombol **LOGIN** sudah ada di header sesuai mode *waiting list* (`FR-PUB-18`), namun masih
  menuju anchor `#daftar`. Integrasi Google OAuth + tabel `waitlist` (FR-PUB-19..25) belum dikerjakan.
- Seksi **Galeri** (FR-PUB-08/09) dan **FAQ accordion** sudah tersedia; galeri media belum dibuat.
- Konten masih berupa konstanta statis di `src/content/baren.ts`. Langkah berikutnya: ganti sumbernya
  dengan pembacaan dari database Drizzle (`src/db/schema.ts`) agar Panel Admin/CMS berfungsi.
- URL sosial media masih placeholder (`https://instagram.com/` dll.) — perlu diisi mitra.
