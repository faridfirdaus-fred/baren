# Task Breakdown — Website Landing Page Game BAREN Berbasis CMS

Dokumen ini menjabarkan pekerjaan teknis dari **docs/PRD.md** dan **docs/SRS.md** menjadi epik, task, dan subtask yang dapat dikerjakan tim.

| Field | Keterangan |
| --- | --- |
| Versi | 1.1 |
| Tanggal | 8 Oktober 2026 |
| Sumber Acuan | docs/PRD.md, docs/SRS.md |
| Estimasi | Satuan *story point* (SP) — Fibonacci: 1, 2, 3, 5, 8, 13 |
| Legenda Prioritas | **P0** = wajib/kritis, **P1** = penting, **P2** = tambahan |

---

## 0. Cara Menggunakan Dokumen Ini (WAJIB dibaca agent)

> **Alur kerja development yang terarah:**
>
> 1. **Sebelum mulai kerja**, baca `docs/PRD.md` (kenapa & apa) dan `docs/SRS.md` (kebutuhan detail), lalu dokumen ini (bagaimana & urutannya).
> 2. **Pilih task** dari tabel epik yang relevan. Perhatikan kolom **Dep** (dependency) — jangan mulai task yang dependensinya belum `Done`.
> 3. **Saat mulai**, ubah kolom **Status** task tersebut dari `Todo` → `In Progress`.
> 4. **Saat selesai**, ubah **Status** menjadi `Done`, isi kolom **Catatan** (tanggal, ringkasan, atau tautan commit/PR), lalu perbarui **Progress Epik** pada §1 dan **Log Progress** pada §5.
> 5. **Jangan menandai `Done`** sebelum kriteria "Definition of Done" (§6) terpenuhi dan sudah diverifikasi.
> 6. Bila scope berubah, perbarui `docs/PRD.md`/`docs/SRS.md` terlebih dahulu agar dokumen tetap sinkron.

**Legenda Status:** `Todo` · `In Progress` · `Blocked` · `Done` · `N/A`

---

## 1. Ringkasan Epik & Progress

| Epik | Nama | Prioritas | Total SP | Status | Progress | FR Terkait |
| --- | --- | --- | --- | --- | --- | --- |
| E0 | Fondasi Proyek & Infrastruktur | P0 | 21 | Todo | 0% | C-03, C-04, C-05, C-07, C-08, NFR-DEP-01, NFR-MNT-01/02 |
| E1 | Skema Basis Data & Migrasi | P0 | 15 | Todo | 0% | §3.5 Kebutuhan Data, NFR-MNT-02 |
| E2 | Autentikasi & Manajemen Akun Admin | P0 | 21 | Todo | 0% | FR-ADM-01..06, NFR-SEC-01/03/04/06 |
| E3 | Lapisan API & Validasi | P0 | 36 | Todo | 0% | EI-02/03/04, NFR-SEC-02/03/05 |
| E4 | Manajemen Aset R2 (Presigned URL) | P0 | 19 | Todo | 0% | EI-04/05/06, FR-ADM-15/16/17, C-06 |
| E5 | Kerangka UI, Layout & Branding | P0 | 16 | Todo | 0% | FR-PUB-15/16/17, C-01/02, EI-01, NFR-USE-01 |
| E6 | Situs Publik — Konten Utama | P0 | 25 | Todo | 0% | FR-PUB-01..09 |
| E7 | Situs Publik — Berita, FAQ, Download, Contact | P0 | 17 | Todo | 0% | FR-PUB-10..14, FR-PUB-25 |
| E8 | Panel Admin — Dashboard & Manajemen Konten | P0 | 45 | Todo | 0% | FR-ADM-07..23, FR-ADM-24..27 |
| E9 | Performa, Aksesibilitas & SEO | P1 | 14 | Todo | 0% | NFR-PRF-01/02/03, NFR-ACC-01, NFR-USE-02 |
| E10 | Pengujian, UAT & Deployment | P0 | 21 | Todo | 0% | NFR-CMP-01, NFR-DEP-01, NFR-MNT-01/03 |
| **E11** | **Waiting List & Google OAuth** | P0 | 33 | Todo | 0% | FR-PUB-18..24, FR-ADM-28..30, EI-08, NFR-USE-03, NFR-SEC-07 |
| **E12** | **Design System & UI (acuan Valorant)** | P0 | 24 | Todo | 0% | C-10, DG-01..DG-10 |
| **Total** | | | **307** | | **0%** | |

