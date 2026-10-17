# SPESIFIKASI KEBUTUHAN PERANGKAT LUNAK (SRS)

## Website Landing Page Game BAREN Berbasis Content Management System

| Field         | Keterangan                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------ |
| Nama Produk   | BAREN Web                                                                                  |
| Versi Dokumen | 1.3                                                                                        |
| Status        | Draft                                                                                      |
| Mitra         | Cikara Studio                                                                              |
| Tim Penyusun  | Sekar Ayu Fatmasari (237006054), Shelva Nur Fatimah (237006069), Farid Firdaus (237006081) |
| Institusi     | Jurusan Informatika, Fakultas Teknik, Universitas Siliwangi                                |
| Periode       | 2026/2027                                                                                  |

**Riwayat Revisi**

| Versi | Tanggal         | Perubahan                                                                                                                                                                                                                        |
| ----- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0   | —               | Versi awal SRS BAREN Web.                                                                                                                                                                                                        |
| 1.1   | 8 Oktober 2026  | Penambahan mode **Waiting List** dengan login **Google OAuth**, entitas `waitlist`, kebutuhan fungsional terkait (FR-PUB-18..25, FR-ADM-28..30), dan **acuan desain** (Valorant).                                                |
| 1.2   | 14 Oktober 2026 | Menetapkan Next.js 16 (App Router) sesuai baseline proyek.                                                                                                                                                                       |
| 1.3   | 17 Oktober 2026 | Rename **Waiting List → Wishlist** (`waitlist` → `wishlist`); news landing **maks 3 tanpa halaman detail** (E7-2 DITUNDA); tambah `landing_cards`, `comments`, FR-PUB-26, FR-ADM-31; nav dipangkas (tanpa ESPORTS/LEBIH BANYAK). |

---

## BAB 1 PENDAHULUAN

### 1.1 Tujuan

Dokumen Spesifikasi Kebutuhan Perangkat Lunak (SRS) ini menetapkan kebutuhan sistem BAREN Web, yaitu website landing page untuk mempromosikan game BAREN berbasis Content Management System (CMS). Dokumen ini menjadi acuan bagi tim pengembang dan mitra dalam merancang, membangun, dan menguji sistem.

### 1.2 Ruang Lingkup

BAREN adalah game yang terinspirasi dari permainan tradisional benteng-bentengan (Baren/Bebentengan). Game ini dikembangkan oleh mitra. Mitra membutuhkan website landing page yang mempromosikan game tersebut. Seluruh kontennya harus dapat dikelola secara dinamis oleh mitra tanpa perubahan kode program.

Pada tahap ini game BAREN **belum dirilis** sehingga situs berjalan dalam **mode Wishlist** (sebelumnya "Waiting List"): pengunjung dapat mendaftar untuk mendapat kabar peluncuran. Pendaftaran dilakukan melalui **login Google OAuth** yang menyimpan email pendaftar ke basis data. Istilah publik selalu "wishlist".

Sistem BAREN Web terdiri atas dua bagian.

**1. Situs Publik (landing page)**

| Modul           | Isi                                                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Home (Hero)     | Logo, nama/tagline, banner/video, tombol CTA, dan tombol Masuk/Gabung Wishlist                                             |
| About Game      | Dirender dari `landing_cards`; singleton `about` hanya fallback/seed                                                       |
| Game Features   | Daftar fitur utama beserta ikon atau gambar (tetap grid 3 kolom)                                                           |
| How to Play     | Langkah-langkah bermain dan video demo (`#cara-main`)                                                                      |
| Gallery         | Screenshot, artwork, banner, dan video                                                                                     |
| Kartu Fleksibel | Daftar `landing_cards` pengganti Event/About/Agents/Maps (gambar, eyebrow, judul, subjudul, paragraf, CTA, urutan, terbit) |
| News/Updates    | Maks 3 berita terbit di landing; 0 item → seksi hilang; tanpa halaman detail (detail slug DITUNDA)                         |
| FAQ             | Pertanyaan umum tentang game (0 item → seksi hilang)                                                                       |
| Download        | Tautan unduhan atau platform distribusi                                                                                    |
| Contact         | Email dan tautan media sosial                                                                                              |
| Komentar        | Satu kolom di landing (`#komentar`); login Google wajib; langsung tayang; admin hapus                                      |
| Wishlist        | Pendaftaran pengunjung melalui login Google OAuth                                                                          |

**2. Panel Admin (CMS)**

