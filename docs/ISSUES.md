# Dokumentasi Isu & Temuan Pengujian (QA Issues & Bug Tracking) — BAREN Web

Dokumen ini memuat analisis mendalam, akar masalah teknis, langkah reproduksi, dan rencana tindakan untuk seluruh isu serta umpan balik pengujian fungsional dan integrasi pada sistem CMS Admin dan Situs Publik BAREN.

Seluruh isu di bawah ini juga telah dibuat dan dipetakan secara resmi ke dalam **GitHub Issues** di repositori [`faridfirdaus-fred/baren`](https://github.com/faridfirdaus-fred/baren/issues).

---

## 📌 Ringkasan Matriks Isu

| No  | GitHub Issue                                                | Judul & Topik                                                                                       | Kategori       | Prioritas |  Status  | Modul / Berkas Terkait                                                                                           |
| :-: | :---------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- | :------------- | :-------: | :------: | :--------------------------------------------------------------------------------------------------------------- |
|  1  | [#5](https://github.com/faridfirdaus-fred/baren/issues/5)   | Modul Admin Tautan (`/admin/links`) selalu menampilkan error 'gagal menyimpan tautan sosial'        | Bug (Frontend) |    P0     | Resolved | `src/components/admin/links-manager.tsx`<br>`src/lib/api/response.ts`                                            |
|  2  | [#6](https://github.com/faridfirdaus-fred/baren/issues/6)   | Kendala alur pengunggahan berkas gambar ke R2 dan pratinjau aset akibat pemblokiran domain `r2.dev` | Bug / Infra    |    P0     | Resolved | `src/lib/r2.ts`<br>`src/lib/assets-client.ts`<br>`src/lib/assets-url.ts`<br>`src/app/api/assets/[...path]/`      |
|  3  | [#7](https://github.com/faridfirdaus-fred/baren/issues/7)   | Navigasi menu dan penempatan seksi Komentar Komunitas (`#komentar`) pada situs publik               | UX / Nav       |    P1     | Resolved | `src/content/baren.ts`<br>`src/components/site/site-header.tsx`<br>`src/components/site/comments-section.tsx`    |
|  4  | [#8](https://github.com/faridfirdaus-fred/baren/issues/8)   | Perubahan data dari panel admin tidak tersinkronisasi ke situs publik akibat static caching         | Bug / Sync     |    P0     | Resolved | `src/app/(site)/page.tsx`<br>`src/lib/landing-content.ts`<br>`src/app/api/*/route.ts`                            |
|  5  | [#9](https://github.com/faridfirdaus-fred/baren/issues/9)   | Aset Galeri tersimpan di panel admin namun tidak muncul pada situs publik                           | Bug / Content  |    P0     | Resolved | `src/app/(site)/page.tsx`<br>`src/components/site/gallery-section.tsx`<br>`src/components/site/gallery-grid.tsx` |
|  6  | [#10](https://github.com/faridfirdaus-fred/baren/issues/10) | Seksi FAQ tidak muncul pada situs publik dan tautan navigasi FAQ tidak merespons                    | Bug / UX       |    P0     | Resolved | `src/components/site/faq-accordion.tsx`<br>`src/content/baren.ts`<br>`src/app/(site)/page.tsx`                   |

---

## 1. Issue #5 — Error Gagal Menyimpan Tautan Sosial pada Modul Admin Tautan (`/admin/links`)

**GitHub Issue:** [#5](https://github.com/faridfirdaus-fred/baren/issues/5)  
**Label:** `bug` | **Prioritas:** P0 (Kritis)

### A. Gejala Masalah

Pada formulir tambah atau ubah tautan sosial di `/admin/links`, setiap kali terjadi kesalahan input (misal URL tidak diawali `https://` atau platform kosong), sistem langsung menampilkan banner merah generik:

> **"Gagal menyimpan tautan sosial"**

Pengguna tidak melihat pesan error spesifik di bawah kolom input (_field-level validation error_). Selain itu, jika formulir dikirim ulang, banner error tersebut tidak hilang secara otomatis.

### B. Analisis Akar Masalah (Root Cause)

1. **Ketidakcocokan Struktur Respons Error (Envelope Mismatch):**
   - Helper server `fail()` pada `src/lib/api/response.ts` (baris 41–50) membungkus galat ke dalam objek `error`:
     ```json
     {
       "ok": false,
       "error": {
         "code": "VALIDATION_ERROR",
         "message": "Validasi gagal. Periksa kembali kolom yang ditandai.",
         "fields": {
           "url": ["URL harus diawali https://."]
         }
       }
     }
     ```
   - Namun, komponen `LinksManager` pada `src/components/admin/links-manager.tsx` (baris 20–25 dan 85–91) membaca properti rata di root:
     ```typescript
     interface ApiResponse<T = unknown> {
       ok: boolean;
       data?: T;
       message?: string;
       fields?: Record<string, string[]>;
     }

     if (!json.ok) {
       if (json.fields) {
         // undefined!
         setSocialFormErrors(json.fields);
       } else {
         setSocialError(json.message || "Gagal menyimpan tautan sosial"); // message undefined!
       }
       return;
     }
     ```
   - Akibatnya, `json.fields` dan `json.message` bernilai `undefined`, memicu fallback teks generik `"Gagal menyimpan tautan sosial"` dan mengaburkan penyebab validasi yang sebenarnya.
2. **Ketiadaan Reset Error State:**
   - Di awal handler `handleSocialSubmit`, tidak ada pemanggilan `setSocialError(null)`. Banner error lama akan terus tertahan di UI.

### C. Langkah Reproduksi

1. Masuk ke panel admin: `/admin/login`.
2. Buka menu **Tautan Sosial** di `/admin/links`.
3. Masukkan Platform: `Instagram`, URL: `instagram.com/baren` (tanpa `https://`).
4. Klik **Tambah Tautan**.
5. Muncul pesan _"Gagal menyimpan tautan sosial"_ tanpa indikator kolom mana yang bermasalah.

### D. Rencana Solusi & Perbaikan Kode

1. Sesuaikan pembacaan respons di `src/components/admin/links-manager.tsx`:
   ```typescript
   type ApiErrorBody = {
     message?: string;
     fields?: Record<string, string[]>;
   };

   // Pada penanganan error:
   if (!json.ok) {
     const errorObj = (json as { error?: ApiErrorBody }).error;
     if (errorObj?.fields) {
       setSocialFormErrors(errorObj.fields);
     } else {
       setSocialError(errorObj?.message || "Gagal menyimpan tautan sosial");
     }
     return;
   }
   ```
2. Tambahkan `setSocialError(null)` tepat di awal `handleSocialSubmit`.
3. Terapkan penanganan serupa pada `loadSocialLinks` dan `handleSocialDelete`.

---

## 2. Issue #6 — Kendala Alur Pengunggahan Gambar ke R2 dan Pratinjau Aset

**GitHub Issue:** [#6](https://github.com/faridfirdaus-fred/baren/issues/6)  
**Label:** `bug` | **Prioritas:** P0 (Kritis)

### A. Gejala Masalah

Penguji menyampaikan: _"belum bisa upload gambar"_. Saat mencoba mengunggah gambar di modul Branding, Fitur, Hero, atau Berita:

- Gambar yang diunggah tampak pecah/rusak pada pratinjau (_broken image_).
- Gambar tidak tersimpan ke database jika pengguna mengira proses upload langsung menyimpan form.
- Muncul galat jaringan atau penolakan tipe berkas.

### B. Analisis Akar Masalah (Root Cause)

1. **Pemblokiran Domain Publik `*.r2.dev` di Indonesia:**
   - Secara default, Cloudflare R2 memberikan URL publik berbasis `https://pub-<hash>.r2.dev`. Di Indonesia, domain `*.r2.dev` diblokir oleh Nawala/Internet Positif pada sebagian besar ISP nasional (Telkomsel, Indihome, XL).
   - Saat peramban mencoba menampilkan `<img src="https://pub-xxx.r2.dev/assets/...">`, terjadi kegagalan koneksi DNS (`ERR_NAME_NOT_RESOLVED`). Pengguna melihat ikon gambar pecah dan menganggap upload gagal.
2. **Pemisahan Pengunggahan Berkas vs Penyimpanan Record:**
   - Pada modul formulir (Branding, Fitur, Hero, How to Play, Landing Cards, Berita), komponen `AssetUploader` hanya mengunggah file biner ke R2 dan menaruh URL publik ke dalam state formulir.
   - Record database **baru dibuat** ketika admin mengklik tombol utama formulir (_"Simpan Branding"_, _"Tambah Fitur"_, dsb.). Jika admin langsung meninggalkan halaman, data gambar hilang.
3. **Validasi Format Berkas Ketat:**
   - Sesuai `src/lib/assets-validation.ts`, format yang diizinkan hanya JPG, PNG, WebP (maks 5MB), dan SVG (hanya untuk logo/ikon). Format populer seperti GIF atau BMP langsung ditolak tanpa keterangan yang memadai bagi orang awam.
4. **Kebijakan CORS pada Bucket Cloudflare R2:**
   - Upload browser direct-to-R2 menggunakan metode presigned PUT. Jika origin web (misal `http://localhost:3000` atau domain produksi) belum terdaftar dalam kebijakan CORS bucket `baren-assets`, browser akan memblokir request saat preflight OPTIONS.

### C. Rencana Solusi & Perbaikan Kode

1. **Aktivasi Endpoint Proxy Internal Aset:**
   - Gunakan `src/lib/assets-url.ts` (`resolvePublicAssetUrl`) dan route `src/app/api/assets/[...path]/route.ts`. Endpoint ini menyajikan aset langsung melalui binding internal Workers `BAREN_ASSETS`, sehingga tidak bergantung pada domain `r2.dev` dan 100% bebas blokir di Indonesia.
2. **Indikator Formulir Belum Disimpan (Dirty State Warning):**
   - Berikan notifikasi/highlight pada tombol Simpan formulir segera setelah gambar selesai diunggah agar admin tidak lupa menekan tombol simpan.
3. **Penyempurnaan Pesan Panduan Format:**
   - Cantumkan label jelas pada area dropzone: _"Hanya format JPG, PNG, atau WebP (maks. 5 MB)"_.
4. **Verifikasi Kebijakan CORS Bucket:**
   - Pastikan aturan CORS bucket R2 mencakup seluruh origin dev, preview, dan produksi.

---

## 3. Issue #7 — Navigasi Menu dan Penempatan Seksi Komentar Komunitas (`#komentar`)

**GitHub Issue:** [#7](https://github.com/faridfirdaus-fred/baren/issues/7)  
**Label:** `enhancement`, `accessibility` | **Prioritas:** P1 (Penting)

### A. Gejala Masalah

Pengguna menanyakan: _"komentar di sebelah mana di webnya"_. Pengunjung kesulitan menemukan kolom komentar karena tidak ada tautan di bilah navigasi dan letaknya berada di bagian paling dasar halaman.

### B. Analisis Akar Masalah (Root Cause)

1. **Tidak Ada Tautan Navigasi:**
   - Array navigasi di `src/content/baren.ts` hanya memiliki 5 item: `INFO GAME` (`#fitur`), `CARA MAIN` (`#cara-main`), `ARTIKEL` (`#berita`), `FAQ` (`#faq`), dan `GALERI` (`#galeri`).
   - Tidak ada menu `KOMENTAR` (`#komentar`) baik di header desktop, drawer mobile, maupun footer.
2. **Posisi Paling Dasar Halaman:**
   - Di `src/app/(site)/page.tsx`, `<CommentsSection />` berada di bawah Seksi Unduh Game dan Seksi Kontak/Medsos, di mana mayoritas pengunjung mengira halaman sudah selesai pada seksi kontak.
3. **Penyelarasan Tema Gelap Taktikal:**
   - Form komentar menggunakan kartu berlatar terang (`bg-white` / `bg-sand/50`) yang belum seragam dengan palet gelap taktikal BAREN (`bg-ink-800`, `border-line`, `text-sand`).

### C. Rencana Solusi & Perbaikan Kode

1. Tambahkan item navigasi `KOMENTAR` ke `nav` pada `src/content/baren.ts`:
   ```typescript
   { label: "KOMENTAR", href: "#komentar" }
   ```
2. Pastikan target anchor `#komentar` memiliki margin offset gulir yang nyaman (`scroll-margin-top: 5.5rem`).
3. Selaraskan styling komponen `CommentsSection` agar menggunakan token warna BAREN dark theme (`bg-ink-800`, border `border-line`, teks `text-sand`).

---

## 4. Issue #8 — Perubahan Data Panel Admin Tidak Tersinkronisasi ke Situs Publik

**GitHub Issue:** [#8](https://github.com/faridfirdaus-fred/baren/issues/8)  
**Label:** `bug` | **Prioritas:** P0 (Kritis)

### A. Gejala Masalah

Penguji menyampaikan: _"isian dari laman admin belum konek ke laman pengguna"_. Admin memperbarui data (Hero, Fitur, Galeri, FAQ, copy landing), data berhasil disimpan ke Neon DB, namun beranda publik tetap menampilkan data lama atau kosong.

### B. Analisis Akar Masalah (Root Cause)

1. **Static Site Generation (SSG) Tanpa Dynamic Rendering On-Demand:**
   - Halaman `src/app/(site)/page.tsx` pada build produksi yang ter-deploy di-generate sebagai halaman statis (`○ (Static)`).
   - Di runtime Cloudflare Workers dengan OpenNext, halaman statis menyajikan snapshot HTML hasil build awal. Fungsi pemanggilan database ke Neon tidak pernah dieksekusi ulang saat ada request pengunjung.
   - Pengecekan via `curl https://baren.fdiraf77.workers.dev/` membuktikan payload RSC mengembalikan `null` dan array kosong meskipun endpoint API pada domain yang sama sudah berisi data.
2. **Ketiadaan Pemanggilan Invalidation Cache:**
   - Endpoint mutasi admin (POST/PUT/DELETE di `/api/*`) belum memanggil `revalidatePath("/")`.
3. **Logika Conditional Rendering yang Terlalu Ketat:**
   - Seksi-seksi beranda memiliki pengecekan `if (!title) return null;` atau `if (!content) return null;`. Jika salah satu teks pengaturan bernilai null, seksi disembunyikan total alih-alih menampilkan fallback default.

### C. Rencana Solusi & Perbaikan Kode

1. Tambahkan `export const dynamic = "force-dynamic";` di `src/app/(site)/page.tsx` agar halaman beranda selalu dirender secara on-demand dengan data paling mutakhir dari database.
2. Panggil `revalidatePath("/")` di seluruh handler mutasi admin setelah operasi database berhasil.
3. Berikan teks fallback default pada semua seksi konten agar tidak hilang jika data copy CMS belum terisi.
4. Lakukan deploy ulang ke Cloudflare Workers (`pnpm deploy`).

---

## 5. Issue #9 — Aset Galeri Tersimpan di Panel Admin Namun Tidak Muncul pada Situs Publik

**GitHub Issue:** [#9](https://github.com/faridfirdaus-fred/baren/issues/9)  
**Label:** `bug` | **Prioritas:** P0 (Kritis)

### A. Gejala Masalah

Penguji menyampaikan: _"galeri di admin udah work, tapi belom muncul di pengguna"_. Data aset galeri berhasil diunggah dan disimpan ke database (terbukti ada record aktif di tabel `gallery_assets`), namun seksi Galeri tidak tampil di situs publik.

### B. Analisis Akar Masalah (Root Cause)

1. **Stale Cache Beranda:** Seperti dijelaskan pada Issue #8, beranda publik menyajikan cache statis lama yang dibuat saat tabel galeri masih kosong.
2. **Guard Judul Seksi (`src/components/site/gallery-section.tsx:24`):**
   ```tsx
   export function GallerySection({ eyebrow, title, ... }: GallerySectionProps) {
     if (!title) return null; // Jika title null, seksi hilang total!
   ```
   Jika `galleryCopy.title` dari `site_settings` bernilai null atau kosong, seluruh elemen `<section id="galeri">` langsung di-skip dan tidak dirender ke DOM.
3. **URL Aset Terblokir (`*.r2.dev`):** URL gambar galeri yang mengarah ke `https://pub-*.r2.dev` terblokir di jaringan lokal Indonesia jika tidak melalui proxy internal.

### C. Rencana Solusi & Perbaikan Kode

1. Ubah guard judul di `GallerySection` agar menggunakan fallback judul default:
   ```tsx
   const resolvedTitle = title?.trim() || "GALERI & AKSI";
   ```
2. Integrasikan `resolvePublicAssetUrl` pada komponen `GalleryGrid` dan `R2Image`.
3. Deploy pembaruan `force-dynamic` pada `page.tsx` ke Cloudflare Workers.

---

## 6. Issue #10 — Seksi FAQ Tidak Muncul pada Situs Publik dan Tautan Navigasi FAQ Tidak Merespons

**GitHub Issue:** [#10](https://github.com/faridfirdaus-fred/baren/issues/10)  
**Label:** `bug`, `enhancement` | **Prioritas:** P0 (Kritis)

### A. Gejala Masalah

Penguji menyampaikan: _"halaman faq belom muncul di pengguna"_. Dua pertanyaan FAQ telah disimpan di database Neon, tetapi:

1. Seksi FAQ tidak tampak di halaman beranda.
2. Mengklik menu navigasi **FAQ** di header/footer tidak bereaksi apa pun (_dead link_).
3. Pengguna menduga ada rute halaman mandiri `/faq` yang belum aktif.

### B. Analisis Akar Masalah (Root Cause)

1. **Guard `if (!title || items.length === 0) return null;`:**
   Pada `src/components/site/faq-accordion.tsx` (baris 27), komponen me-return `null` jika `items` kosong atau `title` null. Karena beranda produksi menyajikan cache statis lama di mana `items = []`, elemen `<section id="faq">` **sama sekali tidak ada di dalam DOM**.
2. **Dead Anchor:**
   Tautan navigasi mengarah ke `href="#faq"`. Saat diklik, browser mencari elemen `#faq` yang tidak ada di DOM, sehingga tidak ada animasi scroll/lompatan.
3. **Ekspektasi Rute Halaman Mandiri:**
   Pengguna mengira FAQ memiliki rute halaman mandiri seperti halnya `/berita`. Saat ini FAQ hanya berupa seksi akordion di landing page.

### C. Rencana Solusi & Perbaikan Kode

1. Ubah guard `FaqAccordion` agar tetap me-render seksi dengan empty state informatif jika data pertanyaan belum tersedia, sehingga ID `#faq` tetap ada di DOM dan tautan navigasi berfungsi.
2. Gunakan judul fallback default (_"PERTANYAAN UMUM"_) jika `faqTitle` belum diatur.
3. Pastikan `page.tsx` berstatus `force-dynamic` agar item FAQ dari database langsung tampil.
4. (Opsional / Rekomendasi): Buat halaman mandiri `src/app/faq/page.tsx` (`/faq`) untuk pengalaman akses konten tanya-jawab yang lebih komprehensif.

---

## 📋 Urutan Pengerjaan Rekomendasi (Action Plan)

Untuk menuntaskan keenam isu di atas secara efisien:

1. **Langkah 1 — Perbaikan Envelope Respons Tautan Sosial (Issue #5):**
   - Update `links-manager.tsx` untuk membaca `json.error.fields` dan `json.error.message`.
   - Reset error state di awal submit.
2. **Langkah 2 — Normalisasi URL Aset & Proxy R2 (Issue #2 & Issue #5):**
   - Terapkan `resolvePublicAssetUrl` dan `src/app/api/assets/[...path]/route.ts`.
   - Update komponen gambar (`R2Image`, uploader, preview).
3. **Langkah 3 — Pemulihan Dynamic Rendering & Fallback Seksi Publik (Issue #4, #5, #6):**
   - Pastikan `export const dynamic = "force-dynamic"` aktif di `src/app/(site)/page.tsx`.
   - Perbaiki guard di `GallerySection` dan `FaqAccordion` agar menggunakan judul fallback default dan tidak me-return `null`.
4. **Langkah 4 — Penambahan Navigasi Komentar & Penyelarasan Tema (Issue #3):**
   - Tambahkan `{ label: "KOMENTAR", href: "#komentar" }` di `src/content/baren.ts`.
   - Selaraskan tema gelap taktikal pada `comments-section.tsx`.
5. **Langkah 5 — Verifikasi & Deployment:**
   - Jalankan `pnpm lint`, `tsc --noEmit`, dan pengujian `node --test`.
   - Jalankan `pnpm deploy` untuk memperbarui Cloudflare Workers produksi.