> **Progress dihitung:** jumlah SP task `Done` ÷ total SP epik × 100%.

---

## E0 — Fondasi Proyek & Infrastruktur
**Tujuan:** Menyiapkan kerangka repo, tooling, dan integrasi layanan (Neon, R2, Cloudflare).

| ID | Task | Detail | FR/Terkait | Prio | SP | Dep | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E0-1 | Setup repositori & tooling | Next.js 15 (App Router) + TypeScript, pnpm, ESLint, Prettier, struktur folder | C-03, C-09, NFR-MNT-03 | P0 | 3 | — | Todo | |
| E0-2 | Konfigurasi Tailwind CSS + shadcn/ui | Pasang Tailwind, init shadcn/ui, base theme, design token | C-03 | P0 | 3 | E0-1 | Todo | |
| E0-3 | Konfigurasi Cloudflare Workers (OpenNext) | `wrangler.jsonc`, `open-next.config.ts`, binding R2 (`BAREN_ASSETS`), images, assets | C-04, NFR-DEP-01 | P0 | 5 | E0-1 | Todo | |
| E0-4 | Koneksi Neon Postgres + Drizzle | Driver kompatibel Workers (`@neondatabase/serverless`), `src/db/index.ts`, env | C-05, EI-03 | P0 | 3 | E0-1 | Todo | |
| E0-5 | Manajemen rahasia | `.dev.vars.example`, wrangler secret untuk produksi, `.gitignore` | C-07, NFR-SEC-06 | P0 | 2 | E0-3 | Todo | |
| E0-6 | Health check & smoke test | Route `/api/health`, verifikasi build OpenNext & preview lokal | NFR-DEP-01 | P0 | 3 | E0-3 | Todo | |
| E0-7 | Setup CI (lint/typecheck) | Pipeline ESLint + `tsc --noEmit` + build | NFR-MNT-03 | P1 | 2 | E0-1 | Todo | |

**Kriteria Selesai E0:** `pnpm build` & `pnpm preview` berhasil; `/api/health` OK; lint lolos.

---

## E1 — Skema Basis Data & Migrasi
**Tujuan:** Menerjemahkan model data (SRS §3.5) menjadi skema Drizzle + migrasi.

| ID | Task | Detail | FR/Terkait | Prio | SP | Dep | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E1-1 | Skema tabel konten | `site_settings`, `hero`, `hero_banners`, `about`, `features`, `how_to_play_steps`, `how_to_play_video` | SRS §3.5 | P0 | 5 | E0-4 | Todo | |
| E1-2 | Skema tabel dinamis | `gallery_assets`, `news`, `faq`, `social_links`, `download_links` | SRS §3.5 | P0 | 3 | E0-4 | Todo | |
| E1-3 | Skema auth (Auth.js) | Tabel `users` + tabel adapter (`accounts`, `sessions`, `verification_token`) | FR-ADM-01, NFR-SEC-01 | P0 | 3 | E0-4 | Todo | |
| E1-4 | Skema tabel `waitlist` | `id`, `email` (unik), `nama`, `foto_url`, `provider`, `created_at` + constraint unik email | FR-PUB-20/21, FR-ADM-28 | P0 | 2 | E0-4 | Todo | |
| E1-5 | Migrasi drizzle-kit | Generate + apply migrasi, seed data awal (settings, admin user) | NFR-MNT-02 | P0 | 2 | E1-1..4 | Todo | |

**Kriteria Selesai E1:** `pnpm db:push`/migrasi sukses; tabel terverifikasi di Neon; seed admin tersedia.

---

## E2 — Autentikasi & Manajemen Akun Admin
**Tujuan:** Login/logout admin, proteksi rute, pengaturan akun.

