# Product Requirements Document (PRD)
## Website Landing Page Game BAREN Berbasis CMS

| Field | Keterangan |
| --- | --- |
| Nama Produk | BAREN Web |
| Jenis Produk | Website landing page + Content Management System (CMS) |
| Versi Dokumen | 1.1 |
| Tanggal | 8 Oktober 2026 |
| Status | Draft |
| Sumber Acuan | SRS BAREN Web (`docs/SRS.md`) |
| Mitra | Cikara Studio |
| Tim Penyusun | Sekar Ayu Fatmasari (237006054), Shelva Nur Fatimah (237006069), Farid Firdaus (237006081) |
| Institusi | Jurusan Informatika, Fakultas Teknik, Universitas Siliwangi |

---

## 1. Ringkasan Produk

**BAREN** adalah game yang terinspirasi dari permainan tradisional *benteng-bentengan* (Baren/Bebentengan). Mitra membutuhkan sebuah **website landing page** untuk mempromosikan game tersebut. Seluruh konten situs harus dapat dikelola secara dinamis oleh mitra melalui **Panel Admin (CMS)** tanpa mengubah kode program.

**BAREN Web** terdiri atas dua bagian utama:
1. **Situs Publik** — landing page yang diakses pengunjung tanpa login.
2. **Panel Admin (CMS)** — area terautentikasi untuk mengelola seluruh konten situs publik.

> **Mode Waiting List:** Game BAREN belum dirilis. Situs berjalan dalam mode *waiting list* — pengunjung dapat bergabung melalui **login Google OAuth**, dan email pendaftar disimpan di basis data (`waitlist`). Oleh karena itu header Situs Publik menyediakan **tombol Login**.

### 1.1 Tujuan Produk
- Menyediakan kanal promosi resmi game BAREN yang menarik dan informatif.
- Memungkinkan mitra mengelola seluruh konten secara mandiri (tanpa developer).
- Menjaga konsistensi branding dan penyampaian informasi game.
- **Mengumpulkan daftar tunggu (waiting list) calon pemain** untuk dihubungi saat game dirilis, dengan login Google OAuth agar email terverifikasi dan tanpa perlu mengisi formulir manual.

### 1.2 Metrik Keberhasilan (Success Metrics)
| Metrik | Target | Sumber |
| --- | --- | --- |
| Largest Contentful Paint halaman beranda (mobile, 4G) | ≤ 3 detik | NFR-PRF-01 |
| Skor Lighthouse Performance (mobile) | ≥ 80 | NFR-PRF-02 |
| Skor Lighthouse Accessibility | ≥ 90 | NFR-ACC-01 |
| Waktu admin mengganti logo tanpa panduan | ≤ 5 menit (3/3 penguji) | NFR-USE-02 |
| Waktu tayang perubahan konten di situs publik | ≤ 60 detik | FR-ADM-27 |
| Bebas gulir horizontal (360 px – 1920 px) | 100% | NFR-USE-01 |
| Langkah bergabung Waiting List | ≤ 3 langkah | NFR-USE-03 |

---

## 2. Latar Belakang & Masalah

| Masalah | Dampak | Solusi yang Diusulkan |
| --- | --- | --- |
| Game BAREN belum memiliki kanal promosi resmi terpusat | Sulit menjangkau calon pemain & membangun awareness | Landing page publik yang informatif |
| Mitra tidak memiliki tim developer tetap | Perubahan konten bergantung pada developer | CMS yang dapat dikelola mandiri |
| Konten promosi (event, berita, galeri) bersifat dinamis | Konten cepat usang | Manajemen konten real-time dari Panel Admin |
| Promosi tersebar di banyak platform | Branding tidak konsisten | Satu sumber konten dengan branding terpusat |
| Game belum dirilis; pemain tidak bisa langsung memainkan | Kehilangan potensi pemain awal (early adopters) | **Waiting list** dengan login Google OAuth untuk mengumpulkan email terverifikasi |

---

## 3. Target Pengguna & Persona

