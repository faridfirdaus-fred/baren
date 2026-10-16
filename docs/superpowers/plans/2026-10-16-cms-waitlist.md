# CMS & Waiting List Admin — E8, E11-7..9

> Ikuti [peta worktree](2026-10-16-peta-worktree-baren.md), SRS FR-ADM-07..30, NFR-SEC-02/03, EI-02 dan tabel `Dep` breakdown. Tiap task dimulai hanya setelah semua dependensi `Done` di main. Sebelum coding `In Progress`; setelah DoD/verifikasi `Done` + catatan/progress/log §4–5. Docs Next.js 16 wajib dibaca saat edit page/route.

**Tujuan:** Panel admin dapat mengubah seluruh konten dan mengelola waitlist. **File:** `src/app/admin/page.tsx`, `src/app/admin/{branding,hero,game,gallery,news,faq,links,waitlist}/**`, `src/components/admin/**` selain uploader R2, `src/app/api/waitlist/**` untuk admin API. Layout dan auth milik jalur lain; semua rute admin cek role di server, termasuk API. UI dilarang menyimpan kredensial/token OAuth. Gunakan kontrak endpoint E3/R2 yang telah terintegrasi.

## Langkah konten

- [x] **E8-1** (Dep E3-2..8 dan E11-3): dashboard hitung features, gallery, news, FAQ, waitlist dan waktu update terakhir dari DB/API; tampilkan loading/error/kosong, tidak ada fetch sensitif dari klien anonim.
- [ ] **E8-2** (Dep E3-2, E4-6): branding nama/logo/favicon dengan uploader, preview, validasi dan simpan; uji perubahan nyata di header/favicon setelah revalidate.
- [ ] **E8-3** (Dep E3-3, E4-6): edit hero judul/subjudul/video/CTA, CRUD banner termasuk urutan; uji hapus/update dan tampilan publik.
- [ ] **E8-4** (Dep E3-4, E4-6): edit About + CRUD Features dengan gambar/ikon dan urutan; uji wajib, data kosong, admin lain melihat perubahan.
- [ ] **E8-5** (Dep E3-4, E4-6): langkah How to Play dan video demo; CRUD/urut media; uji hasil publik.
- [ ] **E8-6** (Dep E3-5, E4-5, E4-6): gallery upload metadata setelah R2 berhasil, jenis media, urut, hapus lewat mekanisme E4-5; uji kegagalan upload tidak membuat record rusak.
- [ ] **E8-7** (Dep E3-6, E4-6): news CRUD, slug unik, draf/terbit, thumbnail; uji draf tidak terlihat di publik dan edit slug/terbit valid.
- [x] **E8-8** (Dep E3-7): FAQ CRUD dan urutan, dialog jelas, keyboard dan teks wajib.
- [x] **E8-9** (Dep E3-8): download/sosial/email kontak CRUD, URL HTTPS, state belum rilis; uji hasil publik dan input tidak valid.
- [ ] **E8-10** (Dep E8-6..9): dialog konfirmasi sebelum setiap hapus data/aset terkait, Escape/batal aman, aksi permanen hanya setelah setuju. Sebelum E8-10 selesai, tiap modul CRUD sebelumnya wajib memakai konfirmasi dasar jika sudah mengekspos aksi hapus demi FR-ADM-26.
- [ ] **E8-11** (Dep E8-1..9): feedback sukses/gagal serta pesan error per field di semua modul, pertahankan input saat error, fokus pesan dan state loading; periksa semua form, bukan hanya satu modul.
- [ ] **E8-12** (Dep E8-4/5/6/8): pengurutan drag/drop Features, How to Play, Gallery, FAQ dengan alternatif keyboard, urutan persisted di DB dan tampil di publik; uji refresh/concurrent edit.

## API dan UI waitlist

- [x] **E11-7** (Dep E3-1, E11-2): GET `/api/waitlist` admin-only, Zod query page/search, pagination deterministik dan count; 401 anonim, 403 pengunjung Google, tidak ada email di GET publik.
- [x] **E11-8** (Dep E11-7): endpoint CSV admin-only dengan header/encoding aman dan escaping CSV untuk nilai yang diawali `=`, `+`, `-`, `@`; uji 0 baris, unicode, pemisah/quote/newline dan unauthorized. Data diekspor hanya oleh admin.
- [x] **E11-9** (Dep E11-7, E11-8): tabel email/nama/tanggal, pencarian/paginasi/jumlah total, tombol ekspor CSV, error/kosong/loading dan keyboard; uji daftar panjang.

**Verifikasi:** `pnpm lint && pnpm exec tsc --noEmit && pnpm format:check && pnpm build`, preview Worker: admin CRUD → halaman publik, anonim/Google-only 401/403, upload/hapus riil, CSV aman, navigasi mobile/keyboard. Cek setiap modul terhadap FR-ADM terkait sebelum tandai `Done`.