| Modul                                          | Hal yang Dikelola                                         |
| ---------------------------------------------- | --------------------------------------------------------- |
| Dashboard                                      | Ringkasan konten                                          |
| Branding Management                            | Logo, favicon, dan nama game                              |
| Hero/Banner Management                         | Banner, video, judul, subjudul, dan CTA                   |
| Game Content Management                        | About, Game Features, dan How to Play                     |
| Gallery & Video Management                     | Unggah dan hapus screenshot, artwork, banner, dan video   |
| News Management                                | Pembuatan dan pengubahan berita                           |
| FAQ Management                                 | Penambahan, pengubahan, dan penghapusan FAQ               |
| Social Media & Contact Management              | Tautan media sosial, tautan unduhan, dan informasi kontak |
| Wishlist Management (rename dari Waiting List) | Melihat, mencari, dan mengekspor data pendaftar wishlist  |
| Admin Account Management                       | Login, logout, dan pengaturan akun                        |
| Landing Cards Management (baru)                | CRUD + urut + toggle terbit kartu fleksibel               |
| Komentar Management (baru)                     | Hapus komentar dengan konfirmasi                          |

### 1.3 Definisi, Akronim, dan Singkatan

| Istilah      | Definisi                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| SRS          | Software Requirements Specification, dokumen spesifikasi kebutuhan perangkat lunak                        |
| CMS          | Content Management System, sistem untuk mengelola konten situs tanpa mengubah kode program                |
| Landing page | Halaman web yang memperkenalkan produk dan mengarahkan pengunjung bertindak                               |
| BAREN Web    | Nama sistem yang dikembangkan, yang terdiri atas Situs Publik dan Panel Admin                             |
| Situs Publik | Bagian sistem yang diakses pengunjung tanpa login                                                         |
| Panel Admin  | Bagian sistem yang diakses admin setelah login                                                            |
| Admin        | Pengguna dari pihak mitra yang mengelola konten                                                           |
| Pengunjung   | Pengguna yang mengakses Situs Publik                                                                      |
| Wishlist     | Daftar pendaftar yang ingin dihubungi saat game BAREN dirilis (istilah publik; sebelumnya "Waiting List") |
| OAuth        | Protokol otorisasi pihak ketiga, mis. login menggunakan akun Google                                       |
| Google OAuth | Mekanisme login Situs Publik memakai akun Google untuk bergabung Wishlist                                 |
| CTA          | Call to Action, tombol ajakan bertindak, misalnya Play, Download, atau Learn More                         |
| CRUD         | Create, Read, Update, Delete, yaitu operasi membuat, membaca, mengubah, dan menghapus data                |
| Aset         | Berkas gambar atau video yang diunggah admin                                                              |
| Backend/API  | Bagian server yang mengolah data dan melayani permintaan dari Situs Publik dan Panel Admin                |

### 1.4 Referensi

1. ISO/IEC/IEEE 29148:2018. Systems and software engineering — Life cycle processes — Requirements engineering.
2. IEEE Std 830-1998. IEEE Recommended Practice for Software Requirements Specifications.
3. Mitra. Konsep fitur landing page dan admin panel game BAREN.
4. Riot Games. _VALORANT Official Site_ — https://playvalorant.com/id-id. Acuan gaya desain antarmuka landing page (disesuaikan dengan branding BAREN).

### 1.5 Gambaran Dokumen

| Bagian                    | Isi                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Bab 1. Pendahuluan        | Tujuan, ruang lingkup, definisi, referensi, dan gambaran dokumen                                               |
| Bab 2. Deskripsi Umum     | Perspektif produk, fungsi, karakteristik pengguna, lingkungan operasional, batasan, asumsi, dan ketergantungan |
| Bab 3. Kebutuhan Spesifik | Kebutuhan antarmuka, fungsional, nonfungsional, data, dan pedoman desain                                       |

Konvensi penulisan yang dipakai dalam dokumen ini adalah sebagai berikut.

1. Kata "harus" menandakan kebutuhan wajib.
2. Setiap kebutuhan memiliki ID unik.
3. Nilai dalam tanda kurung siku, misalnya […], belum ditetapkan dan dilengkapi sebelum dokumen disetujui.

---

## BAB 2 DESKRIPSI UMUM

### 2.1 Perspektif Produk

