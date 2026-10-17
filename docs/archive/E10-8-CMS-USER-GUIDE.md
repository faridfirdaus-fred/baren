# Panduan Penggunaan CMS — Website BAREN

| Field   | Keterangan                          |
| ------- | ----------------------------------- |
| Versi   | 1.0                                 |
| Tanggal | 17 Oktober 2026                     |
| Untuk   | Mitra pengelola konten (non-teknis) |
| Status  | Handover & Pelatihan                |

---

## 1. Akses Panel Admin

### Login

1. Buka `https://[domain-website]/admin/login`
2. Masukkan email dan password yang sudah terdaftar
3. Klik **Masuk**

> **Catatan:** Akun admin dibuat oleh developer saat deployment. Tidak ada pendaftaran mandiri.

### Logout

Klik nama email di pojok kanan atas dashboard → pilih **Keluar**.

---

## 2. Dashboard

Setelah login, Anda akan melihat **Dashboard** yang menampilkan:

- **Total Wishlist**: Jumlah pengunjung yang gabung wishlist via Google
- **Total Komentar**: Jumlah komentar masuk dari pengunjung
- **Total Galeri**: Jumlah foto/video di galeri
- **Total Berita**: Jumlah berita yang dipublikasikan

Dashboard ini read-only, untuk melihat ringkasan data.

---

## 3. Kelola Hero Banner (Halaman Utama)

**Lokasi Menu:** `Kelola Hero`

Hero banner adalah bagian paling atas website (video/gambar background + judul + deskripsi + tombol CTA).

### Langkah Edit Hero

1. Klik **Kelola Hero** di sidebar
2. Anda akan melihat data hero saat ini
3. Edit field yang ingin diubah:
   - **Judul**: Teks besar di tengah hero
   - **Deskripsi**: Teks kecil di bawah judul
   - **Label Tombol**: Teks tombol CTA (contoh: "Gabung Wishlist")
   - **Link Tombol**: URL tujuan tombol (contoh: `/#wishlist`)
   - **URL Media Hero**: Link video MP4 atau gambar JPG/PNG untuk background
4. Klik **Simpan Hero**

> **Tips:** Hero hanya ada 1, tidak bisa tambah/hapus. Hanya edit.

---

## 4. Kelola Berita

**Lokasi Menu:** `Kelola News`

Website menampilkan **maksimal 3 berita terbaru** di homepage (urutkan berdasarkan tanggal publikasi terbaru). Berita tidak punya halaman detail.

### Tambah Berita Baru

1. Klik **Kelola News** → **Buat News Baru**
2. Isi form:
   - **Judul**: Judul berita
   - **Ringkasan (Excerpt)**: 1-2 kalimat singkat
   - **Tanggal Publikasi**: Tanggal berita (default hari ini)
   - **URL Cover**: Link gambar cover berita
   - **Link Berita**: URL artikel lengkap (opsional, jika berita ada di website lain)
   - **Status**: `draft` (belum tampil) atau `published` (tampil di website)
3. Klik **Simpan**

### Edit/Hapus Berita

- **Edit**: Klik tombol **Edit** di baris berita → ubah data → **Simpan**
- **Hapus**: Klik tombol **Hapus** → konfirmasi

> **Ingat:** Hanya 3 berita terbaru yang tampil di homepage. Sisanya tetap tersimpan di database tapi tidak tampil.

---

## 5. Kelola Landing Cards (Fitur Unggulan)

**Lokasi Menu:** `Kelola Landing Cards`

Landing cards adalah 3-4 kartu fitur unggulan yang muncul di bawah hero banner.

### Tambah Card Baru

1. Klik **Kelola Landing Cards** → **Buat Landing Card Baru**
2. Isi form:
   - **Judul**: Judul fitur (contoh: "Open World")
   - **Isi**: Deskripsi singkat
   - **Nama Ikon**: Pilih ikon dari dropdown (contoh: `map`, `users`, `zap`, `gamepad2`)
   - **Order**: Urutan tampil (angka kecil tampil lebih dulu)
3. Klik **Simpan**

### Edit/Hapus Card