| Persona | Deskripsi | Kebutuhan Utama | Keahlian Teknis |
| --- | --- | --- | --- |
| **Pengunjung** | Calon pemain, komunitas, dan publik umum yang mengakses Situs Publik tanpa login | Melihat informasi game, fitur, cara main, galeri, berita, FAQ, dan tautan unduhan | Tidak disyaratkan |
| **Calon Pemain (Waiting List)** | Pengunjung yang login dengan akun Google untuk bergabung ke waiting list | Mendaftar cepat via Google, melihat status terdaftar, logout | Dapat login akun Google |
| **Admin Mitra** | Staf mitra yang login ke Panel Admin untuk mengelola konten | CRUD konten, mengunggah aset, mengelola branding, mengelola waiting list | Dapat mengoperasikan browser dan mengunggah berkas |

---

## 4. Ruang Lingkup

### 4.1 In Scope
**Situs Publik (10 modul):**
- **Home (Hero)** — logo, nama/tagline, banner/video, tombol CTA, tombol **Login/Join Waiting List**.
- **About Game** — deskripsi, konsep permainan, cuplikan gameplay.
- **Game Features** — daftar fitur utama dengan ikon/gambar.
- **How to Play** — langkah bermain bernomor + video demo.
- **Gallery** — screenshot, artwork, banner, video.
- **News/Updates** — berita, event, pengumuman (dengan paginasi & detail slug).
- **FAQ** — accordion.
- **Download** — tautan unduhan/platform distribusi (status "Segera Hadir" selama belum rilis).
- **Contact** — email dan tautan media sosial.
- **Waiting List** — pendaftaran pengunjung melalui **login Google OAuth**.

**Panel Admin (10 modul):**
- Dashboard, Branding Management, Hero/Banner Management, Game Content Management, Gallery & Video Management, News Management, FAQ Management, Social Media & Contact Management, **Waiting List Management**, Admin Account Management.

### 4.2 Out of Scope
- Pembuatan/pengembangan game BAREN itu sendiri.
- Sistem pembayaran / e-commerce.
- Multi-bahasa (seluruh antarmuka berbahasa Indonesia).
- Integrasi analitik lanjutan / CRM (kecuali disebutkan kemudian).
- Manajemen pengguna multi-role (hanya peran admin; pengunjung waiting list tidak memiliki peran admin).
- Login pengunjung selain Google OAuth (mis. email/password untuk pengunjung, Facebook, Apple).

### 4.3 Batasan (Constraints)
- **C-01** Seluruh teks antarmuka berbahasa Indonesia.
- **C-02** Tampilan dirancang *mobile-first*.
- **C-03** Teknologi wajib sesuai Subbab 2.4 SRS.
- **C-04** Seluruh kode server berjalan pada runtime Cloudflare Workers; tidak boleh memakai modul native Node.js.
- **C-05** Koneksi Neon Postgres memakai driver kompatibel Workers.
- **C-06** Unggahan aset memakai presigned URL ke R2; berkas tidak melewati Workers.
- **C-07** Rahasia tidak disimpan di repositori (memakai secret Workers), termasuk kredensial Google OAuth.
- **C-08** Seluruh komunikasi memakai HTTPS.
- **C-09** Kode sumber disimpan di repositori Git.
- **C-10** Gaya visual landing page mengacu pada referensi desain (Valorant) dan disesuaikan dengan branding BAREN.

---

## 5. Arsitektur & Teknologi

Aplikasi web mandiri dalam **satu repositori (monorepo)**. Antarmuka Situs Publik, Panel Admin, dan API berada dalam satu aplikasi Next.js yang dijalankan pada Cloudflare Workers.

```
Pengunjung ──┐
             ├──> Next.js (App Router) di Cloudflare Workers ──> Neon Postgres (Drizzle ORM)
Admin ───────┘        │
                      ├──> Cloudflare R2 (presigned URL, upload langsung dari browser admin)
                      └──> Google OAuth 2.0 (login waiting list via Auth.js)
```

**Stack Teknologi (SRS 2.4):**
| Komponen | Teknologi |
| --- | --- |
| Framework aplikasi | Next.js 15 (App Router) + TypeScript |
| Backend/API | Next.js Route Handlers |
| Platform deployment | Cloudflare Workers (@opennextjs/cloudflare + wrangler) |
| Basis data | Neon Postgres |
| ORM | Drizzle ORM + drizzle-kit |
| Penyimpanan aset | Cloudflare R2 (presigned URL) |
| Autentikasi | Auth.js v5 + Drizzle adapter (Credentials untuk admin + Google OAuth untuk waiting list) |
| Antarmuka | Tailwind CSS + shadcn/ui |
| Validasi | Zod |
| Formulir | react-hook-form + zodResolver |
| Optimasi gambar | next/image + custom loader R2 |
| Rahasia | wrangler secret / .dev.vars |
| Pengelola paket | pnpm |
| Kualitas kode | ESLint + Prettier |