| ID | Task | Detail | FR/Terkait | Prio | SP | Dep | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E2-1 | Setup Auth.js v5 + Drizzle adapter | Konfigurasi provider, sesi, secret | FR-ADM-01 | P0 | 5 | E1-3 | Todo | |
| E2-2 | Login admin email+password | Hash password (bcryptjs), pesan error generik | FR-ADM-01, NFR-SEC-01 | P0 | 3 | E2-1 | Todo | |
| E2-3 | Logout & expiry 60 menit | Akhiri sesi; `maxAge` sesi 60 menit | FR-ADM-02, FR-ADM-03 | P0 | 2 | E2-1 | Todo | |
| E2-4 | Middleware proteksi `/admin` | Redirect ke login bila tanpa sesi valid | FR-ADM-04 | P0 | 3 | E2-1 | Todo | |
| E2-5 | Pengaturan akun admin | Ubah nama & email | FR-ADM-05 | P1 | 2 | E2-1 | Todo | |
| E2-6 | Ubah password admin | Verifikasi password lama; baru ≥ 8 karakter & berbeda | FR-ADM-06 | P0 | 3 | E2-2 | Todo | |
| E2-7 | Halaman login admin UI | Form react-hook-form + zodResolver, pesan error | FR-ADM-01, C-01 | P0 | 3 | E0-2, E2-1 | Todo | |

**Kriteria Selesai E2:** Admin dapat login/logout; `/admin` terproteksi; sesi berakhir 60 menit; ubah akun & password berfungsi.

---

## E3 — Lapisan API & Validasi
**Tujuan:** Route Handlers JSON dengan validasi Zod, otorisasi, dan query Drizzle.

| ID | Task | Detail | FR/Terkait | Prio | SP | Dep | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E3-1 | Utilitas API & helper | Response standar, wrapper error, helper auth guard (401) | NFR-SEC-03 | P0 | 3 | E2-4 | Todo | |
| E3-2 | API Settings/Branding | GET/PUT `site_settings` | FR-ADM-08, FR-PUB-15 | P0 | 3 | E1-1, E3-1 | Todo | |
| E3-3 | API Hero & Banners | GET/PUT hero; CRUD `hero_banners` | FR-ADM-09/10, FR-PUB-01/02/03 | P0 | 5 | E1-1, E3-1 | Todo | |
| E3-4 | API Game Content | About, Features (CRUD+urut), How to Play (CRUD+urut), video demo | FR-ADM-11..14, FR-PUB-04..07 | P0 | 5 | E1-1, E3-1 | Todo | |
| E3-5 | API Gallery | GET/CRUD `gallery_assets` | FR-ADM-15/16, FR-PUB-08/09 | P0 | 3 | E1-2, E3-1 | Todo | |
| E3-6 | API News | CRUD berita + publikasi slug + paginasi 9 | FR-ADM-18/19, FR-PUB-10/11 | P0 | 5 | E1-2, E3-1 | Todo | |
| E3-7 | API FAQ | CRUD + urut FAQ | FR-ADM-20, FR-PUB-12 | P0 | 3 | E1-2, E3-1 | Todo | |
| E3-8 | API Social & Download | CRUD social_links & download_links; email kontak | FR-ADM-21/22/23, FR-PUB-13/14 | P0 | 3 | E1-2, E3-1 | Todo | |
| E3-9 | Skema validasi Zod | Validasi kolom wajib, tipe/ukuran berkas, URL `https://` | FR-ADM-24/25, NFR-SEC-02 | P0 | 3 | E3-1 | Todo | |
| E3-10 | Revalidasi & cache | Pastikan perubahan tayang ≤ 60 detik (revalidate/tag) | FR-ADM-27 | P0 | 3 | E3-2..8 | Todo | |

**Kriteria Selesai E3:** Semua endpoint tervalidasi Zod, endpoint tulis menolak tanpa auth (401), perubahan tayang ≤ 60 detik.

---

## E4 — Manajemen Aset R2 (Presigned URL)
**Tujuan:** Unggah langsung dari browser admin ke R2 via presigned URL.

