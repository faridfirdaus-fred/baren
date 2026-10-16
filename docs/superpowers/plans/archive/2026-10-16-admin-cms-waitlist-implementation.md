# CMS Dashboard, FAQ, Links, and Waitlist List API

**Tujuan:** Menambahkan ringkasan dashboard admin, pengelolaan FAQ serta tautan/kontak, dan API daftar waitlist terproteksi.

**Scope:** E8-1, E8-8, E8-9, E11-7 saja.

**Di luar scope:** E11-8 ekspor CSV, E11-9 UI waitlist, perubahan schema/migrasi, integrasi publik FAQ/social/download. Ekspor E11-8 nanti wajib memuat semua hasil filter, bukan hanya halaman aktif.

## Berkas

| Berkas                                   | Perubahan                                                         |
| ---------------------------------------- | ----------------------------------------------------------------- |
| `src/app/admin/page.tsx`                 | Dashboard ringkasan dari server/DB.                               |
| `src/app/admin/layout.tsx`               | Navigasi FAQ dan Tautan & Kontak, state tautan aktif.             |
| `src/lib/admin/dashboard.ts`             | Kontrak dan helper ringkasan dashboard murni.                     |
| `src/app/admin/faq/page.tsx`             | Route FAQ dengan guard admin server.                              |
| `src/components/admin/faq-manager.tsx`   | CRUD FAQ memakai API E3-7.                                        |
| `src/app/admin/links/page.tsx`           | Route tautan/kontak dengan guard admin server.                    |
| `src/components/admin/links-manager.tsx` | CRUD social/download dan edit email kontak memakai API E3-8/E3-2. |
| `src/lib/validation/waitlist.ts`         | Zod query `page` dan `search`.                                    |
| `src/lib/api/waitlist.ts`                | Kontrak serta pagination waitlist murni.                          |
| `src/app/api/waitlist/route.ts`          | `GET` daftar waitlist admin-only.                                 |
| `src/lib/admin/dashboard.test.mjs`       | Unit test agregasi dashboard.                                     |
| `src/lib/validation/waitlist.test.mjs`   | Unit test query waitlist.                                         |
| `src/lib/api/waitlist.test.mjs`          | Unit test pagination waitlist.                                    |

## Task 1 — Test helper dashboard

**Berkas:**

- Buat `src/lib/admin/dashboard.test.mjs`
- Buat `src/lib/admin/dashboard.ts`

1. Tulis test `node:test` untuk store terinjeksi: lima count diteruskan benar, timestamp terbesar dipilih, nilai `null` diabaikan, dan semua `null` menghasilkan `latestContentUpdatedAt: null`.
2. Jalankan `node --test src/lib/admin/dashboard.test.mjs`; pastikan gagal karena modul belum ada.
3. Buat `DashboardStore`, `DashboardCounts`, `DashboardSummary`, dan `readDashboardSummary`.
4. Jalankan test; pastikan lulus.

## Task 2 — Dashboard server E8-1

**Berkas:**

- Ubah `src/app/admin/page.tsx`

1. Pertahankan guard `auth()` dan role admin yang sudah ada.
2. Buat adapter `DashboardStore` lokal dari `getDb()`; hitung `features`, `galleryAssets`, `news`, `faq`, dan `waitlist` dengan `count()`.
3. Query `max(updatedAt)` paralel untuk `siteSettings`, `hero`, `heroBanners`, `about`, `features`, `howToPlaySteps`, `howToPlayVideo`, `galleryAssets`, `news`, `faq`, `socialLinks`, dan `downloadLinks`.
4. Kirim hasil ke `readDashboardSummary`, render lima kartu metrik serta waktu pembaruan konten. Saat semua konten kosong tampilkan `Belum ada pembaruan konten.`
5. Jangan masukkan `waitlist` dalam timestamp konten. Bila record terbaru dihapus, query berikutnya menampilkan timestamp record tersisa; bila semua kosong, nilainya `null`.
6. Pertahankan formulir akun dan logout.

## Task 3 — Test kontrak waitlist

**Berkas:**

- Buat `src/lib/validation/waitlist.test.mjs`
- Buat `src/lib/api/waitlist.test.mjs`
- Buat `src/lib/validation/waitlist.ts`
- Buat `src/lib/api/waitlist.ts`

1. Tulis test schema: `page` default 1; tolak nol, negatif, desimal, nilai non-angka; trim pencarian; ubah pencarian kosong ke `undefined`; tolak pencarian di atas 320 karakter dan key tidak dikenal.
2. Tulis test service dengan lister terinjeksi: teruskan query, `perPage` tetap 25, hitung `totalPages` untuk total nol dan bukan nol.
3. Jalankan dua test; pastikan gagal karena modul belum ada.
4. Tambahkan `WAITLIST_PER_PAGE = 25` dan Zod schema strict untuk `page` dan `search`.
5. Tambahkan `WaitlistListItem`, `WaitlistPage`, `WaitlistLister`, dan `readWaitlistPage`; service hanya menyusun hasil pagination.
6. Jalankan test; pastikan lulus.

## Task 4 — API daftar waitlist E11-7

**Berkas:**

- Buat `src/app/api/waitlist/route.ts`

