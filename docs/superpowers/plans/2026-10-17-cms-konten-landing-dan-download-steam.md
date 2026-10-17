# CMS Konten Landing dan Download Steam

**Tanggal:** 2026-10-17

## Tujuan

Hilangkan teks konten landing yang tersimpan di komponen publik. Admin dapat mengubah konten Hero serta teks seksi Features, Cara Bermain, Galeri, Artikel, FAQ, Komentar, dan Kontak tanpa deployment. Navbar dan struktur/footer legal tetap statis. Seksi Download disederhanakan menjadi kartu Steam berstatus **Segera Hadir** dengan tombol hardcoded **Gabung Wishlist** di sisi kanannya.

## Keputusan ruang lingkup

- `site_settings` tetap menjadi penyimpanan key/value; tidak perlu tabel atau endpoint baru.
- Hero mengambil seluruh konten teks dan media dari baris `hero` yang terbit. Tidak ada fallback dari `src/content/baren.ts` untuk title, CTA, poster, atau video. Hero yang belum dikonfigurasi/tidak terbit disembunyikan agar tidak merender nilai buatan.
- Seed memasukkan data Hero dan teks seksi awal agar instalasi baru tidak blank, tetapi seed bukan fallback runtime.
- Header/navbar, label struktural footer, legal links, dan tombol wishlist header tetap hardcoded.
- Kontak: admin mengubah eyebrow, judul, deskripsi, label email, email, judul sosial, pesan sosial kosong, dan daftar tautan sosial. Struktur layout dan ikon platform tetap di kode.
- Kartu fleksibel, item fitur, langkah bermain, item galeri, berita, FAQ, komentar, dan Hero banners tetap memakai model CMS yang sudah ada; pengaturan baru hanya mengelola teks pembungkus seksi/empty state.
- Download tidak lagi membaca `download_links`, tidak memiliki UI CRUD unduhan, tidak menampilkan `DISTRIBUSI`, Play Store, atau App Store. Kartu Steam dan CTA wishlist menjadi markup statis. Tabel/API lama dibiarkan tanpa dipakai supaya migrasi destruktif tidak diperlukan.
- Semua teks baru tetap Indonesia. Tautan sosial eksternal tetap memakai `target="_blank" rel="noopener noreferrer"`.

## File yang berubah

