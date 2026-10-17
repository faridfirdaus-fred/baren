# Design — Landing dinamis (kartu), Wishlist rename, Komentar

Tanggal: 2026-10-17
Status: disetujui pengguna (berdasarkan jawaban kuesioner brainstorming)
Sumber: `docs/PRD.md`, `docs/SRS.md`, `docs/TASK_BREAKDOWN.md`, plan aktif
`docs/superpowers/plans/2026-10-16-situs-publik.md`,
`docs/superpowers/plans/2026-10-16-cms-waitlist.md`,
`docs/superpowers/plans/2026-10-16-mutu.md`.

## 1. Klasifikasi

Architectural: menyentuh skema DB, API publik/admin, susunan landing,
alur akun Google, dan fitur baru (komentar). Dipecah jadi 4 plan yang
masing-masing bisa diuji mandiri.

## 2. Yang sudah ada plan-nya vs yang belum

- SUDAH ADA: hero dinamis, how-to-play + video, gallery, download/contact,
  waiting-list UI/admin (E11-4..9), CMS CRUD (E8), mutu (E9).
  Lokasi: `2026-10-16-situs-publik.md`, `2026-10-16-cms-waitlist.md`,
  `2026-10-16-mutu.md`, `2026-10-16-aset-r2.md`, `2026-10-16-rilis.md`.
- BELUM ADA: (a) rename total waiting list → wishlist (DB/API/UI/dokumen),
  (b) komentar landing satu kolom (login Google, langsung tayang),
  (c) revisi scope: kartu fleksibel, news maks 3 tanpa halaman detail,
  navbar dipangkas, footer statis.
- Plan baru di bawah ini adalah DELTA: tidak menduplikasi langkah lama,
  hanya menambah/merevisi yang berubah. Pelaksana tetap membaca plan lama
  untuk konteks endpoint dan pola yang sudah `Done` (E3).

## 3. Keputusan yang dikunci

1. **Wishlist = nama baru waiting list.** Bukan fitur kedua. Rename total
   termasuk tabel `waitlist` → `wishlist`, route `/api/waitlist/*` →
   `/api/wishlist/*`, teks UI/dokumen/CSV/dashboard. Migrasi tanpa hapus
   data email lama. Tabel `users` + Auth.js tidak diganti.
2. **Komentar: satu kolom di landing, wajib login Google, langsung tayang.**
   Tanpa antre moderasi; admin hanya bisa hapus. Tanpa mode guest
   (tidak ada `guest47`). Nama/foto dari profil Google.
3. **Satu daftar kartu fleksibel (`landing_cards`).** Event, About, Agents,
   Maps lama dilebur jadi kartu generik: gambar, eyebrow, judul, subjudul,
   paragraf, CTA label+URL, urutan, publish. Admin tambah/kurang/urut;
   2 kartu terbit → tampil 2. Gaya visual tiap kartu (full-bleed gelap /
   terang 2 kolom / panel ember) ikut data `tone`.
4. **News landing: maks 3, opsional, tanpa halaman detail.**
   Field per item: cover, kategori, judul, deskripsi/excerpt, tanggal
   terbit, link opsional (URL https atau anchor internal). Kosong (0
   published) → seksi hilang total, bukan empty state. Link kosong →
   kartu non-klik. E7-2 (detail slug) DITUNDA, bukan dihapus.
5. **Hero video dinamis.** `video_url`, `background_url` (poster/fallback
   gambar), judul, subjudul, CTA primer+sekunder dari DB. DB kosong →
   fallback aset lokal `/media/hero-loop.mp4` + poster (tetap jalan di
   build tanpa env).
6. **FAQ dinamis penuh.** CRUD + urutan; jumlah bebas; 0 item → seksi
   hilang. Accordion tetap satu-terbuka, `aria-expanded/controls`.
7. **How-to-play = kartu khusus.** Daftar langkah bernomor + media
   opsional per langkah + satu video demo (player tanpa autoplay
   bersuara). Tombol "Cara Main" scroll ke `#cara-main` (anchor kontrak),
   bukan halaman baru.
8. **Navbar dipangkas.** Hapus `ESPORTS` dan `LEBIH BANYAK`. Sisa:
   INFO GAME (`#fitur`), MEDIA (`#galeri`), ARTIKEL (`#berita`),
   SUPPORT (`#faq`), MEDIA SOSIAL (`#kontak`) + tombol wishlist/login.
   Footer STATIS (tidak masuk CMS): hanya branding fallback + link mati
   yang sudah ada, tidak ada API baru.
9. **Bahasa Indonesia, Tailwind v4, Server Component default.**
   `"use client"` hanya untuk accordion FAQ, menu mobile, player video,
   form komentar. Tidak ada dependency baru.

## 4. Model data

### 4.1 Baru: `landing_cards` (E1-6)

