# BRIEF IMPLEMENTASI — Landing Page BAREN (gaya referensi VALORANT)

> **Tugas:** bangun ulang landing page publik BAREN di Next.js App Router, dengan gaya visual
> yang mengacu pada `https://playvalorant.com/id-id/` (hasil scraping ada di `docs/DESIGN_SPEC_VALORANT_REF.md`),
> **disesuaikan dengan branding BAREN**. JANGAN menyalin aset, teks, atau merek Riot Games.

Baca dulu: `docs/PRD.md` §11A, `docs/SRS.md` §3.6 (DG-01..DG-10) & §3.2 (FR-PUB-*),
`docs/DESIGN_SPEC_VALORANT_REF.md`, dan `docs/TASK_BREAKDOWN.md` epik **E12**.

---

## 1. Stack & Aturan Wajib

| Hal | Nilai |
| --- | --- |
| Framework | Next.js `16.3.8` App Router (RSC), React `19.2.8` |
| Styling | **Tailwind CSS v4** — konfigurasi lewat CSS (`@import "tailwindcss"` + `@theme`), BUKAN `tailwind.config.js` |
| Bahasa | TypeScript strict, tanpa `any` |
| Font | `next/font/google` — **Inter** (body) + **Anton** (display) |
| Gambar | `next/image` untuk semua `<img>`; aset lokal di `public/` |
| Ikon | **Inline SVG sendiri** — JANGAN tambah dependency ikon baru |
| Package baru | **DILARANG** menambah dependency apa pun (kecuali diminta eksplisit) |
| Komponen | Server Component default. `"use client"` HANYA untuk: header scroll, accordion FAQ, carousel banner |
| Aksesibilitas | `alt` bermakna, kontras AA, `aria-*` pada kontrol, fokus terlihat, hormati `prefers-reduced-motion` |
| Bahasa konten | Bahasa Indonesia |

**Wajib lulus sebelum selesai:** `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`.

---

## 2. Design Token → `src/app/globals.css`

Ganti isi `globals.css`. Pertahankan `@import "tailwindcss";` di baris pertama.
Definisikan token via `@theme` (Tailwind v4) memakai nilai berikut:

```css
--color-ink: #0B1220;        /* base gelap (pengganti #0F1923 referensi) */
--color-ink-800: #101A2C;    /* surface gelap sekunder */
--color-ink-700: #16233A;    /* surface gelap tersier / border */
--color-sand: #F2EDE4;       /* panel terang (pengganti #ECE8E1) */
--color-sand-600: #D8D2C6;   /* border di panel terang */
--color-ember: #E4572E;      /* AKSEN UTAMA (pengganti #FF4655) */
--color-ember-600: #C6451F;  /* hover aksen */
--font-display: var(--font-anton);  /* judul besar */
--font-sans: var(--font-inter);     /* body */
```

Tambahkan juga:
- `--radius-none: 0px` → **semua tombol/kartu bersudut siku** (kunci gaya, DG-04). Tidak ada `rounded-*` di CTA.
- Utility `.container-baren` → `max-width: 1440px; margin-inline: auto; padding-inline: 24px;` dan `@media (min-width: 1024px){ padding-inline: 48px }`.
- Utility `.display-xl` → `font-family: var(--font-display); text-transform: uppercase; line-height: 0.92; letter-spacing: 0.01em;` dengan ukuran fluid:
  `font-size: clamp(2.75rem, 6.6vw, 5.9rem);` (referensi terukur 94.84px @1440px).
- Utility `.eyebrow` → `font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;`
- Utility `.pattern-grid` → latar titik halus (radial-gradient 1px, `background-size: 22px 22px`) untuk seksi gelap.
- `html { scroll-behavior: smooth }`, dan `@media (prefers-reduced-motion: reduce)` → matikan animasi.
- Reset dasar: `body { background: var(--color-ink); color: var(--color-sand); font-family: var(--font-sans) }`.

---

## 3. Aset yang Sudah Tersedia (JANGAN ganti, pakai apa adanya)