| File                                               | Perubahan                                                                                                                                                    |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `docs/PRD.md`                                      | Revisi janji “seluruh konten” untuk pengecualian shell navigasi/footer dan Download Steam-only.                                                              |
| `docs/SRS.md`                                      | Revisi FR-PUB-01, 13, 14, 25; FR-ADM-09, 21, 22, 23; tambahkan pengelolaan teks pembungkus landing.                                                          |
| `docs/TASK_BREAKDOWN.md`                           | Tambah task follow-up CMS teks landing dan Download Steam-only; status/progress/log diperbarui saat implementasi selesai.                                    |
| `src/lib/api/settings.ts`                          | Perluas kontrak typed `SettingsBranding` menjadi konfigurasi landing; map field camelCase ke key `site_settings`; pertahankan key asing diabaikan saat baca. |
| `src/lib/validation/settings.ts`                   | Tambah skema Zod strict untuk semua teks configurable; trim, batas panjang per field, string kosong menjadi `null` hanya untuk field opsional.               |
| `src/lib/api/settings.test.mjs`                    | Uji mapping, upsert parsial, dan field konfigurasi landing baru.                                                                                             |
| `src/lib/validation/settings.test.mjs`             | Uji input valid, batas panjang, object kosong, dan key asing konfigurasi baru.                                                                               |
| `src/app/api/settings/route.ts`                    | Gunakan kontrak settings yang diperluas; endpoint GET tetap publik dan PUT tetap admin-only.                                                                 |
| `scripts/seed-admin.mjs`                           | Seed idempoten seluruh key teks landing dan satu row Hero terbit; tidak menimpa perubahan admin.                                                             |
| `src/app/admin/landing/page.tsx`                   | Halaman admin baru, mengikuti guard role halaman admin lain.                                                                                                 |
| `src/components/admin/landing-content-manager.tsx` | Form client untuk kelompok teks landing dan kontak; GET/PUT `/api/settings`, error per field, loading/submitting/toast mengikuti manager yang ada.           |
| `src/app/admin/layout.tsx`                         | Tambah tautan sidebar “Konten Landing”. Hapus atau ubah tautan Download dari area Kelola Tautan agar tidak menawarkan fitur yang tidak dipakai.              |
| `src/app/admin/links/page.tsx`                     | Ubah halaman menjadi pengelolaan tautan sosial saja atau redirect ke Konten Landing untuk email; jangan tampilkan CRUD download.                             |
| `src/components/admin/links-manager.tsx`           | Hapus state/form/permintaan `download_links`; pertahankan CRUD sosial, atau pecah kecil bila komponen menjadi lebih jelas.                                   |
| `src/components/site/hero.tsx`                     | Hapus import/fallback `content/baren`; render null bila Hero tidak ada/terbit; gunakan persis data Hero admin.                                               |
| `src/lib/hero-content.ts`                          | Jangan substitusi media lokal untuk nilai Hero kosong; validasi data siap render sebelum mengembalikan konten.                                               |
| `src/components/site/game-features.tsx`            | Terima copy teks dari konfigurasi settings untuk eyebrow, judul, dan empty state.                                                                            |
| `src/components/site/how-to-play.tsx`              | Terima judul seksi dari konfigurasi settings.                                                                                                                |
| `src/components/site/gallery-section.tsx`          | Gunakan eyebrow, judul, deskripsi, judul empty state, dan pesan empty state dari settings.                                                                   |
| `src/components/site/latest-news.tsx`              | Gunakan judul seksi dan label CTA dari settings; hapus import CTA statis untuk bagian ini.                                                                   |
| `src/components/site/faq-accordion.tsx`            | Gunakan eyebrow/judul dari settings; hapus fallback FAQ statis bila data kosong agar tidak ada konten runtime hardcoded.                                     |
| `src/components/site/comments-section.tsx`         | Terima label judul, prompt login, empty state, serta label/error submit dari settings sebagai props agar teks UI seksi bisa dikelola.                        |
| `src/components/site/contact-section.tsx`          | Gunakan copy kontak dari settings; tidak lagi fallback ke teks atau sosial statis untuk runtime.                                                             |
| `src/components/site/download-section.tsx`         | Ganti implementasi DB/link-platform dengan layout Steam-only dan CTA wishlist statis.                                                                        |
| `src/app/(site)/page.tsx`                          | Baca konfigurasi landing sekali di server lalu oper props ke semua seksi; jalankan baca paralel dengan konten lain.                                          |
| `src/content/baren.ts`                             | Hapus ekspor Hero/CTA/fallback FAQ/download/sosial yang tidak lagi dipakai; pertahankan hanya struktur statis navbar/footer/legal yang masih dipakai.        |
| `src/components/site/*.test.*`, `src/lib/*.test.*` | Tambah/ubah test unit atau render minimal sesuai pola test yang tersedia untuk cabang Hero kosong, copy settings, dan Download Steam-only.                   |

## Rencana implementasi

### 1. Selaraskan dokumen dan daftarkan task

1. Baca `docs/PRD.md`, `docs/SRS.md`, dan `docs/TASK_BREAKDOWN.md` pada baseline kerja.
2. Perbarui PRD agar menyatakan konten promosi dapat dikelola admin, dengan pengecualian shell navigasi/footer/legal; Download pada mode Wishlist adalah Steam-only dan CTA Wishlist.
3. Perbarui SRS:
   - FR-PUB-01: Hero tidak memakai fallback runtime; admin harus menyimpan Hero terbit untuk tampil.
   - FR-PUB-05 sampai FR-PUB-12 dan FR-PUB-26: teks heading/pengantar/empty state yang ditentukan scope dapat dikelola admin, sementara daftar item mengikuti modul masing-masing.
   - FR-PUB-13/25: satu kartu Steam “Segera Hadir” dan tombol Wishlist; hapus tuntutan tombol per-platform dari admin.
   - FR-PUB-14 dan FR-ADM-22/23: copy Kontak, email, serta tautan sosial dikelola admin.
   - Tambahkan kebutuhan admin untuk pengelolaan copy landing dengan batas validasi teks.
