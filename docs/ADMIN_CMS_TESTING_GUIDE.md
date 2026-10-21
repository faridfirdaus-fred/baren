# Panduan Skenario Pengujian CMS Admin BAREN

| Field   | Keterangan                                                                                                |
| ------- | --------------------------------------------------------------------------------------------------------- |
| Versi   | 1.0                                                                                                       |
| Tanggal | 21 Oktober 2026                                                                                           |
| Untuk   | QA dan mitra pengelola CMS                                                                                |
| Status  | Aktif                                                                                                     |
| Issue   | [#4 — Panduan Skenario Pengujian Formulir CMS Admin](https://github.com/faridfirdaus-fred/baren/issues/4) |

---

## 1. Tujuan dan Ruang Lingkup

Dokumen ini memandu pengujian manual seluruh formulir dan operasi Panel Admin BAREN. Setiap perubahan diuji dari input admin sampai data tersimpan, lalu diverifikasi pada Situs Publik jika konten tersebut tampil publik.

Panduan ini mencakup 12 modul konten, Dasbor, serta formulir profil dan kata sandi. Ini bukan pengganti unit test, Playwright, security test, atau laporan UAT historis di `docs/archive/`.

### Peta modul

| Modul           | URL admin              | Operasi utama                             | Verifikasi hasil                |
| --------------- | ---------------------- | ----------------------------------------- | ------------------------------- |
| Dasbor dan akun | `/admin`               | metrik, drill-down, profil, kata sandi    | Dasbor/admin-only               |
| Konten Landing  | `/admin/landing`       | copy seksi dan email kontak               | seksi publik terkait, `#kontak` |
| Hero            | `/admin/hero`          | edit singleton, media, CTA, status terbit | bagian paling atas `/`          |
| Kartu Landing   | `/admin/landing-cards` | CRUD, terbit, urut ↑/↓                    | kartu landing `/`               |
| Berita          | `/admin/news`          | CRUD, draf/terbit, cover                  | `#berita`, `/berita/[slug]`     |
| Cara Bermain    | `/admin/how-to-play`   | video demo, CRUD langkah                  | `#cara-main`                    |
| Fitur           | `/admin/features`      | CRUD ikon dan urutan                      | `#fitur`                        |
| Branding        | `/admin/branding`      | nama, tagline, logo, favicon              | tab browser, header, footer     |
| FAQ             | `/admin/faq`           | CRUD dan urutan                           | `#faq`                          |
| Galeri          | `/admin/gallery`       | upload, CRUD aset dan urutan              | `#galeri`, lightbox/video       |
| Tautan Sosial   | `/admin/links`         | CRUD tautan sosial                        | `#kontak`, footer               |
| Komentar        | `/admin/comments`      | lihat total dan hapus                     | `#komentar`, Dasbor             |
| Wishlist        | `/admin/wishlist`      | cari, paginasi, ekspor CSV                | admin-only                      |

## 2. Prasyarat dan Aturan Data Uji

1. Gunakan lingkungan non-produksi atau branch database terisolasi. Jangan menjalankan skenario mutasi pada data produksi tanpa persetujuan pemilik data.
2. Siapkan akun admin. Untuk Komentar dan Wishlist, siapkan akun Google khusus pengujian jika OAuth tersedia.
3. Siapkan aset uji yang tidak berhak cipta: gambar JPG/PNG/WebP kecil, SVG logo/ikon, serta MP4 kecil. Batas unggahan: gambar maksimal 5 MB; video maksimal 50 MB.
4. Buka `/admin` dan `/` pada tab berbeda. Setelah menyimpan, muat ulang halaman admin untuk membuktikan persistensi; muat ulang publik atau lakukan hard refresh bila perlu. Perubahan publik harus muncul paling lambat 60 detik.
5. Gunakan prefix unik: `QA-ADMIN-YYYYMMDD-<modul>-<inisial>`. Contoh slug berita: `qa-admin-20261021-berita-fa`.
6. Catat pada hasil uji: ID skenario, data input, ID record, slug, URL aset R2, urutan, status hasil, screenshot, dan waktu pengujian.
7. Setelah tiap skenario, hapus record dan aset uji atau pulihkan nilai baseline. Jangan menghapus data wishlist nyata; modul ini tidak menyediakan hapus dari UI.

### Bukti minimum

- Screenshot pesan sukses atau error validasi.
- Screenshot daftar admin setelah refresh.
- Screenshot situs publik atau file CSV untuk skenario yang berdampak ke publik/ekspor.
- Untuk hapus: bukti dialog konfirmasi, pembatalan tidak mengubah data, lalu konfirmasi menghapus data.

### Pola uji wajib pada formulir

- Field wajib kosong, format URL tidak valid, dan URL yang tidak diawali `https://` bila field tersebut URL eksternal.
- Input valid tersimpan dan tetap ada setelah refresh.
- Error per kolom atau pesan gagal tampil; data lama tidak berubah bila simpan gagal.
- Pada uploader R2, unggah file hanya mengisi URL/preview. Simpan formulir sesudah unggah agar record benar-benar berubah. Bersihkan objek R2 orphan jika unggah berhasil tetapi formulir tidak disimpan.
- Modul selain Kartu Landing memakai nilai numerik **Urutan** (`sortOrder`), bukan tombol naik/turun atau drag-and-drop.

## 3. Skenario Akses, Dasbor, dan Akun

### TC-AUTH-01 — Proteksi halaman admin

1. Keluar dari sesi admin atau gunakan jendela privat.
2. Buka satu URL modul, misalnya `/admin/news`.
3. **Harapan:** browser dialihkan ke `/admin/login`; formulir dan data admin tidak tampil.

### TC-AUTH-02 — Login dan logout

1. Di `/admin/login`, masukkan akun admin valid lalu klik **Masuk**.
2. **Harapan:** Dasbor terbuka.
3. Klik **Keluar** dari navigasi.
4. **Harapan:** kembali ke halaman login dan `/admin` kembali dilindungi.

### TC-DASH-01 — Metrik dan drill-down

1. Login lalu buka `/admin`.
2. Klik keenam kartu metrik: Fitur, Galeri, Berita, FAQ, Wishlist, dan Komentar.
3. **Harapan:** setiap kartu membuka modul sumber yang sesuai; label, jumlah, deskripsi sumber, dan waktu pembaruan berbahasa Indonesia.
4. Uji navigasi keyboard: fokus kartu dengan `Tab`, lalu buka memakai `Enter`.

### TC-DASH-02 — Komentar terbaru

1. Dengan setidaknya satu komentar tersedia, buka Dasbor.
2. Klik komentar pada widget komentar terbaru.
3. **Harapan:** terbuka `/admin/comments#komentar-<id>` dan komentar tersebut dapat ditemukan.
4. Ulangi saat daftar komentar kosong; **harapan:** empty state tampil tanpa error.

### TC-ACCOUNT-01 — Profil admin

1. Catat nama dan email baseline.
2. Ubah nama/email menjadi data test, simpan, lalu refresh `/admin`.
3. **Harapan:** nilai test tetap tersimpan dan identitas pada Dasbor mengikuti perubahan.
4. Pulihkan nama dan email baseline.

### TC-ACCOUNT-02 — Kata sandi admin

1. Uji password lama salah, password baru kurang dari 8 karakter, dan password baru sama dengan password lama.
2. **Harapan:** setiap input tidak valid ditolak tanpa mengubah password.
3. Ubah ke password test yang valid, logout, lalu login memakai password baru.
4. Pulihkan password baseline dan ulangi login sebagai bukti pemulihan.

## 4. Skenario Konten Landing dan Branding

### TC-LANDING-01 — Copy seksi landing

1. Buka `/admin/landing` dan catat baseline.
2. Tambahkan marker test pada kelompok field berikut, lalu simpan setiap kelompok:
   - Fitur: eyebrow, judul, pesan kosong.
   - Cara Bermain: judul.
   - Galeri: eyebrow, judul, deskripsi, title/pesan kosong.
   - Berita: judul dan label CTA.
   - FAQ: eyebrow dan judul.
   - Komentar: judul, prompt login, pesan kosong, label kirim, dan pesan gagal.
   - Kontak: eyebrow, judul, deskripsi, label/email kontak, judul/pesan kosong sosial.
3. Buka seksi publik terkait dan verifikasi marker tampil.
4. Kosongkan field wajib atau isi email kontak tidak valid.
5. **Harapan:** simpan ditolak dan error menyebut field terkait.
6. Pulihkan seluruh nilai baseline. Uji empty state hanya pada data test yang aman; jangan menghapus konten nyata untuk memaksa kondisi kosong.

### TC-BRANDING-01 — Nama, logo, dan favicon

1. Buka `/admin/branding`; catat semua nilai baseline.
2. Ubah **Nama Game** dan tagline dengan marker test, simpan, lalu refresh admin.
3. Buka `/`; verifikasi nama pada header/footer dan judul tab browser.
4. Uji URL logo/favicon `http://...` atau URL tidak valid. **Harapan:** ditolak.
5. Unggah logo JPG/PNG/WebP/SVG valid dan favicon PNG/SVG valid; pastikan preview/URL terisi, lalu klik **Simpan Branding**.
6. Verifikasi aset tampil di situs publik. Uji tombol **Kembalikan ke Default**, simpan, dan verifikasi fallback.
7. Kembalikan semua nilai baseline dan bersihkan aset test yang tidak dipakai.

### TC-HERO-01 — Hero, CTA, media, dan status

1. Buka `/admin/hero`; catat baseline Hero.
2. Ubah judul, subjudul, label CTA, URL CTA, background, dan video dengan data test. Gunakan anchor valid seperti `#wishlist`/`#unduh` atau URL `https://...`.
3. Simpan, buka `/`, lalu verifikasi judul, subjudul, media, dan tujuan CTA.
4. Kosongkan judul atau isi URL tidak valid. **Harapan:** error tampil dan data tersimpan tidak berubah.
5. Uji unggah background gambar valid dan video MP4 valid; setelah URL otomatis terisi, simpan form.
6. Nonaktifkan **Terbit**, simpan, dan verifikasi Hero disembunyikan; aktifkan lagi lalu pulihkan baseline.

> Hero pada UI saat ini adalah singleton. Tidak ada form CRUD banner Hero untuk diuji.

## 5. Skenario Koleksi Konten

### TC-CARD-01 — Kartu Landing

1. Buka `/admin/landing-cards` dan buat kartu test dengan slot, judul, body, tone, urutan, serta status **Terbit**.
2. Tambahkan pasangan CTA: label dan URL `https://...`. Uji label tanpa URL, URL tanpa label, dan URL invalid.
3. Simpan lalu verifikasi kartu tampil pada landing.
4. Ubah marker judul, klik **Batal** saat edit, lalu pastikan nilai lama tetap; edit lagi dan simpan.
5. Buat kartu kedua; uji tombol ↑/↓. **Harapan:** urutan daftar dan publik berubah; kontrol awal/akhir tidak memindahkan melewati batas.
6. Nonaktifkan **Terbit** pada kartu test. **Harapan:** kartu tidak tampil publik.
7. Klik hapus, batalkan dialog, lalu hapus dengan konfirmasi. Verifikasi kartu hilang dari admin dan publik. Bersihkan aset gambar test.

### TC-FEATURE-01 — Fitur Game

1. Buka `/admin/features`; buat fitur test berisi judul, deskripsi, ikon URL atau unggahan, dan **Urutan**.
2. Simpan, refresh admin, lalu verifikasi di `/#fitur` termasuk ikon/fallback dan posisi sesuai angka urutan.
3. Uji URL ikon invalid dan field wajib kosong; periksa error.
4. Edit lalu batalkan; pastikan nilai tidak berubah. Edit dan simpan.
5. Hapus: batalkan sekali, lalu konfirmasi hapus. Bersihkan ikon R2 test.

### TC-HOW-01 — Cara Bermain dan video demo

1. Buka `/admin/how-to-play`; catat baseline video demo.
2. Isi URL atau unggah MP4 pada video demo, simpan, lalu verifikasi `<video>` di `/#cara-main` memiliki kontrol.
3. Tambah langkah dengan judul, deskripsi, media gambar/video opsional, dan **Urutan**; simpan.
4. Verifikasi nomor, urutan, dan media di publik. Ubah nilai **Urutan** untuk membuktikan pengurutan numerik.
5. Uji URL/media invalid, edit-batal, edit-simpan, dan hapus cancel/confirm.
6. Pulihkan video demo baseline, hapus langkah test, dan bersihkan aset test.

### TC-GALLERY-01 — Galeri dan lightbox

1. Buka `/admin/gallery`; unggah aset dulu, kemudian isi metadata dan simpan record Galeri.
2. Uji minimal satu gambar; bila aset tersedia, uji satu video. Cakup jenis yang tersedia: screenshot, artwork, banner, atau video.
3. Uji submit tanpa unggah/URL valid. **Harapan:** record tidak dibuat.
4. Atur judul dan **Urutan**, simpan, refresh admin, lalu verifikasi thumbnail pada `/#galeri`.
5. Klik gambar di publik untuk lightbox; buka video untuk memastikan kontrol pemutar tersedia.
6. Uji filter jenis, edit metadata, edit-batal, dan urutan numerik.
7. Hapus: batalkan confirm native sekali, lalu konfirmasi. Verifikasi record hilang. Bila objek eksternal sudah tidak ada atau bukan aset R2, catat status hapus objek yang relevan.

### TC-NEWS-01 — Berita draf dan terbit

1. Buka `/admin/news`; buat berita test dengan judul, ringkasan, isi, dan status **Draf**. Verifikasi slug otomatis, lalu uji slug manual.
2. Simpan draf. **Harapan:** berita tidak tampil di `/#berita` dan `/berita/[slug]` tidak terbuka untuk publik.
3. Uji slug duplikat/invalid dan field wajib kosong. **Harapan:** error tampil tanpa merusak data sebelumnya.
4. Ubah status menjadi **Terbit**, simpan, lalu verifikasi tampil di `/#berita` dan halaman `/berita/[slug]`.
5. Unggah cover gambar, verifikasi preview dan hasil publik; uji edit-batal, edit-simpan, delete cancel/confirm.
6. Pada environment test saja, buat lebih dari tiga berita terbit dengan waktu berbeda. **Harapan:** landing hanya menampilkan tiga terbaru; berita lain masih dapat diakses lewat halaman detail.
7. Hapus seluruh berita test dan cover R2 test.

### TC-FAQ-01 — FAQ

1. Buka `/admin/faq`; buat FAQ test berisi pertanyaan, jawaban, dan **Urutan**.
2. Simpan, refresh admin, lalu verifikasi `/#faq`; klik pertanyaan untuk membuka/tutup jawaban.
3. Ubah urutan numerik dan verifikasi posisi publik.
4. Uji field wajib kosong, edit-batal, edit-simpan, lalu hapus cancel/confirm.
5. Hapus FAQ test.

### TC-SOCIAL-01 — Tautan Sosial

1. Buka `/admin/links`; buat tautan sosial test berisi platform, URL `https://...`, dan **Urutan**.
2. Simpan, refresh admin, lalu verifikasi tautan tampil pada Kontak/footer publik.
3. Klik tautan publik. **Harapan:** membuka tab baru dengan `target="_blank"` dan perlindungan `rel="noopener noreferrer"`.
4. Uji platform kosong, URL `http://...`, dan URL invalid; periksa error.
5. Uji edit-batal, edit-simpan, urutan numerik, lalu hapus cancel/confirm.

> Email resmi dan copy Kontak diuji di `/admin/landing`, bukan di `/admin/links`.

## 6. Skenario Komentar dan Wishlist

### TC-COMMENT-01 — Moderasi komentar

1. Login Google memakai akun test, buka `/#komentar`, dan kirim komentar dengan marker test.
2. **Harapan:** komentar langsung tampil di publik.
3. Buka `/admin/comments`; verifikasi nama, isi, waktu, avatar/fallback inisial, total, dan anchor komentar.
4. Buka Dasbor; verifikasi total dan widget komentar terbaru ikut berubah.
5. Coba komentar melebihi 500 karakter. **Harapan:** ditolak.
6. Jika environment aman dan rate limit dapat direset, kirim beruntun sampai batas rate limit untuk memverifikasi penolakan. Catat sebagai skenario kondisional.
7. Di admin, buka hapus lalu batalkan; pastikan komentar masih ada. Hapus dengan konfirmasi, refresh publik dan Dasbor, lalu pastikan komentar dan total berkurang.

### TC-WISHLIST-01 — Pencarian dan ekspor CSV

1. Gunakan alur Google Wishlist publik untuk membuat pendaftar test; jangan memasukkan data langsung ke database.
2. Buka `/admin/wishlist`; verifikasi total, nama, email, dan tanggal.
3. Cari berdasarkan nama dan email marker, lalu gunakan reset pencarian.
4. Jika data test cukup, uji pagination dan pastikan hasil konsisten saat berpindah halaman.
5. Ekspor CSV tanpa filter dan dengan filter pencarian. Verifikasi file terunduh, baris sesuai filter, serta karakter berbahaya ditangani aman saat dibuka spreadsheet.
6. Catat bahwa CSV ini adalah ekspor pendaftar Wishlist, bukan tautan unduhan game.

> Wishlist hanya baca, cari, paginasi, dan ekspor. Tidak ada hapus dari UI. Gunakan data sandbox/disposable dan jangan menghapus pendaftar nyata.

## 7. Perilaku Saat Ini dan Batasan yang Dikenal

- Panel saat ini memiliki 12 modul konten, bukan sembilan modul seperti deskripsi awal Issue #4.
- Download publik adalah kartu Steam dengan CTA Wishlist statis; tidak ada CRUD tautan download di admin.
- Email serta copy kontak berada di **Konten Landing**. **Tautan Sosial** hanya menangani media sosial.
- UI Hero tidak menyediakan CRUD banner Hero.
- Hanya Kartu Landing memakai kontrol urutan ↑/↓. Fitur, Cara Bermain, Galeri, FAQ, dan Tautan Sosial memakai angka **Urutan**.
- Berita sudah mendukung detail `/berita/[slug]`; Komentar sudah dapat dimoderasi. Keduanya tidak lagi bergantung pada Issue #2.
- Berkas dalam `docs/archive/` adalah catatan historis, bukan sumber prosedur aktif ini.

## 8. Checklist Penutupan QA

- [ ] Semua skenario yang relevan lulus atau memiliki blocker terdokumentasi.
- [ ] Bukti tersimpan untuk sukses, validasi, hapus, dan dampak publik.
- [ ] Semua record, singleton, copy, kredensial, dan aset test sudah dipulihkan/dibersihkan.
- [ ] Tidak ada data pribadi, secret, atau aset produksi pada bukti uji.
- [ ] Temuan mencantumkan ID skenario, langkah reproduksi, hasil aktual, hasil harapan, screenshot, dan lingkungan uji.