```
public/brand/baren-mark.svg          mark benteng 64x64 (bg gelap)
public/brand/baren-mark-light.svg    mark varian terang
public/brand/baren-wordmark.png      736x138 wordmark transparan (untuk hero)
public/brand/baren-wordmark.svg
public/media/hero-loop.mp4           1280x720, 6s, h264, 82 KB — video latar hero
public/media/hero-loop.webp          1280x720 animated webp — fallback
public/media/hero-poster.jpg         1920x1080 poster hero
public/art/about-art.jpg             1600x900   seksi About Game (kanan)
public/art/agents-art.jpg            1232x1232  seksi Fitur/Pemain (kiri)
public/art/maps-art.jpg              1232x1232  seksi Arena/Peta (kanan)
public/art/event-art.jpg             3440x1020  banner event full-bleed
public/art/cover-1.jpg               1920x1080  kartu artikel 1
public/art/cover-2.jpg               1920x1080  kartu artikel 2
public/art/cover-3.jpg               1920x1080  kartu artikel 3
public/art/feature-1.jpg             800x800    kartu fitur 1
public/art/feature-2.jpg             800x800    kartu fitur 2
public/art/feature-3.jpg             800x800    kartu fitur 3
public/icon.svg                      favicon
```

---

## 4. Struktur File yang Harus Dibuat

```
src/content/baren.ts                    # SEMUA konten terstruktur + bertipe (single source of truth)
src/components/site/site-header.tsx     # "use client" — nav + transparan→solid saat scroll
src/components/site/site-footer.tsx     # server
src/components/site/hero.tsx            # server
src/components/site/latest-news.tsx     # server
src/components/site/event-banner.tsx    # server
src/components/site/about-game.tsx      # server
src/components/site/game-features.tsx   # server (grid kartu fitur)
src/components/site/agents-section.tsx  # server (panel aksen)
src/components/site/maps-section.tsx    # server
src/components/site/faq-accordion.tsx   # "use client" — accordion aksesibel
src/components/site/cta-button.tsx      # server — komponen tombol bersama
src/components/site/icon.tsx            # server — kumpulan ikon inline SVG
src/components/site/section-shell.tsx   # server — pembungkus seksi (palet gelap/terang)
src/app/(site)/layout.tsx               # header + footer + <main>
src/app/(site)/page.tsx                 # susun semua seksi berurutan
src/app/layout.tsx                      # UPDATE: font Inter + Anton, metadata BAREN, lang="id"
```

`src/content/baren.ts` harus meng-ekspor objek bertipe (interface eksplisit) untuk:
`site` (nama, tagline, deskripsi, email kontak), `nav`, `hero`, `news[]` (3 item),
`event`, `about`, `features[]` (3 item), `agents`, `maps`, `faqs[]` (4–5 item), `social[]` (3–4 item),
`legalLinks[]`, dan `cta` (label tombol).

---

## 5. Susunan Seksi (urutan wajib, mengikuti referensi)

Header fixed 80px transparan → solid. Total 8 blok:

| # | Komponen | Palet | Layout & detail |
| --- | --- | --- | --- |
| 1 | `Hero` | gelap `ink` | Full-bleed, `min-height: 720px` (`h-[calc(100svh-80px)] min-h-[560px] lg:min-h-[720px]`). `<video autoPlay muted loop playsInline poster>` + `<source>` mp4, `object-cover absolute inset-0`, `aria-hidden`. Overlay gradien gelap agar teks terbaca. Isi **terpusat**: wordmark `baren-wordmark.png` (lebar ~`clamp(200px,26vw,300px)`, pakai `next/image`), H1 tagline uppercase (`.display-xl`-ish, 28px di referensi → pakai `clamp(1.25rem,2.4vw,1.75rem)` uppercase), lalu CTA `MAIN GRATIS` (aksen ember). Di bawah, baris kecil "Segera Hadir di" + daftar platform (Steam/Play Store/App Store) sebagai teks, karena game belum rilis (A-07). |
| 2 | `LatestNews` | terang `sand` | `padding: 48px 0`. Header baris: H2 `ARTIKEL TERBARU` (display, warna ink) kiri + link `BUKA HALAMAN ARTIKEL →` kanan (uppercase, ink, ikon panah). Grid `md:grid-cols-3 gap-8`. Kartu: `next/image` 16/9 (`cover-1..3`), lalu meta: label kategori **warna ember, bold, uppercase, 14px** + pemisah `|` + tanggal; lalu judul tebal ink. Seluruh kartu = `<Link>` dengan `hover:opacity-90` + `focus-visible` ring. |
| 3 | `EventBanner` | gelap | Full-bleed `event-art.jpg` `object-cover` + overlay gradien dari kiri. Tinggi ~`min-h-[520px] lg:min-h-[640px]`, konten **kiri**, `justify-center`. Eyebrow `TURNAMEN`, judul display besar `TURNAMEN BENTENG NUSANTARA`, paragraf 18px, CTA `TONTON SEKARANG` (ember). |
| 4 | `AboutGame` | terang `sand` | Grid `lg:grid-cols-2 gap-12 items-center`. Kiri: judul display `KAMI BAREN` + sub-judul 18px/500 `TAKUKAN BATAS, REBUT BENTENG` + 2 paragraf 18px `leading-7` + CTA `TONTON SEKARANG`. Kanan: `about-art.jpg` dalam rasio 16/9 (`aspect-video`) dengan border 2px `ink`. |
| 5 | `GameFeatures` | terang `sand` (lanjutan) | Judul display `FITUR UTAMA` + eyebrow. Grid `md:grid-cols-3 gap-8`, kartu: gambar `feature-1..3` (`aspect-square`, `object-cover`), nomor urut `01/02/03` (display, ember), judul, deskripsi. Border 1px `sand-600`. |
| 6 | `AgentsSection` | **aksen ember** | Full-bleed `bg-ember` + `pattern-grid` halus. Grid `lg:grid-cols-2 gap-12 items-center`. **Kiri:** `agents-art.jpg` (`aspect-square`). **Kanan:** judul display `PEMAIN`, sub 18px/500 `KREATIVITAS ADALAH SENJATA TERBAIKMU`, paragraf, CTA `LIHAT SEMUA PEMAIN` dengan **bg ink + teks sand**. Semua teks di panel ini warna `sand`. |
| 7 | `MapsSection` | terang `sand` | Kebalikan dari #6: **kiri teks**, **kanan** `maps-art.jpg`. Judul display `ARENA`, sub `BERTEMPUR DI SELURUH BELAHAN DUNIA`, paragraf, CTA `LIHAT SEMUA ARENA` (bg ember). |
| 8 | `FaqAccordion` | gelap `ink` | Judul display `PERTANYAAN UMUM`. Accordion: `<button aria-expanded aria-controls>` + panel `<div role="region" id>`. Hanya satu terbuka (state `openIndex`), transisi tinggi halus, ikon `+`/`−`. Default item pertama terbuka. |
| 9 | `SiteFooter` | gelap `#111` → pakai `ink` | Grid: kolom brand (mark + nama + deskripsi singkat) + kolom tautan (Navigasi, Legal). Baris ikon sosial bulat (bg `ink-700`, ikon inline SVG: Instagram, YouTube, TikTok/Discord) — `target="_blank" rel="noopener noreferrer"` (EI-07). Lalu garis pemisah + blok copyright: `© 2026 BAREN. Seluruh merek dagang adalah milik pemegangnya.` + link legal `KEBIJAKAN PRIVASI`, `KETENTUAN PENGGUNAAN`, `PREFERENSI COOKIE`. |

**Header (`site-header.tsx`)** — sesuai DG-06 "transparan di atas hero → solid saat digulir":
- `position: fixed; top: 0; height: 80px; z-index: 50`.
- State `scrolled` dari `window.scrollY > 24` (listener di `useEffect` + `{ passive: true }`, dibersihkan saat unmount).
- Transparan saat di atas; setelah scroll → `bg-ink/95 backdrop-blur border-b border-ink-700`.
- Kiri: `baren-mark.svg` (`next/image`, 32px) + wordmark teks `BAREN` (display font). Lalu nav desktop (`hidden lg:flex`): `INFO GAME`, `MEDIA`, `ARTIKEL`, `SUPPORT`, `MEDIA SOSIAL`, `ESPORTS ↗`, `LEBIH BANYAK`. Gaya item: `13px/600 uppercase tracking-[0.08em]`, teks `sand`, hover `text-ember`, `focus-visible` ring. Item dengan submenu pakai `<button aria-expanded={false}>` + chevron SVG (tidak perlu membuka menu; cukup indikator).
- Kanan: tombol ikon pencarian (bulat, `aria-label="Cari"`) + tombol **`LOGIN`** (sesuai PRD mode waiting list: tombol Login di header). `LOGIN` = CTA kecil bg ember, teks sand, uppercase, sudut siku.
- Mobile (`lg:hidden`): tombol burger (`aria-label`, `aria-expanded`, `aria-controls`) yang membuka panel overlay berisi nav vertikal + tombol LOGIN. Tutup dengan `Escape` dan saat link diklik.