| ID | Task | Detail | FR/Terkait | Prio | SP | Dep | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E4-1 | Helper R2 & presigned URL | `getR2Bucket`, generate presigned URL (kedaluwarsa ≤ 10 menit) | EI-04, NFR-SEC-05, C-06 | P0 | 5 | E0-3 | Todo | |
| E4-2 | Endpoint penerbitan presigned URL | Hanya admin terautentikasi; validasi tipe & ukuran | FR-ADM-17, NFR-SEC-03/05 | P0 | 3 | E4-1, E2-4 | Todo | |
| E4-3 | Validasi tipe & ukuran berkas | Gambar JPG/PNG/WebP (+SVG logo/ikon) ≤ 5 MB; video MP4 ≤ 50 MB | EI-05/06, FR-ADM-17 | P0 | 3 | E4-1 | Todo | |
| E4-4 | Custom loader next/image untuk R2 | Loader gambar R2 + lazy loading | NFR-PRF-03 | P0 | 3 | E4-1 | Todo | |
| E4-5 | Hapus aset dari R2 | Hapus objek + record DB dengan konfirmasi | FR-ADM-16, FR-ADM-26 | P0 | 2 | E4-1 | Todo | |
| E4-6 | Komponen uploader (drag & drop) | Progress, validasi klien, preview | FR-ADM-15, FR-ADM-24 | P0 | 3 | E4-2, E0-2 | Todo | |

**Kriteria Selesai E4:** Admin dapat mengunggah/hapus aset; presigned URL kedaluwarsa ≤ 10 menit; berkas tidak melewati Workers.

---

## E5 — Kerangka UI, Layout & Branding
**Tujuan:** Layout responsif mobile-first, navigasi, dan penerapan branding.

| ID | Task | Detail | FR/Terkait | Prio | SP | Dep | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E5-1 | Layout global Situs Publik | Header/footer, container, token warna/font | C-01, C-02 | P0 | 3 | E0-2 | Todo | |
| E5-2 | Branding dinamis | Logo, favicon, nama game dari `site_settings` di seluruh halaman | FR-PUB-15 | P0 | 3 | E3-2 | Todo | |
| E5-3 | Navigasi sticky + smooth scroll | Menu tetap terlihat saat digulir, menuju seksi | FR-PUB-16 | P1 | 2 | E5-1 | Todo | |
| E5-4 | Menu lipat mobile (< 768 px) | Hamburger + drawer | FR-PUB-17 | P0 | 3 | E5-1 | Todo | |
| E5-5 | Responsif 360–1920 px | Verifikasi tanpa gulir horizontal | EI-01, NFR-USE-01, C-02 | P0 | 2 | E5-1 | Todo | |
| E5-6 | Layout Panel Admin | Sidebar, topbar, area konten admin | — | P0 | 3 | E0-2 | Todo | |

**Kriteria Selesai E5:** Branding tampil konsisten; navigasi responsif; tidak ada gulir horizontal.

---

## E6 — Situs Publik: Konten Utama
**Tujuan:** Hero, About, Features, How to Play, Gallery.

| ID | Task | Detail | FR/Terkait | Prio | SP | Dep | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E6-1 | Seksi Hero | Logo, tagline, banner/video latar, tombol CTA + tautan | FR-PUB-01/02 | P0 | 5 | E3-3, E5-1 | Todo | |
| E6-2 | Carousel banner | Banner bergantian bila > 1 | FR-PUB-03 | P1 | 3 | E6-1 | Todo | |
| E6-3 | Seksi About Game | Judul, deskripsi/konsep, gambar gameplay | FR-PUB-04 | P0 | 3 | E3-4 | Todo | |
| E6-4 | Seksi Game Features | Kartu ikon/gambar + judul + deskripsi sesuai urutan | FR-PUB-05 | P0 | 3 | E3-4 | Todo | |
| E6-5 | Seksi How to Play | Langkah bernomor berurutan + media | FR-PUB-06 | P0 | 3 | E3-4 | Todo | |
| E6-6 | Video demo How to Play | Pemutar video demo | FR-PUB-07 | P0 | 2 | E3-4 | Todo | |
| E6-7 | Seksi Gallery | Grid screenshot, artwork, banner, video | FR-PUB-08 | P0 | 3 | E3-5 | Todo | |
| E6-8 | Lightbox & video player | Perbesar gambar, putar video | FR-PUB-09 | P1 | 3 | E6-7 | Todo | |

**Kriteria Selesai E6:** Semua seksi konten utama tampil sesuai data admin & responsif.

---

## E7 — Situs Publik: Berita, FAQ, Download, Contact
**Tujuan:** Konten dinamis dan tautan keluar.