**Pola unggah aset:** browser admin → presigned URL R2 (langsung). API hanya menerbitkan URL dan menyimpan alamat berkas di basis data.

---

## 6. Kebutuhan Fungsional

### 6.1 Situs Publik
| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-PUB-01 | Hero: logo, nama/tagline, banner/video latar, tombol CTA sesuai data admin | Must |
| FR-PUB-02 | Tombol CTA Hero mengarah ke tautan yang ditetapkan admin | Must |
| FR-PUB-03 | Banner bergantian (carousel) jika ada lebih dari satu banner | Should |
| FR-PUB-04 | Seksi About Game: judul, deskripsi (konsep), gambar gameplay | Must |
| FR-PUB-05 | Seksi Game Features: kartu ikon/gambar + judul + deskripsi sesuai urutan admin | Must |
| FR-PUB-06 | Seksi How to Play: langkah bernomor berurutan + gambar/video | Must |
| FR-PUB-07 | Video demo game pada How to Play | Must |
| FR-PUB-08 | Seksi Gallery: screenshot, artwork, banner, video | Must |
| FR-PUB-09 | Pengunjung dapat memperbesar gambar & memutar video di Gallery | Should |
| FR-PUB-10 | Daftar berita berstatus terbit, terbaru, paginasi 9/halaman | Must |
| FR-PUB-11 | Halaman detail berita berbasis slug | Must |
| FR-PUB-12 | FAQ accordion | Must |
| FR-PUB-13 | Tombol unduhan per platform (Steam, Play Store, App Store, dll.) | Must |
| FR-PUB-14 | Email kontak & tautan media sosial | Must |
| FR-PUB-15 | Logo, favicon, nama game tampil di seluruh halaman | Must |
| FR-PUB-16 | Menu navigasi sticky menuju seksi terkait | Should |
| FR-PUB-17 | Menu navigasi berbentuk lipat (< 768 px) | Must |
| FR-PUB-18 | Tombol **Login** pada header Situs Publik untuk bergabung ke Waiting List | Must |
| FR-PUB-19 | Menekan Login / Join Waiting List memulai proses login Google OAuth | Must |
| FR-PUB-20 | Setelah login Google, simpan email (+ nama & foto bila ada) ke tabel `waitlist` | Must |
| FR-PUB-21 | Idempoten: email sudah terdaftar tidak membuat duplikat; tampilkan status "sudah terdaftar" | Must |
| FR-PUB-22 | Setelah login, tampilkan status keikutsertaan & pesan terima kasih | Must |
| FR-PUB-23 | Tombol logout bagi pengunjung yang sudah login | Must |
| FR-PUB-24 | Tampilkan email pengunjung yang sedang login (mis. menu akun) | Should |
| FR-PUB-25 | Selama belum rilis, tombol unduhan menampilkan "Segera Hadir" / pengingat Waiting List | Should |

### 6.2 Panel Admin
**3.3.1 Admin Account Management**
| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-ADM-01 | Autentikasi email+password; pesan error generik tanpa menyebut kolom salah | Must |
| FR-ADM-02 | Logout mengakhiri sesi | Must |
| FR-ADM-03 | Sesi berakhir otomatis 60 menit setelah login | Must |
| FR-ADM-04 | Redirect ke login untuk akses `/admin` tanpa sesi valid | Must |
| FR-ADM-05 | Admin dapat mengubah nama & email akun | Should |
| FR-ADM-06 | Ubah password (perlu password lama); baru min. 8 karakter & berbeda dari lama | Must |

**3.3.2 Dashboard**
| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-ADM-07 | Dashboard: jumlah fitur, item galeri, berita, FAQ, **jumlah pendaftar waiting list**, + waktu pembaruan terakhir | Should |

**3.3.3 Branding Management**
| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-ADM-08 | Ubah logo, favicon, nama game | Must |

**3.3.4 Hero/Banner Management**
| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-ADM-09 | Ubah judul, subjudul, video latar, teks & tautan CTA Hero | Must |
| FR-ADM-10 | Tambah/ubah/hapus banner Hero | Should |