4. Tambah task baru P0 pada `TASK_BREAKDOWN.md`, misalnya `E14-1` API/kontrak settings landing, `E14-2` UI admin Konten Landing, `E14-3` render seksi publik, `E14-4` Download Steam-only; dependensi `E3-2`, `E6`, `E7`, `E8-9` yang telah Done.
5. Ubah `E14-1` menjadi `In Progress` sebelum coding. Jangan menandai task lain selesai sampai lint, typecheck, format, build, dan uji relevan lolos.

### 2. Buat kontrak konfigurasi landing secara test-first

1. Di `src/lib/api/settings.test.mjs`, tambahkan test gagal untuk `readSettings()` yang memetakan seluruh key baru menjadi object camelCase dan menghasilkan `null` untuk key hilang.
2. Tambahkan test gagal bahwa `writeSettings()` hanya upsert keys yang benar-benar diterima pada PUT parsial, termasuk kelompok kontak dan teks galeri/fitur.
3. Di `src/lib/validation/settings.test.mjs`, tambahkan kasus valid untuk setiap kelompok; uji string kosong field wajib ditolak, field optional dinormalisasi `null`, batas panjang ditolak, dan key typo tetap ditolak berkat `.strict()`.
4. Jalankan test Node yang ada untuk memastikan test baru merah karena field belum dikenal.
5. Perluas `SettingsBranding` menjadi nama yang mencerminkan isi aktual, misalnya `LandingSettings`. Hindari value JSON atau tabel tambahan; satu key satu teks agar PUT parsial, audit DB, dan form tetap sederhana.
6. Tambahkan `KEY_OF`, daftar `ORDER`, tipe, `to…()` dan `writeSettings()` untuk key berikut. Nama final boleh disesuaikan ke konvensi repo, tetapi pemetaan harus eksplisit:

   ```ts
   (featuresEyebrow,
     featuresTitle,
     featuresEmptyMessage,
     howToPlayTitle,
     galleryEyebrow,
     galleryTitle,
     galleryDescription,
     galleryEmptyTitle,
     galleryEmptyMessage,
     newsTitle,
     newsCtaLabel,
     faqEyebrow,
     faqTitle,
     commentsTitle,
     commentsLoginPrompt,
     commentsEmptyMessage,
     commentsSubmitLabel,
     commentsSubmitError,
     contactEyebrow,
     contactTitle,
     contactDescription,
     contactEmailLabel,
     contactSocialTitle,
     contactSocialEmptyMessage);
   ```

7. Validasi field teks dengan trim dan batas sesuai tampilan (misalnya 100 untuk label, 200 untuk heading, 500 untuk deskripsi/pesan). Jangan membuat validasi URL baru di settings selain logo/favicon yang sudah ada; email dan sosial mengikuti kontrak yang sudah teruji.
8. Jalankan test Node kembali sampai hijau. Pastikan `/api/settings` GET mengembalikan config lengkap dan PUT tanpa sesi masih 401; PUT admin memvalidasi Zod di server.

### 3. Seed dan Hero tanpa fallback runtime

1. Tambahkan seluruh key konfigurasi landing ke SQL `INSERT ... ON CONFLICT DO NOTHING` pada `scripts/seed-admin.mjs`, memakai copy Indonesia yang sekarang tampil agar instalasi baru punya tampilan masuk akal.
2. Tambah seed idempoten satu baris Hero terbit dengan title, subtitle, media, dan CTA yang lengkap. Gunakan aset lokal hanya sebagai nilai seed jika memang tersedia; jangan jadikan aset itu fallback komponen.
3. Tulis test untuk `getHeroContent()` atau extract helper murni yang memastikan Hero `null`/tidak terbit/tidak lengkap tidak dirender. Nilai `null` tidak boleh berubah menjadi slogan, CTA, video, atau poster dari `content/baren.ts`.
4. Ubah `getHeroContent()` agar memetakan row Hero saja dan mengembalikan `null` jika row hilang/tidak terbit; pertahankan kegagalan DB aman (return `null`). Jika URL media tidak valid/absen, pilih satu perilaku eksplisit: sembunyikan Hero, bukan substitusi aset.
5. Ubah `Hero` agar langsung `return null` bila helper mengembalikan `null`; hapus import `hero` dari konten statis dan semua operator fallback untuk nilai content.
6. Uji seed dua kali terhadap DB development/branch terisolasi untuk membuktikan tidak mengubah nilai yang telah diedit admin dan tidak menduplikasi Hero.