| ID | Task | Detail | FR/Terkait | Prio | SP | Dep | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E7-1 | Daftar berita + paginasi | Hanya status terbit, urut terbaru, 9/halaman | FR-PUB-10 | P0 | 5 | E3-6 | Todo | |
| E7-2 | Halaman detail berita | Berbasis slug, SEO metadata | FR-PUB-11 | P0 | 3 | E3-6 | Todo | |
| E7-3 | Seksi FAQ accordion | Jawaban tampil saat pertanyaan dipilih | FR-PUB-12 | P0 | 3 | E3-7 | Todo | |
| E7-4 | Seksi Download | Tombol per platform + status "Segera Hadir" selama belum rilis | FR-PUB-13/25 | P0 | 3 | E3-8 | Todo | |
| E7-5 | Seksi Contact | Email kontak + tautan media sosial | FR-PUB-14 | P0 | 2 | E3-8 | Todo | |
| E7-6 | Tautan keluar tab baru | `target="_blank"` + `rel="noopener noreferrer"` | EI-07 | P0 | 1 | E7-4/5 | Todo | |

**Kriteria Selesai E7:** Berita (paginasi+slug), FAQ, download, dan kontak berfungsi; tautan keluar tab baru.

---

## E8 — Panel Admin: Dashboard & Manajemen Konten
**Tujuan:** Seluruh modul CRUD CMS.

| ID | Task | Detail | FR/Terkait | Prio | SP | Dep | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E8-1 | Dashboard ringkasan | Jumlah fitur, galeri, berita, FAQ, **waiting list** + waktu pembaruan terakhir | FR-ADM-07 | P1 | 3 | E3-2..8, E11-3 | Todo | |
| E8-2 | Branding Management UI | Ubah logo, favicon, nama game | FR-ADM-08 | P0 | 3 | E3-2, E4-6 | Todo | |
| E8-3 | Hero/Banner Management UI | Ubah judul, subjudul, video, CTA; CRUD banner | FR-ADM-09/10 | P0 | 5 | E3-3, E4-6 | Todo | |
| E8-4 | About & Features Management UI | Ubah About; CRUD+urut Features | FR-ADM-11/12 | P0 | 5 | E3-4, E4-6 | Todo | |
| E8-5 | How to Play Management UI | CRUD+urut langkah + media; ubah video demo | FR-ADM-13/14 | P0 | 5 | E3-4, E4-6 | Todo | |
| E8-6 | Gallery Management UI | Unggah & hapus aset, atur urutan | FR-ADM-15/16 | P0 | 5 | E3-5, E4-6 | Todo | |
| E8-7 | News Management UI | CRUD berita, status draf/terbit, thumbnail | FR-ADM-18/19 | P0 | 5 | E3-6, E4-6 | Todo | |
| E8-8 | FAQ Management UI | CRUD + urut FAQ | FR-ADM-20 | P0 | 3 | E3-7 | Todo | |
| E8-9 | Social & Contact Management UI | CRUD download & social; ubah email | FR-ADM-21/22/23 | P0 | 3 | E3-8 | Todo | |
| E8-10 | Konfirmasi hapus | Dialog konfirmasi sebelum hapus data/aset | FR-ADM-26 | P0 | 2 | E8-6..9 | Todo | |
| E8-11 | Feedback & pesan error | Toast/notifikasi sukses-gagal; pesan error per kolom | FR-ADM-24 | P0 | 3 | E8-1..9 | Todo | |
| E8-12 | Pengurutan drag & drop | Urutkan Features, How to Play, Gallery, FAQ | FR-ADM-12/13/20 | P1 | 3 | E8-4/5/6/8 | Todo | |

**Kriteria Selesai E8:** Seluruh modul CMS berfungsi; validasi & konfirmasi hapus berjalan.

---

## E9 — Performa, Aksesibilitas & SEO
**Tujuan:** Memenuhi NFR kualitas.

| ID | Task | Detail | FR/Terkait | Prio | SP | Dep | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E9-1 | Optimasi performa beranda | LCP ≤ 3 dtk, skor Lighthouse ≥ 80 (mobile) | NFR-PRF-01/02 | P1 | 5 | E6, E7 | Todo | |
| E9-2 | Optimasi gambar | next/image + loader R2, lazy loading di bawah fold | NFR-PRF-03 | P0 | 2 | E4-4 | Todo | |
| E9-3 | Audit aksesibilitas | Skor ≥ 90; alt pada gambar informatif; kontras & fokus | NFR-ACC-01 | P1 | 3 | E6, E7 | Todo | |
| E9-4 | Uji kegunaan (admin) | 3/3 calon admin ganti logo ≤ 5 menit tanpa panduan | NFR-USE-02 | P1 | 2 | E8-2 | Todo | |
| E9-5 | SEO dasar | Metadata, sitemap, robots, OG tags | — | P2 | 2 | E7-2 | Todo | |