- **Edit**: Klik **Edit** di card → ubah data → **Simpan**
- **Hapus**: Klik **Hapus** → konfirmasi

> **Tips:** Ubah field `Order` untuk mengatur urutan tampil card di homepage.

---

## 6. Kelola Fitur Game

**Lokasi Menu:** `Kelola Fitur`

Fitur game adalah daftar 4-6 fitur yang muncul dalam section "Features" di homepage.

### Tambah Fitur Baru

1. Klik **Kelola Fitur** → **Buat Fitur Baru**
2. Isi form:
   - **Judul**: Nama fitur (contoh: "Karakter Unik")
   - **Isi**: Deskripsi 1-2 kalimat
   - **URL Media**: Link gambar/video ilustrasi fitur
   - **Order**: Urutan tampil
3. Klik **Simpan**

### Edit/Hapus Fitur

- **Edit**: Klik **Edit** → ubah data → **Simpan**
- **Hapus**: Klik **Hapus** → konfirmasi

---

## 7. Kelola FAQ

**Lokasi Menu:** `Kelola FAQ`

FAQ adalah daftar pertanyaan dan jawaban yang sering ditanyakan pengunjung.

### Tambah FAQ Baru

1. Klik **Kelola FAQ** → **Buat FAQ Baru**
2. Isi form:
   - **Pertanyaan**: Pertanyaan pengunjung
   - **Jawaban**: Jawaban detail (bisa beberapa paragraf)
   - **Order**: Urutan tampil
3. Klik **Simpan**

### Edit/Hapus FAQ

- **Edit**: Klik **Edit** → ubah data → **Simpan**
- **Hapus**: Klik **Hapus** → konfirmasi

---

## 8. Kelola How to Play (Cara Bermain)

**Lokasi Menu:** `Kelola How to Play`

Section ini berisi langkah-langkah cara bermain + 1 video demo gameplay.

### Tambah Langkah Baru

1. Klik **Kelola How to Play** → scroll ke bawah → **Buat How to Play Step Baru**
2. Isi form:
   - **Step**: Nomor langkah (1, 2, 3, dst)
   - **Judul**: Judul langkah (contoh: "Pilih Karakter")
   - **Isi**: Deskripsi langkah
   - **URL Media**: Link gambar/video ilustrasi langkah (opsional)
3. Klik **Simpan**

### Edit Video Demo

1. Klik **Kelola How to Play**
2. Di bagian atas, ubah **Video Demo URL**
3. Klik **Simpan Video Demo**

### Edit/Hapus Langkah

- **Edit**: Klik **Edit** di langkah → ubah data → **Simpan**
- **Hapus**: Klik **Hapus** → konfirmasi

---

## 9. Kelola Galeri

**Lokasi Menu:** `Kelola Galeri`

Galeri adalah kumpulan foto/video game yang tampil dalam grid di halaman Galeri.

### Upload Gambar/Video Baru

1. Klik **Kelola Galeri** → **Upload Aset Baru**
2. Klik **Pilih File** → pilih gambar JPG/PNG atau video MP4 dari komputer
3. Isi **Alt Text** (deskripsi singkat untuk aksesibilitas)
4. Isi **Order** (urutan tampil)
5. Klik **Upload**

> **Catatan:** File akan diupload ke Cloudflare R2 (cloud storage). Proses upload otomatis.

### Hapus Aset

1. Klik tombol **Hapus** di bawah aset
2. Konfirmasi penghapusan
3. Aset akan dihapus dari database dan cloud storage

> **Penting:** Hapus aset permanen, tidak bisa dikembalikan.

---

## 10. Kelola Branding (Logo & Warna)

**Lokasi Menu:** `Kelola Branding`

Branding mengatur logo website dan warna tema.

### Ganti Logo Website

1. Klik **Kelola Branding**
2. Di section **Logo Situs**, klik **Pilih File**
3. Pilih file PNG/JPG logo baru
4. Klik **Upload Logo**
5. Setelah upload selesai, klik **Simpan Branding**

### Ubah Warna Tema

1. Klik **Kelola Branding**
2. Di section **Skema Warna**, ubah kode warna hex:
   - **Sand (Background)**: Warna latar belakang terang
   - **Ink (Teks Utama)**: Warna teks gelap
   - **Ember (Aksen)**: Warna aksen oranye/merah