### 4. Tambahkan UI admin Konten Landing

1. Buat `src/app/admin/landing/page.tsx` dengan guard admin yang sama seperti `/admin/links`, lalu render `LandingContentManager`.
2. Buat `LandingContentManager` dengan pola `HeroManager` dan `LinksManager`:
   - request GET `/api/settings` saat mount;
   - kelompok form: Fitur, Cara Bermain, Galeri, Artikel, FAQ, Komentar, Kontak;
   - input teks menggunakan `input` untuk label/heading dan `textarea` untuk deskripsi/pesan;
   - submit PUT hanya field di kelompok yang diubah atau submit seluruh object valid, konsisten dengan manager yang ada;
   - tampilkan error field dari API, state loading/simpan, dan `Toast` sukses/gagal.
3. Jangan memasukkan Hero ke form baru; tetap gunakan `/admin/hero` agar upload/penerbitan/banners punya satu sumber UI.
4. Tambahkan menu sidebar “Konten Landing” dekat Hero dan modul konten lain. Menu harus dapat dipakai keyboard dan responsif seperti nav saat ini.
5. Sederhanakan `/admin/links` dan `LinksManager`: hilangkan semua tampilan/permintaan CRUD download, arahkan admin ke Konten Landing untuk email/copy kontak, pertahankan CRUD sosial. Bila penggabungan sosial ke `LandingContentManager` lebih pendek dan jelas, hapus page manager lama hanya setelah semua nav dan test diperbarui.
6. Tambahkan test parser/komponen minimal sesuai test harness repo: data GET terisi ke form; response field error ditampilkan; keberhasilan PUT memperbarui UI. Tidak perlu dependency test baru.

### 5. Oper konfigurasi ke semua seksi publik

1. Tambahkan helper pembaca server untuk settings (gunakan `readSettings`/adapter Drizzle, bukan `fetch` ke origin) agar `page.tsx` hanya membaca konfigurasi sekali per request. Pastikan kegagalan DB tidak menjatuhkan landing; jika settings tidak tersedia, sembunyikan seksi yang tidak dapat menyajikan data alih-alih menggunakan copy hardcoded.
2. Di `src/app/(site)/page.tsx`, tambahkan settings ke `Promise.all` bersama query konten yang ada, lalu teruskan props typed ke seksi. Hindari query settings lagi di masing-masing komponen.
3. Ubah `GameFeatures`, `HowToPlay`, `GallerySection`, `LatestNews`, `FaqAccordion`, dan `CommentsSection` agar menerima config via props. Pindahkan semua copy seksi yang ditarget dari JSX ke config tersebut.
4. Untuk setiap seksi daftar kosong, pakai perilaku SRS yang ada:
   - News dan FAQ tetap hilang bila tidak ada item; jangan munculkan fallback dari `content/baren.ts`.
   - Features dan Gallery memakai empty state dari config bila konfigurasi tersedia.
   - How To Play tetap dapat menampilkan header configurable bila modul memang dipasang; ikuti perilaku page saat ini untuk daftar kosong, jangan menambah empty state baru tanpa kebutuhan.
   - Comments memakai copy config untuk login prompt dan “Belum ada komentar”.
5. Ubah `ContactSection` agar satu snapshot settings menyuplai copy dan email; gunakan `social_links` sebagai daftar. Bila daftar sosial kosong, pakai pesan config, bukan fallback sosial statis. Validasi `mailto:` hanya saat email valid; sembunyikan link bila email belum diisi.
6. Perbarui `SiteFooter` supaya menerima email/sosial dinamis dari page/layout jika footer masih menampilkan keduanya. Header/navbar/legal/footer structure tetap statis; jangan masukkan teks navigasi/footer/legal ke form settings.
7. Hapus ekspor `hero`, `cta`, `faqs`, dan `social` dari `src/content/baren.ts` hanya bila seluruh caller sudah tidak memakainya. Cari seluruh import sebelum penghapusan; pertahankan `nav`, `legalLinks`, dan struktur statis yang masih diperlukan.
8. Tambah test render/unit untuk membuktikan sebuah perubahan value settings muncul di Feature/Gallery/Contact dan nilai statis lama tidak dipakai ketika config tersedia.

