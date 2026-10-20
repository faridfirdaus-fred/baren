# Perbaikan Regresi Modul Admin Berita & Komentar

**Tanggal:** 2026-10-20
**Status:** Done (2026-10-20; diverifikasi unit, lint, typecheck, format, build, dan Playwright preview)
**Issue:** [GitHub #2](https://github.com/faridfirdaus-fred/baren/issues/2) — [Bug] Modul Admin Berita (/admin/news) dan Komentar (/admin/comments) tidak dapat dimuat
**Sumber acuan:** `docs/PRD.md`, `docs/SRS.md` (FR-ADM-18/19/31, FR-PUB-10/11), `docs/TASK_BREAKDOWN.md` (E3-6, E8-7, E13-3, §5 DoD).

## 1. Ringkasan

Issue melaporkan dua halaman admin gagal dimuat karena bentuk respons API tidak cocok dengan yang dibaca komponen. Review kode mengonfirmasi kedua penyebab tersebut, dan menemukan empat bug tambahan pada alur CRUD berita yang membuat formulir berita tidak pernah benar-benar berfungsi, bahkan setelah error render pertama diperbaiki.

Rencana ini memperbaiki kontrak data di sisi klien, menambah endpoint daftar berita khusus admin, menyelaraskan mutasi berita dengan rute berbasis ID, serta menambah tes regresi unit dan Playwright.

## 2. Temuan yang Terverifikasi

### 2.1 Modul Berita

| #   | Temuan                                                                                         | Bukti                                                                                                                   | Dampak                                                                                                           |
| --- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| B1  | `NewsManager` menganggap `json.data` array, padahal API mengembalikan objek `NewsPage`         | `src/components/admin/news-manager.tsx:70` vs `src/lib/api/news.ts` (`readNewsPage`)                                    | `setItems({items,...})`; `items.map` di `news-manager.tsx:353` melempar `TypeError: items.map is not a function` |
| B2  | `GET /api/news` hanya mengambil status `published` dan membatasi `limit` maksimal 9            | `src/app/api/news/route.ts:46-60`, `:120`; `parseLimitParam` memakai `maks = 9` sehingga `limit=999` dipotong menjadi 9 | Draf tidak terlihat di admin; permintaan `limit=999` tetap hanya 9 item                                          |
| B3  | Daftar berita publik membuang `body`                                                           | `src/lib/api/news.ts` (`toListItem`, `readNewsPage`)                                                                    | Saat Edit, `item.body` undefined; menyimpan ulang menghasilkan validasi "Isi berita wajib diisi"                 |
| B4  | Edit/Hapus mengirim slug, sedangkan rute `[key]` mem-parsing ID numerik                        | `src/components/admin/news-manager.tsx:99`, `:171` vs `src/app/api/news/[key]/route.ts` (`parseIdParam`)                | `PUT/DELETE /api/news/berita-saya` selalu 400 "ID tidak valid"                                                   |
| B5  | Form create tidak mengirim `slug`, padahal `newsCreateSchema` mewajibkannya                    | Form di `news-manager.tsx` vs `src/lib/validation/news.ts` (`newsCreateSchema`)                                         | `POST /api/news` selalu 400; berita tidak pernah bisa ditambahkan dari UI                                        |
| B6  | Komponen membaca `json.message`/`json.fields` di root, padahal error API ada di `json.error.*` | `news-manager.tsx:109-113` vs `src/lib/api/response.ts` (`fail`, `fromResult`)                                          | Error validasi per kolom tidak pernah tampil; admin hanya melihat toast generik                                  |
| B7  | `excerpt` bertipe `string`, API mengembalikan `string \| null`                                 | `NewsItem` di `news-manager.tsx` vs `NewsRow` di `src/lib/api/news.ts`                                                  | Nilai `null` masuk ke `textarea`; peringatan React dan state tidak konsisten                                     |

### 2.2 Modul Komentar

| #   | Temuan                                                                                   | Bukti                                                                                           | Dampak                                                                                   |
| --- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| C1  | Komponen membaca `comment.user.name`, API mengembalikan field datar `userName`           | `src/components/admin/comments-manager.tsx:98` vs `src/lib/api/comments.ts` (`CommentListItem`) | `TypeError: Cannot read properties of undefined (reading 'name')`                        |
| C2  | Tipe `Comment` mengharapkan `user: { name, email }` dan `userId`, yang tidak dikirim API | `comments-manager.tsx` interface vs `GET /api/comments`                                         | Tipe menyesatkan; field yang diakses tidak ada                                           |
| C3  | Error envelope berbentuk objek disimpan ke state string/toast                            | `comments-manager.tsx:43-44`, `:68-70`                                                          | Jika API mengembalikan `{ ok:false, error:{...} }`, React mencoba merender objek → crash |
| C4  | Tidak ada fallback avatar                                                                | `comments-manager.tsx` tidak merender avatar                                                    | Melanggar action item issue; komentar tanpa foto tidak punya identitas visual            |

### 2.3 Mengapa Lolos Pengujian Sebelumnya

- `scripts/test-admin-panel.mjs` tidak membuka `/admin/news` maupun `/admin/comments`; ia hanya mengecek `#komentar` di landing.
- `scripts/test-cms-landing.mjs` membuka kedua halaman, tetapi hanya memastikan heading `Kelola Berita`/`Kelola Komentar` ada. Heading dirender oleh server page, sehingga komponen klien yang crash tidak menggagalkan assertion.
- Tidak ada unit test untuk pemetaan respons API ke state komponen.

## 3. Kontrak yang Ditetapkan

1. **Daftar berita admin** memakai `GET /api/news?scope=admin`:
   - Hanya admin (401 anonim, 403 non-admin).
   - Mengembalikan **semua** status (draft + published), termasuk `body`, terurut `updatedAt DESC, id DESC`.
   - Respons tetap amplop standar: `{ ok: true, data: NewsRow[] }`.
2. **Daftar berita publik tidak berubah**: `GET /api/news` tetap hanya published, paginasi 9, tanpa body; `GET /api/news?slug=` tetap 404 untuk draf.
3. **Mutasi berita memakai ID numerik**: `PUT/DELETE /api/news/[id]`. Tidak ada perubahan kontrak server pada `[key]`.
4. **Slug berita** tetap wajib di API. Form admin menampilkan kolom Slug yang terisi otomatis dari judul saat create, dapat diedit, dan tidak berubah otomatis saat edit agar URL publik tidak rusak tanpa sepengetahuan admin.
5. **API komentar tidak diubah**. Klien beradaptasi dengan bentuk datar `{ comments: [{ id, body, userName, userPhotoUrl, createdAt }] }`.
6. **Parsing respons klien dipusatkan** di satu helper murni agar bentuk amplop sukses/gagal konsisten dan dapat diuji tanpa React/DB.

## 4. Rencana Implementasi

### Langkah 0 — Daftarkan task di `docs/TASK_BREAKDOWN.md`

Tambahkan epik regresi agar pekerjaan terpetakan ke task dan requirement:

| ID    | Task                        | Detail                                                        | FR/Terkait   | Prio | SP  | Dep          | Status |
| ----- | --------------------------- | ------------------------------------------------------------- | ------------ | ---- | --- | ------------ | ------ |
| E15-1 | API daftar berita admin     | `GET /api/news?scope=admin`, guard admin, semua status + body | FR-ADM-18/19 | P0   | 2   | E3-6         | Todo   |
| E15-2 | Perbaikan `NewsManager`     | Amplop respons, slug, mutasi by ID, body, error validasi      | FR-ADM-18/19 | P0   | 3   | E15-1        | Todo   |
| E15-3 | Perbaikan `CommentsManager` | Field datar, error envelope, fallback avatar                  | FR-ADM-31    | P0   | 2   | E3-12        | Todo   |
| E15-4 | Tes regresi admin           | Unit parser/slug + Playwright kedua halaman                   | NFR-MNT-03   | P0   | 2   | E15-2, E15-3 | Todo   |

Perbarui §1 (tambah baris E15, total SP +9), tambahkan §E15, lalu tandai `In Progress` saat mulai. Beri catatan pada E8-7/E13-3 bahwa regresi ditemukan dan diperbaiki di E15-2/E15-3. Jangan ubah status historis E8-7/E13-3.

### Langkah 1 — E15-1: Endpoint daftar berita admin

**File:** `src/app/api/news/route.ts`

Tambahkan cabang di awal `GET`, sebelum penanganan `?slug=` dan daftar publik:

```ts
if (params.get("scope") === "admin") {
  const denied = await requireAdminResponse("GET /api/news?scope=admin");
  if (denied) return denied;
  try {
    const rows = await getDb()
      .select()
      .from(news)
      .orderBy(desc(news.updatedAt), desc(news.id));
    return fromResult({ ok: true, data: rows.map(toRow) });
  } catch (error) {
    console.error("GET /api/news?scope=admin gagal:", error);
    return fromResult(toDbResult(error));
  }
}
```

Catatan:

- `toRow` sudah memuat `body` dan seluruh field yang dibutuhkan form edit.
- Tidak memakai `parseLimitParam` karena helper tersebut membatasi maksimal 9.
- Tidak perlu migrasi DB atau perubahan skema.
- Tambahkan komentar route yang menjelaskan perbedaan scope publik vs admin.

**Kriteria selesai:**

- Admin menerima draf dan terbit, termasuk `body`.
- Anonim → 401; user login non-admin → 403.
- `GET /api/news` dan `GET /api/news?slug=` berperilaku sama seperti sebelumnya.

### Langkah 2 — E15-2: Perbaikan `NewsManager`

**File baru:**

- `src/lib/api/client-response.ts` — parser amplop dan pesan error murni.
- `src/lib/admin-news-client.ts` — tipe `AdminNewsItem`, `parseAdminNewsList`, `slugifyTitle`.

**File diubah:** `src/components/admin/news-manager.tsx`

#### 2a. Parser respons

`parseApiEnvelope<T>(value)` mengembalikan:

- `{ ok: true, data }` untuk `{ ok: true, data: ... }`.
- `{ ok: false, message, fields? }` untuk `{ ok: false, error: { message, fields? } }`.
- `{ ok: false, message: "Respons server tidak valid." }` untuk bentuk lain.

`apiErrorMessage(value, fallback)` menangani `{ error: string }`, `{ error: { message } }`, dan `{ message }`.

`parseAdminNewsList(value)` memanggil `parseApiEnvelope`, lalu **wajib** memeriksa `Array.isArray(data)`. Jika data berupa objek `{ items, page, ... }`, kembalikan error "Respons server tidak valid." — ini mencegah regresi B1.

`slugifyTitle(title)`:

- normalisasi NFKD, buang diakritik, lowercase;
- ganti karakter non-`[a-z0-9]` dengan `-`, rapikan tanda hubung;
- potong maksimal 160 karakter;
- jika hasil kosong → `""` (form required + Zod akan menampilkan error);
- jika hasil murni angka → beri prefiks `berita-` agar tidak melanggar aturan slug API.

Gunakan impor relatif ber-ekstensi `.ts` di modul murni (contoh `import { parseApiEnvelope } from "./api/client-response.ts"`) agar `node --test` dapat me-resolve modul, mengikuti pola `src/lib/landing-content.ts`.

#### 2b. Tipe dan state

- `NewsItem` → gunakan `AdminNewsItem` dari `admin-news-client.ts`; `excerpt` bertipe `string | null`.
- `NewsFormData` tambah `slug: string`.
- Hapus state `editingSlug`; cukup `editingId`.
- Tambah state `slugTouched` untuk mencegah judul menimpa slug yang sudah diedit manual.

#### 2c. Muat daftar

```ts
const res = await fetch("/api/news?scope=admin", { cache: "no-store" });
const parsed = parseAdminNewsList(await res.json());
if (!parsed.ok) {
  setError(parsed.message);
  return;
}
setItems(parsed.data);
```

Pertahankan catch untuk respons non-JSON dengan pesan "Gagal memuat berita".

#### 2d. Form create/edit

- Tambah input `id="slug"`, label "Slug *", helper: "Dipakai di URL /berita/[slug]. Terisi otomatis dari judul; bisa diubah."
- Saat judul berubah dan `editingId === null` serta `!slugTouched`, isi slug dengan `slugifyTitle(judul)`.
- Saat slug diubah manual, set `slugTouched = true`.
- `handleEdit`: isi `slug: item.slug`, `excerpt: item.excerpt ?? ""`, `coverUrl: item.coverUrl ?? ""`; set `slugTouched = true`.
- `handleCancelEdit` dan reset setelah sukses: kosongkan slug dan set `slugTouched = false`.
- URL submit: `/api/news/${editingId}` saat edit, `/api/news` saat create.
- Body JSON menyertakan `slug`.
- Parse respons dengan `parseApiEnvelope<AdminNewsItem>`; jika `fields` ada → `setFormErrors(fields)`; selain itu tampilkan toast `message`.

#### 2e. Hapus

- URL: `/api/news/${deleteTarget.id}`.
- Parse respons dengan `parseApiEnvelope`; tampilkan `message` bila gagal.
- Setelah sukses, muat ulang daftar.

#### 2f. Catatan kecil (opsional)

Teks bantuan di form masih menyatakan "Saat ini belum ada halaman detail berita." Padahal `/berita/[slug]` sudah ada (E7-2). Perbarui agar tidak menyesatkan admin. Ini bukan bagian inti bug dan boleh dikerjakan bersama E15-2.

**Kriteria selesai:**

- Daftar memuat draf dan terbit, termasuk body.
- Create berita baru berhasil dari form (slug terisi otomatis).
- Edit memuat body dan slug yang benar, lalu menyimpan via ID.
- Hapus via ID berhasil.
- Error validasi tampil per kolom; error 409 slug tampil sebagai toast.
- Tidak ada `items.map is not a function`.

### Langkah 3 — E15-3: Perbaikan `CommentsManager`

**File baru:** `src/lib/admin-comments-client.ts`

- Tipe `AdminComment = { id, body, userName, userPhotoUrl, createdAt }`.
- `parseAdminComments(value)` menerima `{ comments: [...] }`, menormalkan `userName` kosong/null menjadi `"Anonim"`, `userPhotoUrl` kosong/null menjadi `null`, dan melewati item rusak tanpa membuat seluruh halaman crash.
- Jika respons adalah amplop gagal, kembalikan `{ ok:false, message }`.

**File diubah:** `src/components/admin/comments-manager.tsx`

- Ganti interface `Comment` dengan `AdminComment`; hapus `userId` dan `user`.
- Muat:
  ```ts
  const parsed = parseAdminComments(await res.json());
  if (!parsed.ok) {
    setError(parsed.message);
    return;
  }
  setComments(parsed.data);
  ```
- Render nama: `{comment.userName || "Anonim"}`.
- Tambah avatar:
  - jika `userPhotoUrl` ada → `next/image` 36×36, `alt=""` (dekoratif, nama ada di teks);
  - jika null → lingkaran dengan inisial huruf pertama `userName`, beri `data-testid="comment-avatar-fallback"`.
- Hapus:
  - gunakan `res.ok` sebagai penentu sukses (respons sukses DELETE adalah `{ success: true }`, tanpa `ok`);
  - untuk gagal, gunakan `apiErrorMessage(json, "Gagal menghapus komentar")`;
  - jangan pernah menaruh objek ke `toast.message`.
- Tangani `res.json()` non-JSON dengan `.catch(() => null)`.

**Kriteria selesai:**

- Halaman menampilkan komentar dengan `userName`, bukan crash.
- Komentar tanpa foto menampilkan fallback inisial.
- Hapus berhasil dan menampilkan toast.
- 401/403/404/500 menampilkan pesan teks yang aman.

### Langkah 4 — E15-4: Tes regresi

#### Unit test (`node:test`, pola `.test.mjs` yang ada)

| File                                     | Cakupan                                                                                                                                                                          |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/api/client-response.test.mjs`   | amplop sukses, amplop gagal + fields, `error` string, bentuk rusak, `apiErrorMessage`                                                                                            |
| `src/lib/admin-news-client.test.mjs`     | `parseAdminNewsList` menerima array; **menolak objek `{items,...}`**; menolak amplop gagal; `slugifyTitle` (spasi, tanda baca, diakritik, angka murni, kosong, panjang maksimal) |
| `src/lib/admin-comments-client.test.mjs` | `{comments:[...]}` datar; `userName` null → "Anonim"; foto null/empty → null; item rusak dilewati; amplop gagal                                                                  |

Jalankan: `node --test $(find src -name '*.test.*')`.

#### Playwright

**File baru:** `scripts/test-admin-content.mjs` (pola env `E2_TEST_ADMIN_EMAIL`/`E2_TEST_ADMIN_PASSWORD` seperti skrip lain).

Skenario:

1. Login admin; daftarkan listener `page.on("pageerror", ...)`.
2. `/admin/news`:
   - tunggu teks `Daftar Berita`; pastikan tidak ada `Gagal memuat berita`;
   - isi Judul unik (mis. `Berita Uji <timestamp>`), pastikan input Slug terisi otomatis;
   - isi Isi, pilih status `draft`, klik Simpan; pastikan `Berita ditambahkan`;
   - pastikan item muncul dengan `Status: draft`;
   - klik Edit item tersebut, ubah judul, Simpan; pastikan `Berita diperbarui`;
   - klik Hapus, konfirmasi tombol `Hapus` di dialog (gunakan `.last()` karena ada dua tombol bernama sama), pastikan `Berita dihapus`.
3. `/admin/comments`:
   - mock `GET **/api/comments` dengan satu komentar `{ id: 9001, body: "Komentar uji", userName: "Penguji", userPhotoUrl: null, createdAt: <ISO> }`;
   - pastikan `Oleh: Penguji` dan fallback avatar tampil;
   - mock `DELETE **/api/comments/9001` → `{ success: true }`;
   - klik Hapus, konfirmasi, pastikan `Komentar dihapus`.
4. Di akhir, assert tidak ada `pageerror` dan tidak ada teks `Gagal memuat`.
5. Bersihkan berita uji di `finally` bila langkah hapus belum tercapai.

Perkuat juga `scripts/test-cms-landing.mjs`:

- setelah membuka `/admin/comments`, tunggu `Belum ada komentar.` **atau** `Oleh:`, bukan hanya heading;
- setelah membuka `/admin/news`, tunggu `Daftar Berita` dan pastikan tidak ada `Gagal memuat berita`.

### Langkah 5 — Verifikasi dan dokumentasi

Jalankan berurutan:

```bash
node --test $(find src -name '*.test.*')
pnpm exec tsc --noEmit
pnpm lint
pnpm format:check
pnpm build
pnpm preview   # terminal terpisah; build + preview OpenNext di :8787 (butuh .dev.vars + binding R2)
node scripts/test-admin-content.mjs http://localhost:8787
```

Verifikasi manual:

- Login admin → `/admin/news`: daftar memuat draf + terbit; create/edit/delete berhasil; error validasi tampil inline.
- Login admin → `/admin/comments`: daftar tampil, avatar fallback benar, hapus berkonfirmasi berhasil.
- Publik: `/api/news?limit=3` hanya berita terbit; draf tidak muncul di landing dan `/berita/<slug-draf>` → 404.
- Konsol browser bersih dari `TypeError`.
- Responsif 360/768/1280 px tanpa gulir horizontal.
- Setelah semua lulus: ubah E15-1..4 menjadi `Done`, isi Catatan + Log Progress §4, perbarui progress §1, lalu arsipkan plan ini ke `docs/superpowers/plans/archive/`.

## 5. Matriks File

| File                                        | Tindakan | Rincian                                                               |
| ------------------------------------------- | -------- | --------------------------------------------------------------------- |
| `src/app/api/news/route.ts`                 | Ubah     | Tambah cabang `GET ?scope=admin` dengan guard dan semua status + body |
| `src/lib/api/client-response.ts`            | Tambah   | Parser amplop sukses/gagal + ekstraksi pesan error                    |
| `src/lib/admin-news-client.ts`              | Tambah   | Tipe `AdminNewsItem`, `parseAdminNewsList`, `slugifyTitle`            |
| `src/lib/admin-comments-client.ts`          | Tambah   | Tipe `AdminComment`, `parseAdminComments`, normalisasi field          |
| `src/components/admin/news-manager.tsx`     | Ubah     | Fetch admin scope, slug, mutasi by ID, error envelope, tipe null      |
| `src/components/admin/comments-manager.tsx` | Ubah     | Field datar, parser, fallback avatar, hapus aman                      |
| `src/lib/api/client-response.test.mjs`      | Tambah   | Unit test parser                                                      |
| `src/lib/admin-news-client.test.mjs`        | Tambah   | Unit test daftar berita + slug                                        |
| `src/lib/admin-comments-client.test.mjs`    | Tambah   | Unit test komentar                                                    |
| `scripts/test-admin-content.mjs`            | Tambah   | Playwright regresi kedua halaman                                      |
| `scripts/test-cms-landing.mjs`              | Ubah     | Perkuat assertion halaman admin                                       |
| `docs/TASK_BREAKDOWN.md`                    | Ubah     | Daftarkan E15, status, log, progress                                  |

Tidak ada perubahan pada `src/db/schema.ts`, migrasi, atau API publik.

## 6. Skenario Uji

| #   | Skenario                                           | Hasil yang Diharapkan                                                  |
| --- | -------------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | Buka `/admin/news` dengan sesi admin               | Daftar berita tampil; tidak ada `TypeError`                            |
| 2   | `GET /api/news?scope=admin` tanpa sesi             | 401                                                                    |
| 3   | `GET /api/news?scope=admin` sebagai non-admin      | 403                                                                    |
| 4   | Buat berita draft dari form                        | 201; item muncul di daftar admin; tidak muncul di landing              |
| 5   | Buat berita published dari form                    | 201; item muncul di daftar admin dan landing (maks 3 terbaru)          |
| 6   | Edit judul/isi berita                              | 200; daftar dan halaman detail publik memakai data baru                |
| 7   | Hapus berita                                       | 200; item hilang dari daftar admin dan publik                          |
| 8   | Slug duplikat                                      | 409; toast "Slug sudah dipakai."                                       |
| 9   | Judul kosong                                       | 400; pesan inline di kolom Judul                                       |
| 10  | Buka `/admin/comments` dengan komentar berfoto     | Avatar tampil; nama dari `userName`                                    |
| 11  | Komentar tanpa foto                                | Fallback inisial tampil                                                |
| 12  | Hapus komentar                                     | 200; toast "Komentar dihapus"; item hilang                             |
| 13  | Hapus komentar tanpa sesi admin                    | 401; toast pesan teks, bukan crash                                     |
| 14  | Respons API berbentuk `{ items: [...] }` (regresi) | Parser menolak dengan pesan "Respons server tidak valid."; tidak crash |
| 15  | `GET /api/news` publik                             | Tetap hanya published, maks 9/halaman, tanpa body                      |
| 16  | `GET /api/news?slug=<draf>`                        | 404                                                                    |

## 7. Risiko dan Catatan

- **Slug bentrok:** auto-slug dapat menghasilkan slug yang sudah dipakai. API mengembalikan 409; admin dapat mengubah kolom Slug. Jangan menambahkan suffix otomatis diam-diam karena dapat mengubah URL tanpa persetujuan.
- **Perubahan slug saat edit:** slug tidak ikut berubah saat judul diedit. Jika admin mengubah slug manual, URL publik lama tidak redirect. Tambahkan helper text peringatan; redirect 301 di luar scope.
- **Payload daftar admin:** mengirim seluruh body berita. Untuk jumlah berita CMS saat ini wajar; jika tumbuh besar, tambahkan endpoint detail per ID atau paginasi admin.
- **Komponen `Image`:** `next.config.ts` sudah mengizinkan `*.googleusercontent.com`; auth pengunjung hanya Google, sehingga avatar aman. Jika nanti ada provider lain, tambahkan remote pattern.
- **Tes Playwright:** membutuhkan server berjalan, DB Neon, dan kredensial admin. Jika environment tidak tersedia, jalankan unit test + verifikasi manual dan catat blocker; jangan menandai Done tanpa bukti.
- **Tanpa migrasi:** tidak ada perubahan skema/tabel.
- **API publik stabil:** jangan mengubah bentuk `GET /api/news` atau `GET /api/comments` yang sudah dipakai halaman publik.

## 8. Checklist Selesai

- [ ] E15-1..4 terdaftar dan ditandai `In Progress` sebelum coding.
- [ ] `GET /api/news?scope=admin` dilindungi guard dan mengembalikan semua status + body.
- [ ] `NewsManager` memakai parser amplop dan `Array.isArray`.
- [ ] Form berita memiliki slug otomatis + editable.
- [ ] Create mengirim slug; edit/delete memakai ID numerik.
- [ ] Error validasi tampil inline; error 409/401/403 tampil sebagai teks.
- [ ] `CommentsManager` memakai `userName`/`userPhotoUrl` datar.
- [ ] Fallback avatar tampil untuk foto null.
- [ ] Hapus komentar menangani sukses dan error envelope tanpa crash.
- [ ] Unit test baru lulus; total test tidak menurun.
- [ ] Playwright `test-admin-content.mjs` lulus tanpa `pageerror`.
- [ ] `tsc --noEmit`, `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm preview` lulus.
- [ ] Verifikasi manual publik (draf tersembunyi, detail published) lulus.
- [ ] `TASK_BREAKDOWN.md` §1/§4/§E15 diperbarui; plan diarsipkan setelah semua Done.