**`cta-button.tsx`** — props: `href`, `children`, `variant: "ember" | "ink" | "ghost"`. Gaya wajib: `inline-flex items-center justify-center gap-2 px-8 py-4 uppercase font-medium text-[1.125rem] rounded-none transition-colors`, tanpa border-radius. `ember`: `bg-ember text-sand hover:bg-ember-600`. `ink`: `bg-ink text-sand hover:bg-ink-800`. `ghost`: transparan + border 1px + teks ikut konteks. Wajib `focus-visible:outline-2 focus-visible:outline-offset-2`.

---

## 6. Konten BAREN (tulis sendiri, bahasa Indonesia)

Isi `src/content/baren.ts` dengan konten orisinal bertema **BAREN = game aksi tim terinspirasi
benteng-bentengan**. Contoh yang harus dipakai (boleh dirapikan, jangan menyimpang dari makna):

- `site.name` = `"BAREN"`, tagline: `"Rebut benteng. Kuasai arena."`
- Hero H1: `"BAREN — GAME AKSI TIM 5V5 TERINSPIRASI BENTENG-BENTENGAN"`
- CTA hero: `MAIN GRATIS` → `#daftar`
- Platform: `Steam`, `Play Store`, `App Store` → semua berlabel `Segera Hadir`
- Berita (3): kategori `ESPORTS` / `PENGUMUMAN` / `PEMBARUAN GAME` dengan tanggal & judul wajar,
  contoh: `"Turnamen Baren Nusantara: Jadwal dan Hadiah"`, `"Main dengan Respek"`, `"Catatan Patch Baren 0.9"`.
- Event: eyebrow `TURNAMEN`, judul `TURNAMEN BENTENG NUSANTARA`, deskripsi jadwal.
- About: judul `KAMI BAREN`, sub `TAKUKAN BATAS, REBUT BENTENG`, 2 paragraf tentang konsep permainan.
- Features (3): `PERTAHANKAN BENTENGMU`, `KERJA SAMA TIM 5V5`, `PETA ARENA BERAGAM` + deskripsi masing-masing.
- Agents: judul `PEMAIN`, sub `KREATIVITAS ADALAH SENJATA TERBAIKMU`, paragraf peran/karakter.
- Maps: judul `ARENA`, sub `BERTEMPUR DI SELURUH BELAHAN DUNIA`, paragraf arena.
- FAQ (4): rilis, platform, harga, cara ikut waiting list.
- Kontak: `halo@baren.game`; sosial: Instagram, YouTube, Discord, TikTok (URL `https://instagram.com/` dll. sebagai placeholder).

**JANGAN** menyalin teks Indonesia dari situs VALORANT (mis. "Kreativitas adalah senjata terbaikmu"
boleh dipakai karena frasa generik, tapi jangan salin paragraf/artikelnya). Tulis ulang dengan kata sendiri.

---

## 7. Kriteria Selesai (verifikasi sendiri sebelum melapor)

1. `pnpm exec tsc --noEmit` → 0 error.
2. `pnpm lint` → 0 error (warning boleh 0).
3. `pnpm build` → sukses, semua route ter-compile.
4. `src/app/(site)/page.tsx` merender 9 blok berurutan sesuai §5.
5. Tidak ada `rounded-lg/xl/full` pada CTA (harus sudut siku).
6. Tidak ada URL eksternal ke `playvalorant.com` atau `rgpub.io` di dalam kode.
7. Semua `next/image` punya `alt`; video punya `poster` dan `aria-hidden`.
8. `globals.css` memakai `@theme` Tailwind v4 (tanpa `tailwind.config.js` baru).
9. Header berubah dari transparan ke solid saat digulir (kode `useEffect` scroll benar).
10. Tidak ada dependency baru di `package.json`.

Setelah semua lulus, laporkan: file yang dibuat/diubah, hasil ketiga perintah verifikasi, dan
catatan deviasi bila ada.