**Kriteria Selesai E9:** Skor Lighthouse terpenuhi; uji kegunaan lulus; SEO dasar terpasang.

---

## E10 — Pengujian, UAT & Deployment
**Tujuan:** Verifikasi menyeluruh dan rilis.

| ID | Task | Detail | FR/Terkait | Prio | SP | Dep | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E10-1 | Uji fungsional Situs Publik | Verifikasi FR-PUB-01..25 | FR-PUB-* | P0 | 3 | E6, E7, E11 | Todo | |
| E10-2 | Uji fungsional Panel Admin | Verifikasi FR-ADM-01..30 | FR-ADM-* | P0 | 3 | E8, E11 | Todo | |
| E10-3 | Uji keamanan | 401 tanpa auth, presigned expiry, hash password, HTTPS redirect, verifikasi email OAuth | NFR-SEC-01..07 | P0 | 3 | E2, E4, E11 | Todo | |
| E10-4 | Uji kompatibilitas browser | Chrome, Firefox, Edge, Safari (2 versi mayor terakhir) | NFR-CMP-01 | P0 | 3 | E6, E7 | Todo | |
| E10-5 | UAT bersama mitra | Skenario pengelolaan konten & waiting list oleh mitra | FR-ADM-27 | P0 | 3 | E10-1..4 | Todo | |
| E10-6 | Deployment produksi | Build OpenNext + `wrangler deploy`; konfigurasi secret, OAuth redirect URI & domain | NFR-DEP-01, A-04, A-06 | P0 | 3 | E10-5 | Todo | |
| E10-7 | Dokumentasi & README | Instalasi, konfigurasi, deployment | NFR-MNT-01 | P0 | 2 | E0-1 | Todo | |
| E10-8 | Handover & pelatihan | Panduan penggunaan CMS untuk mitra | NFR-USE-02 | P1 | 1 | E10-5 | Todo | |

**Kriteria Selesai E10:** Semua uji lulus; aplikasi ter-*deploy*; dokumentasi & handover selesai.

---

## E11 — Waiting List & Google OAuth
**Tujuan:** Pengunjung dapat bergabung waiting list via login Google; admin dapat mengelola data pendaftar.

| ID | Task | Detail | FR/Terkait | Prio | SP | Dep | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E11-1 | Konfigurasi Google Provider (Auth.js) | Client ID/Secret via env/secret, redirect URI, scope `openid email profile` | EI-08, A-06, NFR-SEC-06 | P0 | 3 | E2-1 | Todo | |
| E11-2 | Handler login Google → simpan waitlist | Pada callback signIn, upsert email (+nama, foto) ke tabel `waitlist` | FR-PUB-19/20 | P0 | 5 | E11-1, E1-4 | Todo | |
| E11-3 | Logika idempoten & cek status | Cegah duplikat email; sediakan query status "sudah terdaftar" | FR-PUB-21 | P0 | 3 | E11-2 | Todo | |
| E11-4 | Tombol Login di header | Tombol Login/Join Waiting List pada header (state: belum login/sudah login) | FR-PUB-18 | P0 | 3 | E5-1, E11-1 | Todo | |
| E11-5 | Menu akun pengunjung | Tampilkan email yang login + tombol logout | FR-PUB-23/24 | P0 | 3 | E11-4 | Todo | |
| E11-6 | UI status keikutsertaan | Pesan terima kasih & status terdaftar setelah login | FR-PUB-22 | P0 | 3 | E11-2 | Todo | |
| E11-7 | API daftar waiting list | GET dengan paginasi + pencarian (admin only) | FR-ADM-28, NFR-SEC-03 | P0 | 3 | E3-1, E11-2 | Todo | |
| E11-8 | API ekspor CSV | Endpoint ekspor data waiting list ke CSV | FR-ADM-29 | P1 | 2 | E11-7 | Todo | |
| E11-9 | UI Waiting List Management | Tabel pendaftar, pencarian, paginasi, tombol ekspor, jumlah total | FR-ADM-28/29/30 | P0 | 5 | E11-7 | Todo | |
| E11-10 | Verifikasi keamanan OAuth | Verifikasi email, tidak menyimpan token di klien, uji alur login | NFR-SEC-07, NFR-USE-03 | P0 | 3 | E11-2..6 | Todo | |