BAREN Web adalah aplikasi web mandiri yang dibangun dalam satu repositori (monorepo) dengan Next.js. Antarmuka Situs Publik, Panel Admin, dan API berada dalam satu aplikasi yang dijalankan pada Cloudflare Workers. API berupa Route Handlers Next.js. Data konten disimpan pada basis data Neon Postgres. Aset gambar dan video disimpan pada Cloudflare R2.

Unggahan aset dilakukan langsung dari peramban admin ke R2 melalui presigned URL. API hanya menerbitkan URL tersebut dan menyimpan alamat berkas pada basis data.

Autentikasi memakai Auth.js v5 dengan Drizzle adapter dan mendukung dua jalur:

- **Admin** — login email dan password (kredensial).
- **Pengunjung Wishlist** — login Google OAuth.

### 2.2 Fungsi Produk

1. Menyajikan informasi game BAREN kepada pengunjung melalui modul Home, Kartu Fleksibel, Game Features, How to Play, Gallery, News/Updates (maks 3), FAQ, Download, Contact, dan Komentar.
2. Menyediakan pendaftaran **Wishlist** melalui login Google OAuth yang menyimpan email pendaftar.
3. Menyediakan Panel Admin untuk mengelola seluruh konten tersebut, termasuk branding, aset, kartu, komentar, dan data wishlist.
4. Menyimpan konten pada basis data dan aset pada penyimpanan objek, sehingga perubahan tampil tanpa mengubah kode program.

### 2.3 Karakteristik Pengguna

| Kelas Pengguna          | Deskripsi                                                            | Keahlian Teknis                                     |
| ----------------------- | -------------------------------------------------------------------- | --------------------------------------------------- |
| Pengunjung              | Pengguna yang mengakses Situs Publik tanpa login                     | Tidak disyaratkan                                   |
| Calon Pemain (Wishlist) | Pengunjung yang login dengan akun Google untuk bergabung ke wishlist | Dapat login akun Google                             |
| Admin                   | Staf mitra yang login ke Panel Admin untuk mengelola konten          | Dapat mengoperasikan peramban dan mengunggah berkas |

### 2.4 Lingkungan Operasional

**Sisi klien.** Situs diakses melalui peramban Chrome, Firefox, Edge, dan Safari pada ponsel, tablet, dan desktop.

**Sisi server.** Teknologi yang digunakan tercantum pada tabel berikut.

| Komponen            | Teknologi                                                      |
| ------------------- | -------------------------------------------------------------- |
| Framework aplikasi  | Next.js 16 (App Router) dengan TypeScript                      |
| Backend/API         | Next.js Route Handlers (satu repositori dengan frontend)       |
| Platform deployment | Cloudflare Workers melalui @opennextjs/cloudflare dan wrangler |
| Basis data          | Neon Postgres                                                  |
| ORM                 | Drizzle ORM dan drizzle-kit (migrasi)                          |
| Penyimpanan aset    | Cloudflare R2 (presigned URL)                                  |
| Autentikasi         | Auth.js v5 dengan Drizzle adapter (Credentials + Google OAuth) |
| Antarmuka           | Tailwind CSS dan shadcn/ui                                     |
| Validasi            | Zod                                                            |
| Formulir            | react-hook-form dengan zodResolver                             |
| Optimasi gambar     | next/image dengan custom loader R2                             |
| Pengelolaan rahasia | wrangler secret (produksi) dan .dev.vars (lokal)               |
| Pengelola paket     | pnpm                                                           |
| Kualitas kode       | ESLint dan Prettier                                            |

### 2.5 Batasan

| ID   | Batasan                                                                                                                                                              |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-01 | Seluruh teks antarmuka harus berbahasa Indonesia.                                                                                                                    |
| C-02 | Tampilan harus dirancang mobile-first.                                                                                                                               |
| C-03 | Sistem harus dibangun dengan teknologi pada Subbab 2.4.                                                                                                              |
| C-04 | Seluruh kode server harus berjalan pada runtime Cloudflare Workers. Pustaka yang bergantung pada modul native Node.js tidak boleh digunakan.                         |
| C-05 | Koneksi ke Neon Postgres harus memakai driver yang kompatibel dengan Workers.                                                                                        |
| C-06 | Unggahan aset harus memakai presigned URL ke R2. Berkas tidak boleh melewati Workers.                                                                                |
| C-07 | Kunci akses, rahasia Auth.js, kredensial Google OAuth, dan kredensial basis data tidak boleh disimpan di repositori. Nilainya harus disimpan sebagai secret Workers. |
| C-08 | Seluruh komunikasi harus memakai HTTPS.                                                                                                                              |
| C-09 | Kode sumber harus disimpan pada repositori Git.                                                                                                                      |
| C-10 | Gaya visual landing page harus mengacu pada referensi desain pada Subbab 3.6 dan disesuaikan dengan branding BAREN.                                                  |

