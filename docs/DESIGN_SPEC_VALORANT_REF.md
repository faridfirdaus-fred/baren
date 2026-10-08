# Design Spec — Referensi VALORANT → Landing Page BAREN

Dokumen ini adalah hasil **scraping otomatis** `https://playvalorant.com/id-id/` menggunakan Playwright
(`scripts/scrape.mjs`, `scripts/detail.mjs`, `scripts/sections.mjs`).

Tujuannya: mengambil **pola tata letak & design token** sebagai acuan (sesuai `docs/SRS.md` §3.6 DG-01..DG-10
dan `docs/PRD.md` §11A), lalu **disesuaikan dengan branding BAREN**. Aset berhak cipta Riot Games
**TIDAK** disalin (lihat PRD risiko "Duplikasi desain aset berhak cipta").

---

## 1. Design Token Hasil Ekstraksi

### 1.1 Palet Warna (diambil dari computed style, diurutkan frekuensi)

| Peran di situs referensi | Nilai terukur | Frekuensi |
| --- | --- | --- |
| Base gelap / teks di panel terang | `rgb(15, 25, 35)` = `#0F1923` | 83 |
| Panel terang / teks di panel gelap | `rgb(236, 232, 225)` = `#ECE8E1` | 44 |
| Teks navigasi terang | `rgb(249, 249, 249)` = `#F9F9F9` | 37 |
| Aksen utama (CTA) | `rgb(255, 70, 85)` = `#FF4655` | 3 (+6 sebagai background) |
| Footer / surface gelap | `rgb(17, 17, 17)` = `#111111`, `rgb(26, 36, 46)` = `#1A242E` | — |
| Surface kartu sosial | `rgb(43, 42, 41)` = `#2B2A29`, `rgb(41,41,41)` = `#292929` | — |

**Pola pemakaian:** halaman bergantian antara *panel gelap* (`#0F1923`) dan *panel terang* (`#ECE8E1`)
secara berselang-seling per seksi — inilah "struktur seksi berbasis blok dengan pemisah visual jelas" (DG-05).

### 1.2 Tipografi

| Peran | Font referensi | Ukuran terukur | Berat | Detail |
| --- | --- | --- | --- | --- |
| Display / judul besar | `Tungsten-Bold, "Riot Sans"` | `94.8378px` (fluid, ~5.9vw) | 400 | `uppercase`, `line-height: 1` |
| Judul tagline hero | `Tungsten-Bold` | `28px` | 400 | `uppercase`, `letter-spacing: 0.28px` |
| Sub-judul seksi | `DINNextW1G` | `18px` | **500** | `line-height: 28px` |
| Body / paragraf | `DINNextW1G` | `18px` | 400 | `line-height: 28px` |
| Navigasi header | `Inter` | `13px` | 600 | `uppercase`, `letter-spacing: 1.04px` |
| Navigasi (dropdown) | `Inter` | `16px` | 600 | `uppercase`, `letter-spacing: 1.28px` |
| Label kategori kartu | `DINNextW1G` | 14px | 700 | `uppercase` |
| Teks legal footer | `Inter` | 12–13px | 400 | — |

### 1.3 Tombol / CTA

| Properti | Nilai terukur |
| --- | --- |
| Padding | `18px 32px` |
| Font | `18px` / `500` / `uppercase` |
| Border radius | `0px` (**sudut tegas / siku** — kunci gaya ini) |
| Warna primer | bg `#FF4655`, teks `#ECE8E1` |
| Warna sekunder | bg `#0F1923`, teks `#ECE8E1` |
| Tinggi render | 64px |

### 1.4 Header (Riot Bar)

- Tinggi `80px`, **fixed** di atas hero, transparan → solid saat scroll.
- Logo kiri (mark + wordmark, tinggi ~26px), nav uppercase 13px/600, gap antar item longgar.
- Item nav: `INFO GAME ▾`, `MEDIA`, `ARTIKEL`, `SUPPORT ▾`, `MEDIA SOSIAL ▾`, `ESPORTS ↗`, `LEBIH BANYAK ▾`.
- Sisi kanan: tombol ikon bulat (search) + locale switcher.

### 1.5 Grid & Ritme Spasi