**Kriteria Selesai E11:** Pengunjung dapat login Google & masuk waiting list tanpa duplikat; admin dapat melihat, mencari, dan mengekspor data; alur ≤ 3 langkah.

---

## E12 — Design System & UI (acuan Valorant)
**Tujuan:** Menerapkan gaya visual ala Valorant yang disesuaikan dengan branding BAREN.

| ID | Task | Detail | FR/Terkait | Prio | SP | Dep | Status | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E12-1 | Design token & palet warna | Dark theme, warna aksen utama, skala kontras (WCAG) | C-10, DG-02 | P0 | 3 | E0-2 | Todo | |
| E12-2 | Tipografi & skala teks | Display font judul + sans-serif isi, skala responsif | C-10, DG-03 | P0 | 3 | E12-1 | Todo | |
| E12-3 | Komponen tombol CTA | Gaya tegas (uppercase, geometris) + state hover/focus/disabled | C-10, DG-04 | P0 | 3 | E12-1 | Todo | |
| E12-4 | Komponen kartu & overlay | Kartu fitur/berita/galeri dengan rasio gambar konsisten + overlay gradien | DG-08 | P0 | 3 | E12-1 | Todo | |
| E12-5 | Hero full-bleed | Layout hero layar penuh dengan gambar/video latar + judul besar | DG-01 | P0 | 5 | E6-1, E12-1 | Todo | |
| E12-6 | Navigasi transparan → solid | Header transparan di hero, solid saat digulir | DG-06 | P1 | 2 | E5-3, E12-1 | Todo | |
| E12-7 | Animasi & transisi | Animasi halus pada scroll/hover tanpa mengorbankan performa | DG-07, NFR-PRF | P1 | 3 | E12-5 | Todo | |
| E12-8 | Audit visual & konsistensi | Cek konsistensi seluruh seksi, responsif, dan tidak menyalin aset pihak ketiga | DG-09/10, NFR-ACC-01 | P0 | 2 | E12-1..7 | Todo | |

**Kriteria Selesai E12:** Tampilan konsisten dengan acuan (hero full-bleed, dark theme, CTA tegas), responsif, aksesibel, dan bebas aset berhak cipta pihak ketiga.

---

## 2. Matriks Ketertelusuran (Requirement → Task)