### 2.6 Asumsi dan Ketergantungan

| ID   | Asumsi/Ketergantungan                                                                                                                      |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| A-01 | Mitra menyediakan logo, artwork, screenshot, video, dan teks konten.                                                                       |
| A-02 | Mitra menyediakan tautan unduhan dan media sosial.                                                                                         |
| A-03 | Akun Cloudflare (Workers dan R2) dan akun Neon tersedia dan aktif selama proyek berjalan.                                                  |
| A-04 | Domain situs disediakan atau disetujui oleh mitra.                                                                                         |
| A-05 | Ketersediaan sistem bergantung pada layanan Cloudflare dan Neon.                                                                           |
| A-06 | Kredensial OAuth Google (Client ID dan Client Secret) disediakan dan dikonfigurasi oleh tim/mitra.                                         |
| A-07 | Game BAREN belum dirilis sehingga situs berjalan dalam mode Wishlist; tombol unduhan tampil sebagai "Segera Hadir" sampai tautan tersedia. |

---

## BAB 3 KEBUTUHAN SPESIFIK

### 3.1 Kebutuhan Antarmuka Eksternal

| ID    | Kebutuhan                                                                                                           |
| ----- | ------------------------------------------------------------------------------------------------------------------- |
| EI-01 | Antarmuka pengguna harus dapat digunakan pada lebar layar 360 px hingga 1920 px.                                    |
| EI-02 | Situs Publik dan Panel Admin harus berkomunikasi dengan backend melalui Route Handlers Next.js berformat JSON.      |
| EI-03 | Sistem harus mengakses Neon Postgres melalui Drizzle ORM dengan driver yang kompatibel dengan Cloudflare Workers.   |
| EI-04 | Sistem harus menerbitkan presigned URL Cloudflare R2 untuk setiap unggahan aset oleh admin.                         |
| EI-05 | Sistem harus menerima unggahan gambar bertipe JPG, PNG, dan WebP, serta SVG khusus untuk logo dan ikon.             |
| EI-06 | Sistem harus menerima unggahan video bertipe MP4.                                                                   |
| EI-07 | Tautan keluar (unduhan dan media sosial) harus terbuka pada tab baru.                                               |
| EI-08 | Sistem harus berintegrasi dengan penyedia identitas Google melalui protokol OAuth 2.0 (Auth.js v5 Google Provider). |

### 3.2 Kebutuhan Fungsional Situs Publik