3. Klik **Simpan Branding**

> **Tips:** Gunakan color picker online (contoh: https://htmlcolorcodes.com/) untuk memilih kode hex warna.

---

## 11. Kelola Wishlist

**Lokasi Menu:** `Kelola Wishlist`

Wishlist adalah daftar pengunjung yang login via Google untuk gabung wishlist game.

### Lihat Data Wishlist

1. Klik **Kelola Wishlist**
2. Anda akan melihat tabel berisi:
   - Email pengunjung
   - Nama
   - Foto profil
   - Tanggal gabung

### Cari Data Wishlist

Gunakan kolom **Cari (email atau nama)** untuk filter data.

### Ekspor Data ke CSV

1. Klik tombol **Ekspor CSV**
2. File CSV akan terdownload ke komputer
3. Buka dengan Excel/Google Sheets

> **Catatan:** Data wishlist tidak bisa diedit/hapus manual. Data hanya bisa ditambah via login Google di website publik.

---

## 12. Kelola Komentar

**Lokasi Menu:** `Kelola Komentar`

Komentar adalah pesan dari pengunjung di section "Community" homepage.

### Lihat Komentar

1. Klik **Kelola Komentar**
2. Anda akan melihat tabel berisi:
   - Nama pengunjung
   - Isi komentar
   - Email
   - Tanggal kirim

### Hapus Komentar

1. Klik tombol **Hapus** di baris komentar
2. Konfirmasi penghapusan

> **Penting:** Komentar tidak bisa diedit. Hanya bisa dihapus (contoh: spam, kata kasar).

---

## 13. Tips Umum

### Urutan Tampil (Order)

Banyak fitur CMS punya field **Order**. Aturan:

- Angka **lebih kecil** = tampil **lebih dulu**
- Contoh: Order 1 tampil sebelum Order 2

### Media URL

Untuk upload gambar/video:

- **Galeri & Branding**: Upload langsung lewat CMS (otomatis ke cloud storage)
- **Hero, News, Fitur, How to Play**: Input URL manual (bisa dari cloud storage atau CDN eksternal)

### Status Draft vs Published (Berita)

- **Draft**: Berita tersimpan tapi tidak tampil di website publik
- **Published**: Berita tampil di homepage (maksimal 3 terbaru)

### Validasi Form

CMS akan menolak data tidak valid:

- Field wajib kosong
- Format URL salah
- File terlalu besar (maksimal 10 MB untuk gambar, 100 MB untuk video)

---

## 14. Troubleshooting

### Tidak Bisa Login

- Cek email dan password benar
- Pastikan akun sudah dibuat oleh developer
- Coba refresh halaman atau clear cache browser

### Upload Gambar Gagal

- Cek ukuran file (maksimal 10 MB untuk gambar)
- Format harus JPG, PNG, atau WebP
- Coba compress gambar dulu (gunakan TinyPNG.com)

### Perubahan Tidak Muncul di Website

- Coba refresh halaman website (Ctrl+F5 atau Cmd+Shift+R)
- Tunggu 1-2 menit (cache CDN butuh waktu refresh)
- Cek apakah data sudah tersimpan di CMS

### Butuh Bantuan Teknis

Hubungi developer untuk:

- Reset password
- Buat akun admin baru
- Perbaikan bug
- Perubahan konfigurasi server

---

## 15. Checklist Pelatihan

Checklist ini untuk memastikan mitra sudah bisa menggunakan CMS mandiri.

- [ ] Login dan logout
- [ ] Ganti logo website (≤ 5 menit)
- [ ] Tambah berita baru (input manual + publikasikan)
- [ ] Hapus komentar spam
- [ ] Ekspor data wishlist ke CSV
- [ ] Ubah hero banner (judul, deskripsi, tombol)
- [ ] Tambah FAQ baru
- [ ] Upload gambar ke galeri
- [ ] Edit landing card (ubah order tampil)

---

**Selesai.** Dokumen ini cukup untuk handover CMS ke mitra. Untuk pertanyaan teknis, hubungi developer.