- Container konten: `max-width` mengikuti `1440px` dengan padding horizontal `48px` (terukur `x=48`).
- Padding vertikal seksi: `48px 0` (seksi pendek) sampai `64px 0` (hero).
- Grid artikel: **3 kolom**, gap ~`32px`; kartu `427×240` untuk gambar.
- Tinggi hero: `720px` (`min-height: 720px`); seksi konten: `586–736px`.

---

## 2. Struktur Seksi (urutan visual terverifikasi)

| # | Seksi | Tinggi | Palet | Isi |
| --- | --- | --- | --- | --- |
| 0 | **Header** (fixed) | 80 | gelap | Logo + nav uppercase |
| 1 | **Hero** | 720 | gelap `#0F1923` | Video latar `cover` full-bleed, logo wordmark di tengah (`300×56`), H1 tagline 28px uppercase centered, CTA `MAIN GRATIS` merah |
| 2 | **Artikel Terbaru** | 586 | terang `#ECE8E1` | H2 kiri + link "BUKA HALAMAN ARTIKEL" kanan, grid 3 kartu (gambar atas, meta kategori merah + tanggal, judul) |
| 3 | **Promo/Event Banner** | 640 | gelap | Gambar latar `cover`, teks **kiri**, judul display 94px uppercase, subteks 18px, CTA `TONTON SEKARANG` |
| 4 | **About Game** | 640 | terang | Layout 2 kolom (teks kiri + video kanan `640×360`), judul display, sub-judul 500, paragraf, CTA `TONTON SEKARANG` |
| 5 | **Fitur/Agents** | 736 | **aksen** `#FF4655` | Gambar art `640×640` kiri, teks kanan: judul display `AGEN`, sub `KREATIVITAS ADALAH SENJATA TERBAIKMU`, paragraf, CTA `LIHAT SEMUA AGEN` (bg gelap) |
| 6 | **Peta/Maps** | 736 | terang | Teks kiri + art `640×640` kanan, judul `PETA`, CTA `LIHAT SEMUA PETA` (merah) |
| 7 | **Footer** | 449 | gelap `#111111` | 3 ikon sosial bulat `#2B2A29`, copyright, blok merek dagang, link legal: KEBIJAKAN PRIVASI / KETENTUAN PENGGUNAAN / PREFERENSI COOKIE |

Total tinggi dokumen referensi: **4507px** (desktop 1440×900).

---

## 3. Adaptasi ke Branding BAREN

Sesuai `docs/SRS.md` DG-02 & catatan PRD §11A: **hanya pola tata letak/gaya umum yang diadopsi**, warna aksen
dan aset final milik BAREN.

| Token referensi | Token BAREN | Alasan |
| --- | --- | --- |
| `#0F1923` base gelap | `#0B1220` (ink) | nuansa malam arena, kontras tinggi |
| `#ECE8E1` panel terang | `#F2EDE4` (sand) | kesan kertas/tradisional |
| `#FF4655` aksen merah | `#E4572E` (ember) | aksen baru sesuai branding BAREN, bukan milik Riot |
| Tungsten-Bold (display) | `Anton` / font display tegas | display condensed uppercase |
| DINNextW1G (body) | `Inter` | sans-serif isi, tersedia via `next/font` |
| Video hero Valorant | `hero-loop.mp4` hasil generate + poster | aset dibuat sendiri (DG-10) |

**Elemen khas BAREN yang ditambahkan** (pembeda dari referensi):
- Motif geometris *benteng-bentengan* (garis pertahanan, titik pos, pola batik sederhana) pada latar seksi.
- Ikon "benteng" pada logo mark.
- Panel aksen memakai *dot-grid* + garis diagonal sebagai pengganti artwork berhak cipta.

---

## 4. Berkas Hasil Scraping

| Berkas | Isi |
| --- | --- |
| `scrape/raw.html` | HTML mentah hasil render (767 KB) |
| `scrape/desktop.json` | Konten, token, seksi, gambar, video, tombol (1440×900) |
| `scrape/mobile.json` | Idem untuk 390×844 |
| `scrape/detail.json` | Tipografi, header, footer, isi tiap seksi, CSS vars |
| `scrape/assets-manifest.json` | Daftar aset + status unduh |
| `scrape/screenshots/*.png` | Full-page + fold, desktop & mobile |
| `scrape/sections/*.png` | Screenshot per seksi (untuk perbandingan visual) |