| ID        | Kebutuhan                                                                                                                                                                                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-PUB-01 | Sistem harus menampilkan Hero berisi logo, nama atau tagline game, banner atau video latar, dan tombol CTA sesuai data yang disimpan admin. Hero tanpa data admin yang siap render atau tidak terbit tidak boleh memakai fallback runtime dan harus disembunyikan. |
| FR-PUB-02 | Tombol CTA pada Hero harus mengarah ke tautan yang ditetapkan admin.                                                                                                                                                                                               |
| FR-PUB-03 | Sistem harus menampilkan banner secara bergantian apabila admin menambahkan lebih dari satu banner.                                                                                                                                                                |
| FR-PUB-04 | Sistem harus menampilkan seksi About Game berisi judul, deskripsi game (termasuk konsep permainan), dan gambar gameplay — dirender dari `landing_cards`; singleton `about` hanya fallback/seed.                                                                    |
| FR-PUB-05 | Sistem harus menampilkan seksi Game Features berupa kartu berisi ikon atau gambar, judul, dan deskripsi, sesuai urutan yang ditetapkan admin. Eyebrow, judul, dan pesan empty state dapat dikelola admin.                                                          |
| FR-PUB-06 | Sistem harus menampilkan seksi How to Play berisi langkah-langkah bermain bernomor berurutan, masing-masing dengan teks serta gambar atau video; judul seksi dapat dikelola admin.                                                                                 |
| FR-PUB-07 | Sistem harus menampilkan video demo game pada seksi How to Play.                                                                                                                                                                                                   |
| FR-PUB-08 | Sistem harus menampilkan seksi Gallery berisi screenshot, artwork, banner, dan video; eyebrow, judul, deskripsi, dan empty state dapat dikelola admin.                                                                                                             |
| FR-PUB-09 | Pengunjung harus dapat memperbesar gambar dan memutar video pada Gallery.                                                                                                                                                                                          |
| FR-PUB-10 | Sistem harus menampilkan daftar berita berstatus terbit di landing, diurutkan dari yang terbaru, maks 3 item; 0 item → seksi hilang (bukan empty state); judul seksi dan label CTA dapat dikelola admin; tanpa halaman detail.                                     |
| FR-PUB-11 | Sistem harus menampilkan halaman detail berita pada alamat berbasis slug — DITUNDA (dikerjakan setelah landing baru stabil; sitemap tanpa rute berita sampai saat itu).                                                                                            |
| FR-PUB-12 | Sistem harus menampilkan FAQ dalam bentuk accordion, yaitu jawaban tampil saat pertanyaan dipilih; eyebrow dan judul dapat dikelola admin.                                                                                                                         |
| FR-PUB-13 | Sistem harus menampilkan satu kartu Steam berstatus "Segera Hadir" dan tombol Gabung Wishlist; tidak ada tombol per-platform dari admin.                                                                                                                           |
| FR-PUB-14 | Sistem harus menampilkan copy Kontak, email, dan tautan media sosial (misalnya Instagram, TikTok, YouTube, atau Discord) yang ditambahkan admin.                                                                                                                   |
| FR-PUB-15 | Sistem harus menampilkan logo, favicon, dan nama game sesuai data Branding pada seluruh halaman.                                                                                                                                                                   |
| FR-PUB-16 | Sistem harus menyediakan menu navigasi yang tetap terlihat saat halaman digulir dan menuju ke seksi yang dipilih.                                                                                                                                                  |
| FR-PUB-17 | Pada lebar layar di bawah 768 px, menu navigasi harus berbentuk menu lipat.                                                                                                                                                                                        |
| FR-PUB-18 | Sistem harus menyediakan tombol **Masuk/Gabung Wishlist** pada header Situs Publik.                                                                                                                                                                                |
| FR-PUB-19 | Sistem harus memulai proses login Google OAuth saat pengunjung menekan tombol wishlist.                                                                                                                                                                            |
| FR-PUB-20 | Setelah login Google berhasil, sistem harus menyimpan email pendaftar ke tabel `wishlist` beserta nama dan foto profil bila tersedia.                                                                                                                              |
| FR-PUB-21 | Sistem harus bersifat idempoten: email yang sudah terdaftar tidak boleh menghasilkan entri duplikat; sistem menampilkan status "sudah terdaftar".                                                                                                                  |
| FR-PUB-22 | Setelah login, sistem harus menampilkan status keikutsertaan Wishlist (`#wishlist`) dan pesan terima kasih kepada pengunjung.                                                                                                                                      |
| FR-PUB-23 | Sistem harus menyediakan tombol logout bagi pengunjung yang sudah login.                                                                                                                                                                                           |
| FR-PUB-24 | Sistem harus menampilkan email pengunjung yang sedang login pada antarmuka (misalnya pada menu akun).                                                                                                                                                              |
| FR-PUB-25 | Selama game belum dirilis, tombol unduhan pada seksi Download harus menampilkan status "Segera Hadir" atau tombol pengingat Wishlist.                                                                                                                              |
| FR-PUB-26 | Sistem harus menyediakan satu kolom komentar di landing (`#komentar`): login Google wajib; body teks 1–500 karakter tanpa HTML; langsung tayang; anonim ditolak; kirim beruntun dibatasi (mis. maks 5/10 menit per user).                                          |

### 3.3 Kebutuhan Fungsional Panel Admin

#### 3.3.1 Admin Account Management

| ID        | Kebutuhan                                                                                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-ADM-01 | Sistem harus mengautentikasi admin dengan email dan password. Kredensial yang salah harus menghasilkan pesan kesalahan tanpa menyebutkan kolom yang salah. |
| FR-ADM-02 | Sistem harus mengakhiri sesi admin saat admin memilih logout.                                                                                              |
| FR-ADM-03 | Sistem harus mengakhiri sesi admin 60 menit setelah login.                                                                                                 |
| FR-ADM-04 | Sistem harus mengalihkan permintaan ke halaman login untuk setiap halaman /admin yang diakses tanpa sesi valid.                                            |
| FR-ADM-05 | Sistem harus memungkinkan admin mengubah nama dan email akun.                                                                                              |
| FR-ADM-06 | Sistem harus memungkinkan admin mengubah password dengan memasukkan password lama. Password baru minimal 8 karakter dan harus berbeda dari password lama.  |