| Requirement | Task Utama |
| --- | --- |
| FR-PUB-01/02 | E6-1, E12-5 |
| FR-PUB-03 | E6-2 |
| FR-PUB-04 | E6-3 |
| FR-PUB-05 | E6-4 |
| FR-PUB-06 | E6-5 |
| FR-PUB-07 | E6-6 |
| FR-PUB-08 | E6-7 |
| FR-PUB-09 | E6-8 |
| FR-PUB-10 | E7-1 |
| FR-PUB-11 | E7-2 |
| FR-PUB-12 | E7-3 |
| FR-PUB-13 | E7-4 |
| FR-PUB-14 | E7-5 |
| FR-PUB-15 | E5-2 |
| FR-PUB-16 | E5-3, E12-6 |
| FR-PUB-17 | E5-4 |
| FR-PUB-18 | E11-4 |
| FR-PUB-19 | E11-1, E11-2 |
| FR-PUB-20 | E11-2 |
| FR-PUB-21 | E11-3 |
| FR-PUB-22 | E11-6 |
| FR-PUB-23/24 | E11-5 |
| FR-PUB-25 | E7-4 |
| FR-ADM-01 | E2-2, E2-7 |
| FR-ADM-02/03 | E2-3 |
| FR-ADM-04 | E2-4 |
| FR-ADM-05 | E2-5 |
| FR-ADM-06 | E2-6 |
| FR-ADM-07 | E8-1 |
| FR-ADM-08 | E8-2 |
| FR-ADM-09/10 | E8-3 |
| FR-ADM-11/12 | E8-4 |
| FR-ADM-13/14 | E8-5 |
| FR-ADM-15/16/17 | E4-2/3/6, E8-6 |
| FR-ADM-18/19 | E8-7 |
| FR-ADM-20 | E8-8 |
| FR-ADM-21/22/23 | E8-9 |
| FR-ADM-24 | E3-9, E8-11 |
| FR-ADM-25 | E3-9 |
| FR-ADM-26 | E8-10 |
| FR-ADM-27 | E3-10 |
| FR-ADM-28 | E11-7, E11-9 |
| FR-ADM-29 | E11-8, E11-9 |
| FR-ADM-30 | E11-9, E8-1 |
| EI-01 | E5-5 |
| EI-02/03 | E3-1, E0-4 |
| EI-04/05/06 | E4-1/2/3 |
| EI-07 | E7-6 |
| EI-08 | E11-1 |
| DG-01 | E12-5 |
| DG-02 | E12-1 |
| DG-03 | E12-2 |
| DG-04 | E12-3 |
| DG-05 | E12-5, E12-4 |
| DG-06 | E12-6 |
| DG-07 | E12-7 |
| DG-08 | E12-4 |
| DG-09/10 | E12-8 |
| NFR-PRF-01/02 | E9-1 |
| NFR-PRF-03 | E4-4, E9-2 |
| NFR-USE-01 | E5-5 |
| NFR-USE-02 | E9-4 |
| NFR-USE-03 | E11-10 |
| NFR-ACC-01 | E9-3, E12-8 |
| NFR-CMP-01 | E10-4 |
| NFR-SEC-01 | E2-2 |
| NFR-SEC-02 | E3-9 |
| NFR-SEC-03 | E3-1, E4-2, E11-7 |
| NFR-SEC-04 | E0-3, E10-3 |
| NFR-SEC-05 | E4-1/2/3 |
| NFR-SEC-06 | E0-5, E11-1 |
| NFR-SEC-07 | E11-10 |
| NFR-MNT-01 | E10-7 |
| NFR-MNT-02 | E1-5 |
| NFR-MNT-03 | E0-1, E0-7 |
| NFR-DEP-01 | E0-3, E10-6 |

---

## 3. Urutan Pengerjaan yang Disarankan (Critical Path)

```
E0 (Fondasi) → E1 (Skema DB) → E2 (Auth admin) ┐
                                                ├→ E5 (UI/Layout) ┐
E0 → E4 (R2/Aset) ──────────────────────────────┘                 ├→ E6/E7 (Situs Publik) ┐
E1 → E3 (API) ────────────────────────────────────────────────────┘                      │
E2/E3/E4 → E8 (Panel Admin) ────────────────────────────────────────────────────────────┼→ E9 (Kualitas) → E10 (UAT/Deploy)
E1/E2 → E11 (Waiting List & Google OAuth) ──────────────────────────────────────────────┘
E12 (Design System) berjalan paralel, mulai setelah E0-2 ───────────────────────────────┘
```

**Jalur kritis:** E0 → E1 → E2 → E3 → E8 → E10.
**Paralel yang disarankan:** E12 (desain) dapat dimulai lebih awal; E11 (waiting list) setelah E2 selesai.

---

## 4. Log Progress (diisi agent setiap menyelesaikan task)

> Setiap kali sebuah task ditandai `Done`, tambahkan satu baris di bawah ini (terbaru di atas). Format tanggal: `YYYY-MM-DD`.

| Tanggal | Task ID | Ringkasan | Referensi (commit/PR) |
| --- | --- | --- | --- |
| — | — | *(belum ada task yang diselesaikan)* | — |

---

## 5. Definition of Done (berlaku untuk semua task)

- [ ] Kode lolos ESLint & Prettier (NFR-MNT-03).
- [ ] TypeScript tanpa galat (`tsc --noEmit`).
- [ ] Validasi input dengan Zod di sisi server (NFR-SEC-02).
- [ ] Endpoint tulis memerlukan autentikasi (NFR-SEC-03).
- [ ] Responsif 360 px – 1920 px, tanpa gulir horizontal.
- [ ] Teks antarmuka berbahasa Indonesia (C-01).
- [ ] Sesuai pedoman desain (C-10) bila menyentuh UI.
- [ ] Berhasil di-build OpenNext & berjalan di `wrangler preview`.
- [ ] Kode di-*review* dan di-*merge* ke branch utama.
- [ ] Status task & Log Progress (§4) diperbarui.