### 6. Ganti Download menjadi Steam-only

1. Tulis test render/unit untuk `DownloadSection` yang mengharapkan:
   - tidak ada teks `DISTRIBUSI`;
   - hanya satu kartu/identitas Steam dan teks `Segera Hadir`;
   - tidak ada `Play Store` atau `App Store`;
   - tombol `Gabung Wishlist` memiliki `href="#daftar"` dan tersedia di sisi kanan kartu pada layar menengah ke atas, dengan layout bertumpuk aman pada seluler.
2. Hapus props `items`, helper URL, import `getDownloadItems`, dan cabang status/link rilis dari `DownloadSection`.
3. Gunakan aset/icon Steam yang sudah tersedia. Bila tidak ada, tampilkan teks `Steam` dalam kartu; jangan menambah asset atau dependency hanya untuk logo. Pastikan card dan CTA memenuhi target sentuh/fokus serta kontras yang sudah dipakai.
4. Hapus Download CRUD dari UI admin seperti Task 4. Biarkan `/api/downloads` dan tabel `download_links` tidak dipakai untuk kompatibilitas data; jangan membuat migrasi `DROP` dalam pekerjaan ini.
5. Hapus import/helper `links-content.ts` yang menjadi mati hanya setelah semua caller dicek. Pertahankan helper sosial dan `externalLinkProps` karena Contact/Footer masih membutuhkannya.

### 7. Verifikasi dan dokumentasi penutupan

1. Jalankan seluruh test Node yang relevan, termasuk settings, validasi, Hero, dan Download. Tambah test sebelum perubahan implementasi, lalu jalankan lagi sampai hijau.
2. Jalankan:

   ```bash
   pnpm lint
   pnpm exec tsc --noEmit
   pnpm format:check
   pnpm build
   ```

3. Smoke test lokal dengan `pnpm dev` atau `pnpm preview`:
   - edit teks Fitur, Galeri, Kontak, dan satu prompt Komentar melalui admin, lalu refresh landing untuk memastikan perubahan langsung tampil;
   - ubah Hero melalui `/admin/hero`; nonaktifkan Hero untuk memastikan tidak ada slogan/media fallback;
   - pastikan daftar sosial dan email admin tampil pada seksi Kontak/footer dan tautan sosial membuka tab baru;
   - pastikan Download hanya menunjukkan Steam + CTA Wishlist, di 360 px dan desktop tanpa horizontal overflow;
   - pastikan navbar dan footer/legal tetap statis.
4. Setelah semua bukti lulus, tandai `E14-1` sampai `E14-4` Done, isi catatan tanggal/bukti per task, perbarui progres epik, dan tambahkan entri log terbaru di `TASK_BREAKDOWN.md`.
5. Arsipkan plan hanya ketika seluruh task plan Done dan verifikasi lulus, mengikuti aturan `AGENTS.md`.

## Risiko dan mitigasi

| Risiko                                                       | Mitigasi                                                                                                                        |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `site_settings` bertambah banyak dan key typo tidak terlihat | Centralize mapping/type di satu file, validasi `.strict()`, unit test mapping/upsert.                                           |
| Hero hilang sesudah fallback dihapus                         | Seed Hero idempoten; admin UI Hero sudah ada; render `null` adalah perilaku eksplisit saat belum siap.                          |
| Email/sosial tampil beda antara Contact dan footer           | Load settings/social sekali dari server dan pass props ke keduanya; tidak ada fallback runtime berbeda.                         |
| Endpoint/tabel download lama jadi dead code                  | Hapus hanya consumer UI/admin; pertahankan DB/API tanpa migrasi destruktif, lalu hapus terpisah bila ada keputusan deprecation. |
| Copy terlalu panjang merusak layout                          | Batas Zod, textarea dengan hint batas, dan smoke test viewport 360/768/1920.                                                    |