#### 3.3.2 Dashboard

| ID        | Kebutuhan                                                                                                                                                                         |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-ADM-07 | Sistem harus menampilkan dashboard berisi jumlah fitur game, item galeri, berita, FAQ, **jumlah pendaftar wishlist**, **jumlah komentar**, serta waktu pembaruan konten terakhir. |

#### 3.3.3 Branding Management

| ID        | Kebutuhan                                                              |
| --------- | ---------------------------------------------------------------------- |
| FR-ADM-08 | Sistem harus memungkinkan admin mengubah logo, favicon, dan nama game. |

#### 3.3.4 Hero/Banner Management

| ID        | Kebutuhan                                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------------------- |
| FR-ADM-09 | Sistem harus memungkinkan admin mengubah judul, subjudul, video latar, teks CTA, dan tautan CTA pada Hero. |
| FR-ADM-10 | Sistem harus memungkinkan admin menambah, mengubah, dan menghapus banner Hero.                             |

#### 3.3.5 Game Content Management

| ID        | Kebutuhan                                                                                                                                                       |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-ADM-11 | Sistem harus memungkinkan admin mengubah judul, deskripsi, dan gambar gameplay pada About Game.                                                                 |
| FR-ADM-12 | Sistem harus memungkinkan admin menambah, mengubah, menghapus, dan mengurutkan Game Features.                                                                   |
| FR-ADM-13 | Sistem harus memungkinkan admin menambah, mengubah, menghapus, dan mengurutkan langkah How to Play, termasuk melampirkan gambar atau video pada setiap langkah. |
| FR-ADM-14 | Sistem harus memungkinkan admin mengubah video demo game pada How to Play.                                                                                      |

#### 3.3.6 Gallery & Video Management

| ID        | Kebutuhan                                                                                                                  |
| --------- | -------------------------------------------------------------------------------------------------------------------------- |
| FR-ADM-15 | Sistem harus memungkinkan admin mengunggah screenshot, artwork, banner, dan video ke Gallery.                              |
| FR-ADM-16 | Sistem harus memungkinkan admin menghapus aset dari Gallery.                                                               |
| FR-ADM-17 | Sistem harus menolak penerbitan presigned URL untuk gambar berukuran lebih dari 5 MB dan video berukuran lebih dari 50 MB. |

#### 3.3.7 News Management

| ID        | Kebutuhan                                                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-ADM-18 | Sistem harus memungkinkan admin membuat, mengubah, dan menghapus berita yang terdiri atas judul, isi, dan thumbnail.                           |
| FR-ADM-19 | Sistem harus memungkinkan admin menetapkan status berita sebagai draf atau terbit. Berita berstatus draf tidak boleh tampil pada Situs Publik. |

#### 3.3.8 FAQ Management

| ID        | Kebutuhan                                                                           |
| --------- | ----------------------------------------------------------------------------------- |
| FR-ADM-20 | Sistem harus memungkinkan admin menambah, mengubah, menghapus, dan mengurutkan FAQ. |

#### 3.3.9 Social Media & Contact Management

| ID        | Kebutuhan                                                                                                       |
| --------- | --------------------------------------------------------------------------------------------------------------- |
| FR-ADM-21 | Sistem harus memungkinkan admin menambah, mengubah, dan menghapus tautan unduhan beserta platform dan labelnya. |
| FR-ADM-22 | Sistem harus memungkinkan admin menambah, mengubah, dan menghapus tautan media sosial.                          |
| FR-ADM-23 | Sistem harus memungkinkan admin mengubah email kontak.                                                          |

#### 3.3.10 Wishlist Management (rename dari Waiting List)

| ID        | Kebutuhan                                                                                                       |
| --------- | --------------------------------------------------------------------------------------------------------------- |
| FR-ADM-28 | Sistem harus menampilkan daftar pendaftar wishlist (email, nama, tanggal daftar) dengan paginasi dan pencarian. |
| FR-ADM-29 | Sistem harus memungkinkan admin mengekspor data wishlist ke berkas CSV.                                         |
| FR-ADM-30 | Sistem harus menampilkan jumlah total pendaftar wishlist pada Dashboard dan halaman pengelolaan.                |

