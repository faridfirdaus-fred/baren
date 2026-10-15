# API Konten — E3-1..10

> Baca [peta worktree](2026-10-16-peta-worktree-baren.md), SRS §3.2–3.5, tabel task dan docs Next.js 16 terpasang. Setiap checkbox hanya dimulai saat seluruh `Dep` pada baris breakdown `Done` di main. Status/progress/log mengikuti §4–5 breakdown.

**Tujuan:** JSON Route Handlers dengan Drizzle, Zod, admin guard, pembacaan publik terfilter, cache ≤60 detik. **SRS:** EI-02/03, FR-PUB-01..17/25, FR-ADM-08..25/27, NFR-SEC-02/03, C-04. **File:** `src/app/api/{settings,hero,game,gallery,news,faq,links}/**` untuk rute (nama final disepakati sebelum UI), `src/lib/api/**` untuk respons/error/auth, `src/lib/validation/**` untuk Zod; `src/db/**` milik Data, jangan edit paralel.

**Kontrak sebelum implementasi:** tulis tabel path, metode, parameter, contoh JSON sukses/error dan 400/401/403/404, status publish, batas halaman, urutan, key URL aset bersama konsumen UI. GET publik hanya item published, tidak menampilkan hash/token/data admin. Mutasi harus parse input server-side dan cek role admin, bukan cuma session; gunakan Drizzle terparameterisasi. Semua 404/validation errors berformat konsisten. Jika data model kurang, kirim perubahan ke jalur Data sebelum task terblokir dimulai.

## Langkah

- [ ] **E3-1** (Dep E2-4): helper parse/response error, identitas admin/401 anonim/403 nonadmin; uji GET publik, PUT anonim, PUT pengunjung, PUT admin dan error DB tanpa detail sensitif. Terbitkan helper untuk R2 dan waitlist API.
- [ ] **E3-2** (Dep E1-1, E3-1): GET settings branding/email kontak dan PUT admin; pastikan satu record settings (upsert id tetap), URL/logo teruji; uji branding berubah pada GET.
- [ ] **E3-3** (Dep E1-1, E3-1): GET hero published, PUT hero, CRUD+urut banner, CTA aman dan URL sesuai aturan; uji urutan, hero kosong, perubahan banner dan akses anonim.
- [ ] **E3-4** (Dep E1-1, E3-1): About, Features, How to Play steps/video: GET berurut dan endpoint mutasi admin; uji edit, tambah/hapus/urut, video tidak ada, validasi ID dan media.
- [ ] **E3-5** (Dep E1-2, E3-1): gallery CRUD/urut untuk empat jenis media, metadata key/URL hasil uploader, hapus record terkoordinasi dengan E4-5; GET publik yang aman; uji tanpa galeri dan urutan sama.
- [ ] **E3-6** (Dep E1-2, E3-1): news CRUD draf/terbit, slug unik dan URL aman, `published_at`, GET detail publik hanya terbit, daftar terbaru dengan 9/halaman, paging deterministik; uji draf tak dapat diakses anonim, slug konflik, halaman invalid.
- [ ] **E3-7** (Dep E1-2, E3-1): FAQ CRUD dan urut deterministik; uji edit/hapus/urutan, teks wajib, request tanpa admin.
- [ ] **E3-8** (Dep E1-2, E3-1): social/download links CRUD dan email kontak settings, validasi URL HTTPS dan status belum rilis; uji link kosong/tidak valid serta autentikasi.
- [ ] **E3-9** (Dep E3-1): Zod input seluruh Route Handler mutasi; kolom wajib, URL `https://`, batas media sesuai E4-3 dan kesalahan per kolom; uji malformed JSON, field ekstra berbahaya, tipe salah, URL http, ukuran >batas. Hubungkan dengan endpoint E3-2..8 sebelum masing-masing selesai; meski ID E3-9 baru `Done` sendiri, semua endpoint sebelumnya wajib validasi dari awal.
- [ ] **E3-10** (Dep E3-2..8): pilih strategi cache/tag/revalidate sesuai panduan Next 16; uji edit/hapus/admin lalu GET halaman publik segar ≤60 detik dalam preview Worker, bukan hanya API response. Jika read path UI langsung query DB, koordinasikan invalidasi itu juga.

**Verifikasi:** `pnpm lint && pnpm exec tsc --noEmit && pnpm format:check && pnpm build`; uji HTTP JSON di `pnpm preview` untuk tiap kontrak, negatif 400/401/403/404, dan pembacaan setelah mutasi. Tidak perlu menambah wrapper CRUD generik bila rute kecil cukup.