**3.3.5 Game Content Management**
| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-ADM-11 | Ubah judul, deskripsi, gambar gameplay About Game | Must |
| FR-ADM-12 | CRUD + urutkan Game Features | Must |
| FR-ADM-13 | CRUD + urutkan langkah How to Play (dengan media) | Must |
| FR-ADM-14 | Ubah video demo game How to Play | Must |

**3.3.6 Gallery & Video Management**
| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-ADM-15 | Unggah screenshot, artwork, banner, video ke Gallery | Must |
| FR-ADM-16 | Hapus aset Gallery | Must |
| FR-ADM-17 | Tolak presigned URL gambar > 5 MB dan video > 50 MB | Must |

**3.3.7 News Management**
| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-ADM-18 | CRUD berita (judul, isi, thumbnail) | Must |
| FR-ADM-19 | Status draf/terbit; draf tidak tampil di publik | Must |

**3.3.8 FAQ Management**
| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-ADM-20 | CRUD + urutkan FAQ | Must |

**3.3.9 Social Media & Contact Management**
| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-ADM-21 | CRUD tautan unduhan (platform + label) | Must |
| FR-ADM-22 | CRUD tautan media sosial | Must |
| FR-ADM-23 | Ubah email kontak | Must |

**3.3.10 Waiting List Management**
| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-ADM-28 | Tampilkan daftar pendaftar waiting list (email, nama, tanggal daftar) dengan paginasi & pencarian | Must |
| FR-ADM-29 | Ekspor data waiting list ke berkas CSV | Should |
| FR-ADM-30 | Tampilkan jumlah total pendaftar pada Dashboard & halaman pengelolaan | Should |

**3.3.11 Kebutuhan Umum Panel Admin**
| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-ADM-24 | Validasi input (wajib, tipe & ukuran berkas) + pesan error per kolom | Must |
| FR-ADM-25 | Tautan hanya format URL valid berawalan `https://` | Must |
| FR-ADM-26 | Konfirmasi sebelum menghapus data/aset | Must |
| FR-ADM-27 | Perubahan tampil di publik ≤ 60 detik, tanpa ubah kode/deploy ulang | Must |

---

## 7. Kebutuhan Nonfungsional

| ID | Kategori | Kebutuhan |
| --- | --- | --- |
| NFR-PRF-01 | Performa | LCP beranda ≤ 3 detik (mobile Lighthouse, 4G terkontrol) |
| NFR-PRF-02 | Performa | Lighthouse Performance (mobile) ≥ 80 |
| NFR-PRF-03 | Performa | Gambar via next/image + custom loader R2; lazy loading di bawah fold |
| NFR-USE-01 | Kegunaan | Bebas gulir horizontal 360 px – 1920 px |
| NFR-USE-02 | Kegunaan | 3/3 calon admin ganti logo tanpa panduan ≤ 5 menit |
| NFR-USE-03 | Kegunaan | Alur bergabung Waiting List selesai maksimal 3 langkah (Login → pilih akun Google → konfirmasi) |
| NFR-ACC-01 | Aksesibilitas | Lighthouse Accessibility ≥ 90; setiap gambar informatif punya alt |
| NFR-CMP-01 | Kompatibilitas | Berfungsi di Chrome, Firefox, Edge, Safari (2 versi mayor terakhir) |
| NFR-SEC-01 | Keamanan | Password di-hash dengan algoritma kompatibel Workers (mis. bcryptjs) |
| NFR-SEC-02 | Keamanan | Validasi input dengan Zod di server; semua query via Drizzle ORM |
| NFR-SEC-03 | Keamanan | Endpoint tulis menolak tanpa autentikasi dengan status 401 |
| NFR-SEC-04 | Keamanan | Semua akses HTTPS; HTTP dialihkan ke HTTPS |
| NFR-SEC-05 | Keamanan | Presigned URL kedaluwarsa ≤ 10 menit, hanya admin terautentikasi, hanya tipe berkas diizinkan |
| NFR-SEC-06 | Keamanan | Rahasia disimpan sebagai secret Workers; `.dev.vars` tidak masuk repositori |
| NFR-SEC-07 | Keamanan | Verifikasi email dari Google OAuth; tidak menyimpan token akses OAuth di klien |
| NFR-MNT-01 | Pemeliharaan | README berisi langkah instalasi, konfigurasi, deployment |
| NFR-MNT-02 | Pemeliharaan | Perubahan skema via migrasi drizzle-kit |
| NFR-MNT-03 | Pemeliharaan | Kode lolos ESLint & Prettier tanpa galat |
| NFR-DEP-01 | Deployment | Dapat dipublikasikan ke Cloudflare Workers via wrangler deploy |