#### 3.3.11 Komentar Management (baru)

| ID        | Kebutuhan                                                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-ADM-31 | Sistem harus memungkinkan admin menghapus komentar dengan konfirmasi; tanpa mengubah isi komentar. Daftar admin boleh menampilkan email pelapor. |

#### 3.3.12 Konten Landing Management

| ID        | Kebutuhan                                                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-ADM-32 | Sistem harus memungkinkan admin mengubah copy seksi landing page (eyebrow, judul, deskripsi, pesan kosong) melalui antarmuka admin tanpa deployment. |

#### 3.3.13 Kebutuhan Umum Panel Admin

| ID        | Kebutuhan                                                                                                                                                         |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-ADM-24 | Sistem harus memvalidasi masukan admin (kolom wajib, tipe dan ukuran berkas) dan menampilkan pesan kesalahan yang menyebutkan kolom bermasalah.                   |
| FR-ADM-25 | Sistem harus menerima tautan hanya dalam format URL yang valid dan diawali https://.                                                                              |
| FR-ADM-26 | Sistem harus meminta konfirmasi sebelum menghapus data atau aset.                                                                                                 |
| FR-ADM-27 | Perubahan yang disimpan admin harus tampil pada Situs Publik paling lambat 60 detik setelah penyimpanan, tanpa perubahan kode program dan tanpa deployment ulang. |

### 3.4 Kebutuhan Nonfungsional

| ID         | Kategori       | Kebutuhan                                                                                                                                                                         |
| ---------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-PRF-01 | Performa       | Largest Contentful Paint halaman beranda harus ≤ 3 detik pada profil mobile Lighthouse dengan jaringan 4G terkontrol.                                                             |
| NFR-PRF-02 | Performa       | Skor Lighthouse Performance halaman beranda pada mode mobile harus ≥ 80.                                                                                                          |
| NFR-PRF-03 | Performa       | Gambar harus dimuat melalui next/image dengan custom loader R2. Gambar di bawah layar pertama harus dimuat lambat (lazy loading).                                                 |
| NFR-USE-01 | Kegunaan       | Tampilan harus bebas gulir horizontal pada lebar layar 360 px hingga 1920 px.                                                                                                     |
| NFR-USE-02 | Kegunaan       | Tiga dari tiga calon admin uji harus mampu mengganti logo tanpa panduan dalam waktu ≤ 5 menit.                                                                                    |
| NFR-USE-03 | Kegunaan       | Alur bergabung Wishlist harus dapat diselesaikan maksimal dalam 3 langkah (klik Wishlist → pilih akun Google → konfirmasi).                                                       |
| NFR-ACC-01 | Aksesibilitas  | Skor Lighthouse Accessibility harus ≥ 90. Setiap gambar informatif harus memiliki teks alternatif.                                                                                |
| NFR-CMP-01 | Kompatibilitas | Seluruh fungsi pada Subbab 3.2 harus berjalan pada Chrome, Firefox, Edge, dan Safari dua versi mayor terakhir.                                                                    |
| NFR-SEC-01 | Keamanan       | Password harus disimpan dalam bentuk hash dengan algoritma yang berjalan pada runtime Cloudflare Workers, misalnya bcryptjs.                                                      |
| NFR-SEC-02 | Keamanan       | Setiap Route Handler yang menerima masukan harus memvalidasi masukan tersebut dengan Zod di sisi server. Seluruh kueri basis data harus melalui Drizzle ORM.                      |
| NFR-SEC-03 | Keamanan       | Setiap endpoint tulis (tambah, ubah, hapus, dan penerbitan presigned URL) harus menolak permintaan tanpa autentikasi dengan status 401.                                           |
| NFR-SEC-04 | Keamanan       | Seluruh akses harus melalui HTTPS. Permintaan HTTP harus dialihkan ke HTTPS.                                                                                                      |
| NFR-SEC-05 | Keamanan       | Presigned URL harus kedaluwarsa dalam waktu ≤ 10 menit, hanya diterbitkan untuk admin terautentikasi, dan hanya berlaku untuk tipe berkas yang diizinkan.                         |
| NFR-SEC-06 | Keamanan       | Rahasia aplikasi (kunci Auth.js, kredensial Neon, kunci R2, dan kredensial Google OAuth) harus disimpan sebagai secret Workers. Berkas .dev.vars tidak boleh masuk ke repositori. |
| NFR-SEC-07 | Keamanan       | Sistem harus memverifikasi email dari Google OAuth dan tidak menyimpan token akses OAuth pada klien.                                                                              |
| NFR-MNT-01 | Pemeliharaan   | Repositori harus memuat README berisi langkah instalasi, konfigurasi, dan deployment.                                                                                             |
| NFR-MNT-02 | Pemeliharaan   | Perubahan skema basis data harus dikelola melalui migrasi drizzle-kit.                                                                                                            |
| NFR-MNT-03 | Pemeliharaan   | Kode sumber harus lolos pemeriksaan ESLint dan Prettier tanpa galat.                                                                                                              |
| NFR-DEP-01 | Deployment     | Aplikasi harus dapat dipublikasikan ke Cloudflare Workers dengan perintah wrangler deploy setelah proses build OpenNext.                                                          |