1. Implementasikan `GET(request)` dengan `requireAdminResponse("GET /api/waitlist")` sebelum parsing atau query.
2. Ambil `page` dan `search` dari `URL.searchParams`, parse memakai schema E11-7. Kembalikan `VALIDATION_ERROR` shared envelope bila tidak valid.
3. Buat kondisi filter tunggal: tanpa `search` tanpa `WHERE`; bila ada gunakan `ilike(waitlist.email, pattern)` atau `ilike(waitlist.name, pattern)`.
4. Jalankan query count dan rows memakai kondisi sama. Pilih hanya `id`, `email`, `name`, `createdAt`; order `createdAt DESC, id DESC`; `limit(25)` dan `offset((page - 1) * 25)`.
5. Serialisasi `createdAt` ke ISO string, masukkan ke `readWaitlistPage`, dan balikan lewat `fromResult`.
6. Tangkap DB error lewat `toDbResult`. Jangan ubah route `waitlist/status`.
7. Verifikasi manual: anonymous menghasilkan 401, visitor menghasilkan 403, admin menerima envelope dengan item, `total`, `page`, `perPage`, dan `totalPages`.

## Task 5 — Admin FAQ E8-8

**Berkas:**

- Buat `src/app/admin/faq/page.tsx`
- Buat `src/components/admin/faq-manager.tsx`

1. Buat page server dengan guard auth/role identik `src/app/admin/page.tsx`, lalu render `FaqManager`.
2. Di client component, load `GET /api/faq` serta tampilkan loading, error, dan empty state.
3. Sediakan satu form tambah/edit dengan `question`, `answer`, dan input number `sortOrder`; tampilkan error field dari envelope API, tombol pending, cancel edit, dan reset setelah sukses.
4. Gunakan POST untuk tambah dan PUT untuk edit; refresh daftar sesudah mutasi. Jangan duplikasi validasi Zod API di klien.
5. Render daftar sesuai respons API. Sediakan edit dan delete; delete wajib memakai `window.confirm` dan tombol keyboard-native.
6. Jangan buat drag-drop; nomor urut persist lewat `sortOrder` dan drag/drop adalah E8-12.

## Task 6 — Admin tautan/kontak E8-9

**Berkas:**

- Buat `src/app/admin/links/page.tsx`
- Buat `src/components/admin/links-manager.tsx`

1. Buat page server dengan guard admin sama, lalu render `LinksManager`.
2. Load paralel `GET /api/social-links`, `GET /api/download-links`, dan `GET /api/settings`.
3. Buat section tautan unduhan: CRUD `platform`, `label`, `url`, `sortOrder`; state kosong harus menyatakan game masih `Segera Hadir`.
4. Buat section media sosial: CRUD `platform`, `url`, `sortOrder`.
5. Buat section email kontak: edit `emailKontak` lalu PUT partial ke `/api/settings`; string kosong tetap dikirim agar API mengubahnya menjadi `null`.
6. Tiap section punya loading/error/pending sendiri, field error dari server, native confirmation untuk delete. Input URL `type="url"`; API tetap otoritas validasi HTTPS.
7. Jangan ubah halaman publik FAQ/social/download. Email kontak publik sudah ikut branding site layout.

## Task 7 — Navigasi admin

**Berkas:**

- Ubah `src/app/admin/layout.tsx`

1. Tambahkan tautan `/admin/faq` berlabel `FAQ` dan `/admin/links` berlabel `Tautan & Kontak`.
2. Gunakan `usePathname()` agar hanya rute aktif yang mendapat `aria-current="page"`; hilangkan hardcode Dashboard aktif.
3. Pertahankan close drawer, Escape, focus restore, dan target sentuh layout sekarang.
4. Jangan tambahkan tautan waitlist sebelum E11-9 selesai.

## Task 8 — Dokumentasi task dan verifikasi

**Berkas:**

- Ubah `docs/TASK_BREAKDOWN.md`
- Ubah `docs/superpowers/plans/2026-10-16-cms-waitlist.md`

1. Sebelum coding, tandai E8-1, E8-8, E8-9, dan E11-7 sebagai `In Progress` sesuai aturan plan.
2. Setelah semua DoD terpenuhi, tambahkan bukti command/test, tandai `Done`, hitung ulang progress, dan tambah log terbaru tanpa menimpa entri lain.
3. Jalankan:

```bash
node --test src/lib/admin/dashboard.test.mjs src/lib/api/faq.test.mjs src/lib/api/links.test.mjs src/lib/api/waitlist.test.mjs src/lib/api/auth.test.mjs src/lib/validation/faq.test.mjs src/lib/validation/links.test.mjs src/lib/validation/settings.test.mjs src/lib/validation/waitlist.test.mjs
pnpm lint
pnpm exec tsc --noEmit
pnpm format:check
pnpm build
```

4. Jalankan browser/manual test dengan admin nyata untuk FAQ dan tautan/kontak; verifikasi create, edit, perubahan urutan, delete confirmation, empty/error state, dan refresh halaman.
5. Verifikasi dashboard count serta timestamp terhadap database. Verifikasi waitlist API untuk anonymous 401, visitor 403, admin page 1, pencarian email/nama case-insensitive, total yang sama dengan filter rows, dan urutan stabil.

## Commit checkpoints

1. `test: cover dashboard and waitlist contracts`
2. `feat: add admin dashboard and waitlist list API`
3. `feat: add FAQ and links admin management`
4. `docs: complete E8 and E11 task records`