---

## 8. Kebutuhan Antarmuka Eksternal

| ID | Kebutuhan |
| --- | --- |
| EI-01 | UI dapat digunakan pada lebar layar 360 px – 1920 px |
| EI-02 | Situs Publik & Panel Admin berkomunikasi dengan backend via Route Handlers Next.js (JSON) |
| EI-03 | Akses Neon Postgres via Drizzle ORM dengan driver kompatibel Workers |
| EI-04 | Sistem menerbitkan presigned URL Cloudflare R2 untuk setiap unggahan aset |
| EI-05 | Terima gambar JPG, PNG, WebP; SVG khusus logo/ikon |
| EI-06 | Terima video MP4 |
| EI-07 | Tautan keluar (unduhan & media sosial) terbuka di tab baru |
| EI-08 | Integrasi penyedia identitas Google via protokol OAuth 2.0 (Auth.js v5 Google Provider) |

---

## 9. Model Data (Garis Besar)

| Entitas | Atribut Utama |
| --- | --- |
| `users` | id, nama, email, password_hash, created_at (Auth.js + Drizzle adapter) |
| `accounts` | id, user_id, provider, provider_account_id (Auth.js, untuk OAuth) |
| `sessions` | id, session_token, user_id, expires (Auth.js) |
| `site_settings` | id, nama_game, tagline, logo_url, favicon_url, email_kontak |
| `hero` | id, judul, subjudul, video_url, teks_cta, tautan_cta |
| `hero_banners` | id, gambar_url, urutan |
| `about` | id, judul, deskripsi, gambar_url |
| `features` | id, judul, deskripsi, ikon_url, urutan |
| `how_to_play_steps` | id, judul_langkah, deskripsi, media_url, urutan |
| `how_to_play_video` | id, video_url |
| `gallery_assets` | id, jenis, judul, file_url, urutan |
| `news` | id, judul, slug, isi, thumbnail_url, status, published_at |
| `faq` | id, pertanyaan, jawaban, urutan |
| `social_links` | id, platform, url |
| `download_links` | id, platform, label, url |
| `waitlist` | id, email (unik), nama, foto_url, provider, created_at |

> Rancangan rinci dilakukan pada tahap perancangan.

---

## 10. Asumsi & Ketergantungan

| ID | Asumsi/Ketergantungan |
| --- | --- |
| A-01 | Mitra menyediakan logo, artwork, screenshot, video, dan teks konten |
| A-02 | Mitra menyediakan tautan unduhan dan media sosial |
| A-03 | Akun Cloudflare (Workers & R2) dan Neon tersedia dan aktif |
| A-04 | Domain situs disediakan/disetujui mitra |
| A-05 | Ketersediaan sistem bergantung pada layanan Cloudflare dan Neon |
| A-06 | Kredensial OAuth Google (Client ID & Client Secret) disediakan dan dikonfigurasi tim/mitra |
| A-07 | Game BAREN belum dirilis; tombol unduhan tampil "Segera Hadir" sampai tautan tersedia |

---

## 11. Alur Pengguna Utama

**Pengunjung:**
1. Membuka landing page → melihat Hero, About, Features, How to Play.
2. Menelusuri Gallery, membaca News, membuka detail berita.
3. Membaca FAQ (accordion).
4. Menekan tombol Download → diarahkan ke platform (tab baru) atau melihat status "Segera Hadir".
5. Menghubungi via email/sosial media.

**Calon Pemain (Waiting List):**
1. Menekan tombol **Login** / "Join Waiting List" di header atau Hero.
2. Memilih akun Google → menyetujui otorisasi.
3. Sistem menyimpan email ke `waitlist` dan menampilkan pesan terima kasih + status "sudah terdaftar".
4. Bila login lagi, sistem mengenali email dan menampilkan status tanpa duplikasi.

**Admin:**
1. Login dengan email & password → masuk Dashboard.
2. Mengelola Branding, Hero, Game Content, Gallery, News, FAQ, Social & Contact.
3. Mengunggah aset (gambar ≤ 5 MB, video ≤ 50 MB) langsung ke R2.
4. Melihat & mengekspor data Waiting List.
5. Menyimpan perubahan → tayang di publik ≤ 60 detik.
6. Logout / sesi berakhir otomatis setelah 60 menit.