### 3.5 Kebutuhan Data

Tabel berikut memuat garis besar entitas yang disimpan pada Neon Postgres. Rancangan rinci disusun pada tahap perancangan.

| Entitas           | Atribut Utama                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| users             | id, nama, email, password_hash, created_at (dikelola Auth.js dengan Drizzle adapter)                             |
| accounts          | id, user_id, provider, provider_account_id (dikelola Auth.js untuk OAuth)                                        |
| sessions          | id, session_token, user_id, expires (dikelola Auth.js)                                                           |
| site_settings     | id, nama_game, tagline, logo_url, favicon_url, email_kontak                                                      |
| hero              | id, judul, subjudul, video_url, teks_cta, tautan_cta                                                             |
| hero_banners      | id, gambar_url, urutan                                                                                           |
| about             | id, judul, deskripsi, gambar_url                                                                                 |
| features          | id, judul, deskripsi, ikon_url, urutan                                                                           |
| how_to_play_steps | id, judul_langkah, deskripsi, media_url, urutan                                                                  |
| how_to_play_video | id, video_url                                                                                                    |
| gallery_assets    | id, jenis, judul, file_url, urutan                                                                               |
| news              | id, judul, slug, isi, thumbnail_url, status, published_at                                                        |
| landing_cards     | id, slot, eyebrow, title, subtitle, body, image_url, cta_label/url, tone, sort_order, is_published               |
| comments          | id, user_id (FK users.id cascade), body 1–500 tanpa HTML, created_at                                             |
| faq               | id, pertanyaan, jawaban, urutan                                                                                  |
| social_links      | id, platform, url                                                                                                |
| download_links    | id, platform, label, url                                                                                         |
| wishlist          | id, email (unik), nama, foto_url, provider, created_at (rename dari `waitlist`; migrasi RENAME tanpa hapus data) |

### 3.6 Pedoman Desain (Design Guidelines)

Gaya visual landing page mengacu pada situs resmi VALORANT (https://playvalorant.com/id-id) dan **disesuaikan dengan identitas visual serta branding BAREN**.

| ID    | Pedoman                                                                                                                           |
| ----- | --------------------------------------------------------------------------------------------------------------------------------- |
| DG-01 | Layout hero layar penuh (full-bleed) dengan gambar/video latar beresolusi tinggi dan judul besar yang menonjol.                   |
| DG-02 | Palet warna gelap (dark theme) kontras tinggi dengan satu warna aksen utama sesuai branding BAREN.                                |
| DG-03 | Tipografi tegas dan berkarakter (display font untuk judul, sans-serif untuk isi) yang sesuai nuansa permainan tradisional modern. |
| DG-04 | Tombol CTA bergaya tegas (uppercase, sudut tegas/geometris) dengan efek hover yang jelas.                                         |
| DG-05 | Struktur seksi berbasis blok dengan pemisah visual jelas; mendukung pola seksi bergantian teks–gambar.                            |
| DG-06 | Navigasi atas yang transparan di atas hero dan berubah menjadi solid saat digulir.                                                |
| DG-07 | Animasi halus pada transisi seksi dan hover elemen (tidak berlebihan, menjaga performa NFR-PRF).                                  |
| DG-08 | Kartu konten (fitur, berita, galeri) dengan rasio gambar konsisten dan overlay gradien.                                           |
| DG-09 | Tetap mematuhi C-01 (bahasa Indonesia), C-02 (mobile-first), dan NFR-ACC-01 (aksesibilitas).                                      |
| DG-10 | Tidak menyalin aset berhak cipta milik pihak ketiga; hanya mengadopsi pola tata letak dan gaya visual secara umum.                |