| Kolom                       | Tipe                  | Keterangan                                               |
| --------------------------- | --------------------- | -------------------------------------------------------- |
| id                          | serial pk             | —                                                        |
| slot                        | text                  | bebas, contoh `event/about/agent/map`; hanya label admin |
| eyebrow/title/subtitle/body | text                  | title wajib, sisanya opsional                            |
| image_url                   | text, nullable        | https atau path `/art/...`; null = kartu teks            |
| cta_label/cta_url           | text, nullable        | keduanya wajib diisi bersamaan bila dipakai              |
| tone                        | text default `dark`   | `dark`/`light`/`ember`; mengendalikan palet              |
| sort_order                  | integer default 0     | urutan tampil                                            |
| is_published                | integer 0/1 default 1 | draf tidak tampil di publik                              |
| created_at/updated_at       | timestamptz           | —                                                        |

Constraint: bila `cta_label` diisi maka `cta_url` wajib (dan sebaliknya);
`cta_url` boleh `https://` atau anchor `#...`.

### 4.2 Rename: `waitlist` → `wishlist` (E1-4 revisi)

Kolom tetap: `id, email unique, name, photo_url, provider default
'google', created_at`. Migrasi `ALTER TABLE waitlist RENAME TO wishlist`
(atau create+copy bila drizzle-kit generate create baru), tanpa DROP data.
Seluruh import `waitlist` di `src/db/schema.ts`, lib auth callback,
`src/app/api/waitlist/**`, dashboard, dan dokumen diganti `wishlist`.

### 4.3 Baru: `comments` (E1-7)

| Kolom      | Tipe                     | Keterangan                        |
| ---------- | ------------------------ | --------------------------------- |
| id         | serial pk                | —                                 |
| user_id    | text FK users.id cascade | pemilik komentar                  |
| body       | text                     | 1..500 karakter, trim; tanpa HTML |
| created_at | timestamptz default now  | urutan tampil                     |

Tidak ada kolom status moderasi (langsung tayang). Hapus = DELETE admin.

## 5. Kontrak API

- `GET /api/landing-cards` publik: hanya `is_published=1`, urut
  `sort_order, id`. Tanpa auth.
- CRUD admin `POST/PUT/DELETE /api/landing-cards`, `PUT /api/landing-cards/reorder`:
  admin-only (401 anonim, 403 visitor Google), Zod strict, `cta_url`
  https/anchor, `image_url` https/path-lokal.
- News publik landing: pakai `GET /api/news?status=published&limit=3`
  (kontrak E3-6 sudah ada; tambah param `limit` bila belum ada, default
  tetap 9 untuk kompatibilitas). Tanpa halaman detail baru.
- `GET /api/comments?limit=20&cursor=` publik: terbaru-dulu, tanpa email.
  `POST /api/comments` visitor-login (sesi Google), Zod body, rate limit
  sederhana (mis. maks 5/10 menit per user). `DELETE /api/comments/:id`
  admin-only. Daftar admin `GET /api/comments?admin=1` boleh tampilkan
  email untuk penindakan.
- Wishlist: `GET /api/wishlist/status` (sesi pemilik), `GET /api/wishlist`
  admin-only + `GET /api/wishlist/export.csv` admin-only. Bentuk sama
  dengan kontrak waitlist lama, hanya ganti nama + label CSV `wishlist`.

## 6. Susunan landing baru (`src/app/(site)/page.tsx`)

1. `Hero` (dinamis, `#top`, CTA primer → `#wishlist`/`#daftar` sesuai copy
   final, sekunder opsional).
2. `LatestNews` (maks 3, hilang bila 0; header tanpa link "buka halaman
   artikel" karena halaman detail ditunda).
3. `LandingCards` (pengganti EventBanner/AboutGame/AgentsSection/
   MapsSection; render N kartu terbit sesuai urutan; tiap kartu pakai
   `tone` untuk palet).
4. `GameFeatures` (tetap dari `features`, tidak digabung ke kartu agar
   grid 3 kolom tidak pecah).
5. `HowToPlay` (baru: langkah + video demo, `#cara-main`).
6. `FaqAccordion` (dinamis, hilang bila 0).
7. `Comments` (baru, `#komentar`: daftar + form login Google).
8. Gallery/Download/Contact mengikuti plan lama (tidak diubah di sini).

`src/content/baren.ts` tetap sebagai fallback contoh; komponen baru
menerima `props data` sehingga tidak import konten statis langsung
(kecuali fallback). Footer tidak diubah (statis).

## 7. Non-tujuan

- Tidak ada halaman detail berita, paginasi 9, sitemap berita per slug
  (E7-2/E9-5 direvisi jadi ditunda).
- Tidak ada komentar per kartu, balasan berulir, like, edit komentar.
- Tidak ada upload langsung di form komentar (teks saja).
- Tidak ada CMS untuk footer dan navbar (statis di kode).

## 8. Urutan eksekusi

Plan A (kartu/hero/news/faq/nav) → Plan B (wishlist rename + alur UI) →
Plan C (komentar) → Plan D (CMS + mutu delta). Plan B butuh E11-1..3
(sudah Done); Plan C butuh sesi Google (E11-1/2); Plan D butuh A..C.
E4-2/4-5/4-6 (uploader R2) tetap prasyarat field gambar di CMS bila ingin
upload, bukan tempel URL.