---

## 11A. Acuan Desain (Design Reference)

Tampilan dasar landing page mengacu pada situs resmi **VALORANT** (https://playvalorant.com/id-id) sebagai inspirasi tata letak dan gaya visual, lalu **disesuaikan dengan branding BAREN**.

**Prinsip yang diadopsi:**
- Hero *full-bleed* dengan gambar/video beresolusi tinggi dan judul besar.
- Tema gelap (dark theme) kontras tinggi + satu warna aksen utama.
- Tipografi tegas (display font untuk judul).
- Tombol CTA tegas (uppercase, geometris) dengan hover jelas.
- Navigasi transparan di atas hero → solid saat digulir.
- Seksi berbasis blok, kartu konten dengan overlay gradien.
- Animasi halus, tidak berlebihan (menjaga performa).

**Catatan penting:**
- Tidak menyalin aset berhak cipta milik pihak ketiga; hanya mengadopsi pola tata letak/gaya umum.
- Warna aksen, logo, dan tipografi final mengikuti identitas visual BAREN dari mitra.
- Seluruh keputusan visual tetap mematuhi C-01, C-02, dan NFR-ACC-01.

*(Lihat detail pedoman pada SRS §3.6 — DG-01..DG-10.)*

---

## 12. Kriteria Penerimaan (Definition of Done)

Sebuah fitur dinyatakan selesai apabila:
- [ ] Memenuhi seluruh FR terkait (lihat §6) tanpa galat.
- [ ] Lolos validasi Zod di sisi server dan menampilkan pesan error yang tepat.
- [ ] Responsif 360 px – 1920 px, tanpa gulir horizontal.
- [ ] Tautan keluar memakai `target="_blank"` dengan `rel="noopener noreferrer"`.
- [ ] Lolos ESLint & Prettier.
- [ ] Berhasil di-build OpenNext dan di-*deploy* ke Cloudflare Workers.
- [ ] Perubahan konten tayang di publik ≤ 60 detik.
- [ ] Untuk fitur Waiting List: login Google OAuth idempoten (tidak ada duplikat email).

---

## 13. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Ketergantungan pada Cloudflare/Neon (A-05) | Downtime | Monitoring + fallback error page |
| Keterlambatan aset dari mitra (A-01/A-02) | Blokir konten | Placeholder konten + timeline aset |
| Batasan runtime Workers (C-04) | Pustaka tidak kompatibel | Audit dependensi sejak awal |
| Performa gambar/video besar | Gagal NFR performa | Batas ukuran (FR-ADM-17), next/image, lazy loading |
| Keamanan kredensial | Kebocoran data | Secret Workers (NFR-SEC-06), HTTPS (NFR-SEC-04) |
| Kredensial Google OAuth belum tersedia (A-06) | Waiting list tidak berfungsi | Siapkan proyek Google Cloud + konfigurasi redirect URI sejak awal |
| Email ganda pada waiting list | Data kotor | Constraint unik pada kolom email + logika idempoten (FR-PUB-21) |
| Duplikasi desain aset berhak cipta | Masalah legal | Hanya adopsi pola tata letak; aset dibuat sendiri (DG-10) |

---

## 14. Milestone (Gambaran Tingkat Tinggi)

| Fase | Fokus | Output |
| --- | --- | --- |
| M0 | Fondasi & Setup | Repo, CI, koneksi Neon, R2, auth dasar |
| M1 | CMS Core & Autentikasi | Login admin, Dashboard, skema DB, API dasar |
| M2 | Konten Statis Situs Publik | Hero, About, Features, How to Play, Branding |
| M3 | Konten Dinamis | Gallery, News, FAQ, Download, Contact |
| M4 | Waiting List & Google OAuth | Login pengunjung, tabel `waitlist`, manajemen waiting list admin |
| M5 | Desain & Penyempurnaan | Penerapan gaya ala Valorant, performa, aksesibilitas, SEO, kompatibilitas |
| M6 | UAT & Deployment | Uji mitra, deploy produksi, dokumentasi |

> Rincian pekerjaan, estimasi, dan pemetaan kebutuhan tersedia pada dokumen **docs/TASK_BREAKDOWN.md**.
