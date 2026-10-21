# Transparansi Metrik Dasbor & Drill-down Komentar

**Tanggal:** 2026-10-21
**Status:** Done — diimplementasikan dan diverifikasi 2026-10-21
**Issue:** [GitHub #3](https://github.com/faridfirdaus-fred/baren/issues/3) — [Audit/Clarity] Data metrik komentar pada Dasbor Admin (Komentar: 1) dan transparansi sumber data
**Sumber acuan:** `docs/PRD.md` (FR-ADM-07), `docs/SRS.md` (FR-ADM-04/07/12/31, NFR-SEC-03, NFR-ACC-01, NFR-MNT-03, C-01/C-02), `docs/TASK_BREAKDOWN.md` (E8-1, E8-4, E13, E15, §5 DoD).

## 1. Ringkasan

Issue #3 berawal dari pertanyaan admin: _”di dasbor komentar ketulis 1 tuh datanya darimana?”_. Angka `1` berasal dari baris riil di tabel `comments`, dihitung oleh `db.select({ count: count() }).from(comments)` di `src/app/admin/page.tsx`. Baris tersebut tercipta dari uji kirim komentar melalui landing page dengan akun Google.

Issue #2 yang membuat `/admin/comments` gagal dimuat **sudah diperbaiki** pada commit `d05ae06`. Karena itu rencana ini tidak mengulang perbaikan tersebut. Masalah yang tersisa adalah **transparansi dan keterhubungan**:

1. Kartu metrik dasbor statis, tidak bisa diklik menuju data sumbernya.
2. Halaman `/admin/comments` tidak menampilkan total komentar, sehingga angka dasbor tidak bisa dicocokkan secara eksplisit.
3. `listComments()` membatasi 100 baris dan menelan error menjadi `[]`, sehingga dasbor bisa menampilkan angka berbeda dari daftar tanpa penjelasan.
4. Waktu pembaruan ditampilkan sebagai ISO mentah, sedangkan waktu komentar memakai zona waktu browser.
5. Belum ada widget yang memperlihatkan komentar terbaru sebagai bukti sumber data.

Review juga menemukan dua celah di luar pertanyaan utama:

- Metrik **Fitur** belum punya halaman pengelolaan sama sekali. E8-4 hanya membangun `/admin/landing-cards`; tidak ada route `/admin/features`, padahal seksi publik FITUR UTAMA membaca `/api/features`.
- Beberapa halaman admin belum mengulang guard page-level dan `dynamic = "force-dynamic"` seperti halaman saudaranya. `src/proxy.ts` sudah memblokir seluruh `/admin/*`, jadi ini bukan bypass autentikasi, melainkan inkonsistensi defense-in-depth.

Rencana ini menutup kelima masalah utama, menambahkan halaman Kelola Fitur, menyamakan guard, lalu mengunci perilakunya dengan unit test dan Playwright.

## 2. Temuan yang Terverifikasi

| #   | Temuan                                                                                                                         | Bukti                                                                                                                                                      | Dampak                                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Kartu metrik dasbor adalah `<div>` statis di dalam `<dl>`, bukan tautan                                                        | `src/app/admin/page.tsx:120-162`                                                                                                                           | Admin tidak bisa langsung menuju data sumber; angka terasa “muncul entah dari mana”                                                     |
| D2  | Waktu pembaruan konten dirender sebagai ISO mentah                                                                             | `src/app/admin/page.tsx:158` (`toISOString()`)                                                                                                             | Admin melihat `2026-10-21T...Z`, bukan waktu Indonesia yang mudah dibaca                                                                |
| D3  | `listComments()` memakai `innerJoin`, membatasi 100 baris, dan menelan error menjadi `[]`                                      | `src/lib/api/comments.ts:54-79`                                                                                                                            | Daftar bisa kosong/lebih sedikit dari hitungan dasbor tanpa pesan error; admin tidak bisa membedakan “tidak ada data” dan “kueri gagal” |
| D4  | Respons `GET /api/comments` tidak menyertakan total                                                                            | `src/app/api/comments/route.ts:14-22`                                                                                                                      | Halaman komentar tidak punya angka pembanding terhadap kartu dasbor                                                                     |
| D5  | Format waktu tidak konsisten: dasbor memakai UTC ISO, komentar memakai zona waktu browser                                      | `src/app/admin/page.tsx:158`; `src/components/admin/comments-manager.tsx:107`                                                                              | Dua tampilan waktu untuk data yang sama; zona acuan tidak jelas                                                                         |
| D6  | `/admin/comments`, `/admin/news`, `/admin/hero`, `/admin/how-to-play`, `/admin/landing-cards` tidak mengulang guard page-level | `src/app/admin/comments/page.tsx:1-10` dan empat page saudaranya; guard page contoh ada di `src/app/admin/faq/page.tsx:1-26`                               | `src/proxy.ts:52-86` tetap memblokir anonim, tetapi konvensi defense-in-depth dan `force-dynamic` tidak seragam                         |
| D7  | Metrik Fitur tidak punya halaman pengelolaan                                                                                   | Tidak ada `src/app/admin/features/`; E8-4 hanya mencatat `/admin/landing-cards`; publik membaca `/api/features` di `src/components/site/game-features.tsx` | Angka Fitur di dasbor tidak bisa diverifikasi atau dikelola dari UI                                                                     |
| D8  | Issue #2 sudah selesai; halaman `/admin/comments` sudah dapat dimuat                                                           | Commit `d05ae06`; plan arsip `docs/superpowers/plans/archive/2026-10-20-perbaikan-admin-berita-komentar.md`                                                | Fokus issue #3 adalah transparansi metrik dan drill-down, bukan perbaikan crash lama                                                    |

## 3. Keputusan & Kontrak yang Ditetapkan

1. **Kartu metrik adalah navigasi.** Enam kartu (Fitur, Galeri, Berita, FAQ, Wishlist, Komentar) menjadi `<Link>` di dalam `<ul>`, bukan `<div>` di dalam `<dl>`. Setiap kartu menampilkan label, angka, deskripsi singkat sumber data, dan ajakan “Kelola …”.
2. **Sumber angka dinyatakan eksplisit.** Di atas grid kartu ada keterangan: angka dihitung langsung dari basis data saat halaman dimuat; pilih kartu untuk melihat dan mengelola data sumbernya. Deskripsi per kartu menjelaskan cakupan (mis. Berita “termasuk draf”, Komentar “seluruh komentar pengunjung”).
3. **Waktu memakai zona Indonesia.** Helper `formatDateTimeId()` memakai locale `id-ID` dan `Asia/Jakarta`, menghasilkan format seperti `21 Oktober 2026 pukul 14.30 WIB`. Nilai kosong/rusak dikembalikan sebagai `null` agar pemanggil menentukan fallback.
4. **Kontrak komentar admin baru:** `GET /api/comments?scope=admin`
   - Hanya admin: 401 tanpa sesi, 403 untuk non-admin.
   - Mengembalikan **semua** komentar, terbaru dulu, dengan bentuk `{ comments, total }`.
   - Memakai `leftJoin(users)` agar komentar tanpa baris user tetap tampil sebagai “Anonim”.
   - Tidak menelan error: kegagalan database menghasilkan amplop error standar, bukan `[]`.
5. **API komentar publik tidak berubah.** `GET /api/comments` tetap mengembalikan `{ comments }` dengan perilaku dan batas yang sama seperti sekarang. Halaman landing tetap memakai `listComments()`.
6. **Angka dasbor dan total admin memakai sumber yang sama:** hitungan `count()` pada tabel `comments` dan total daftar admin sama-sama mencakup seluruh baris komentar. Karena daftar admin tidak dibatasi, `total` dihitung dari jumlah baris yang dikembalikan pada snapshot kueri yang sama.
7. **Halaman Kelola Fitur baru** memakai API `/api/features` yang sudah ada (`GET` publik, `POST/PUT/DELETE` admin). Tidak ada perubahan skema atau migrasi.
8. **Guard page-level diseragamkan** untuk lima halaman admin yang belum memilikinya. `src/proxy.ts` tetap menjadi lapisan utama; guard page adalah lapisan kedua.
9. **Tidak ada perubahan pada `src/db/schema.ts`, migrasi, atau bentuk API publik.** Seluruh teks UI berbahasa Indonesia, mobile-first, dan memakai token desain yang ada.

## 4. Rencana Implementasi

### Langkah 0 — Daftarkan epik E16 di `docs/TASK_BREAKDOWN.md`

Tambahkan epik berikut agar setiap pekerjaan terpetakan ke task dan requirement:

| ID    | Task                     | Detail                                                               | FR/Terkait                       | Prio | SP  | Dep          | Status |
| ----- | ------------------------ | -------------------------------------------------------------------- | -------------------------------- | ---- | --- | ------------ | ------ |
| E16-1 | Halaman Kelola Fitur     | `/admin/features` CRUD via `/api/features`, guard, upload ikon, nav  | FR-ADM-12                        | P0   | 3   | E3-4, E8-4   | Todo   |
| E16-2 | Kartu metrik interaktif  | Enam kartu menjadi tautan + deskripsi sumber + waktu lokal           | FR-ADM-07, NFR-ACC-01, C-01/C-02 | P0   | 2   | E8-1, E16-1  | Todo   |
| E16-3 | Kontrak komentar admin   | `GET /api/comments?scope=admin`, guard, `{ comments, total }`, error | FR-ADM-31, FR-ADM-07, NFR-SEC-03 | P0   | 3   | E3-12        | Todo   |
| E16-4 | Widget komentar terbaru  | Tiga komentar terbaru + tautan ke `/admin/comments`                  | FR-ADM-07                        | P1   | 2   | E16-3        | Todo   |
| E16-5 | Guard page-level tersisa | comments, news, hero, how-to-play, landing-cards                     | FR-ADM-04, NFR-SEC-03            | P1   | 1   | E2-4         | Todo   |
| E16-6 | Tes regresi & verifikasi | Unit parser/format/metrik + Playwright dasbor, komentar, fitur       | NFR-MNT-03                       | P0   | 2   | E16-1..E16-5 | Todo   |

Ketentuan dokumentasi:

- Perbarui §1: tambahkan baris **E16** dengan total **13 SP**, status `In Progress`, progress `97%` (368 dari 381 SP selesai). Setelah semua task `Done`, ubah menjadi 100% dan total SP menjadi 381.
- Tambahkan §E16 setelah §E15.
- Perbarui matriks ketertelusuran §2:
  - `FR-ADM-04` → `E2-4, E16-5`
  - `FR-ADM-07` → `E8-1, E16-2, E16-4`
  - `FR-ADM-12` → `E3-4, E16-1`
  - `FR-ADM-31` → `E13-2/3, E15-3, E16-3`
  - `NFR-ACC-01` → tambahkan `E16-2`
  - `NFR-SEC-03` → tambahkan `E16-3, E16-5`
  - `NFR-MNT-03` → tambahkan `E16-6`
- Beri catatan pada E8-4: “2026-10-21: UI Fitur belum ada; celah ditutup di E16-1.” Jangan ubah status historis E8-4.
- Beri catatan pada E8-1: “2026-10-21: drill-down metrik ditambahkan di E16-2/E16-4.”
- Tandai E16-1..E16-6 `In Progress` sebelum mulai coding, lalu `Done` + Catatan setelah verifikasi lulus.

### Langkah 1 — E16-1: Halaman Kelola Fitur

**File baru:**

- `src/app/admin/features/page.tsx` — server component dengan guard yang sama seperti `/admin/faq`, `export const dynamic = "force-dynamic"`, judul “Kelola Fitur”, dan helper text “Fitur tampil di seksi FITUR UTAMA landing page.”
- `src/components/admin/features-manager.tsx` — client component CRUD.
- `src/lib/admin-features-client.ts` — tipe `AdminFeature` dan parser `parseAdminFeatures(value)` berbasis `parseApiEnvelope`.

**File diubah:** `src/app/admin/layout.tsx`, `src/app/admin/page.tsx` (link navigasi “Kelola Fitur”).

**Perilaku manager:**

- Muat `GET /api/features`; respons sukses `{ ok: true, data: FeatureRow[] }`.
- Form: `title` (wajib), `description` (opsional), `iconUrl` (opsional), `sortOrder` (angka).
- Gunakan `AssetUploader purpose="ikon"` untuk mengunggah ikon; isi otomatis `iconUrl` dan tampilkan pratinjau. API aset sudah menangani SVG/ikon.
- Create: `POST /api/features`; edit: `PUT /api/features/{id}`; hapus: `DELETE /api/features/{id}` dengan `DeleteConfirmDialog`.
- Tampilkan error validasi per kolom dari `fields`, error umum sebagai toast, dan muat ulang daftar setelah mutasi sukses.
- Empty state: “Belum ada fitur. Tambahkan fitur pertama.”
- Daftar menampilkan urutan, judul, deskripsi, ikon (fallback placeholder), tombol Edit/Hapus.
- Seluruh teks berbahasa Indonesia; target sentuh minimal 44 px; fokus terlihat.

**Kriteria selesai:**

- `/admin/features` dapat dibuka admin, dan anonim/non-admin diarahkan oleh proxy/guard.
- Create, edit, hapus fitur berhasil dan daftar langsung diperbarui.
- Error validasi tampil inline; error umum tampil sebagai toast.
- Tidak ada perubahan API atau skema.

### Langkah 2 — E16-2: Kartu metrik interaktif & waktu lokal

**File baru:**

- `src/lib/admin/dashboard-metrics.ts` — `buildDashboardMetrics(counts)` mengembalikan enam metrik berurutan: Fitur, Galeri, Berita, FAQ, Wishlist, Komentar. Setiap item berisi `key`, `label`, `value`, `href`, `description`, `actionLabel`.
- `src/lib/admin/datetime.ts` — `formatDateTimeId(value)`.

**File diubah:** `src/app/admin/page.tsx`, `src/app/admin/dashboard-layout.test.mjs`.

**Konfigurasi metrik:**

| Metrik   | `href`            | Deskripsi kartu                   |
| -------- | ----------------- | --------------------------------- |
| Fitur    | `/admin/features` | Jumlah fitur game yang tersimpan  |
| Galeri   | `/admin/gallery`  | Jumlah aset galeri (gambar/video) |
| Berita   | `/admin/news`     | Seluruh berita, termasuk draf     |
| FAQ      | `/admin/faq`      | Jumlah pasangan tanya-jawab       |
| Wishlist | `/admin/wishlist` | Jumlah email terdaftar            |
| Komentar | `/admin/comments` | Seluruh komentar pengunjung       |

**Markup:**

- Ganti `<dl>` dengan `<section aria-labelledby="ringkasan-metrik">` berisi `<h2 id="ringkasan-metrik" className="sr-only">Ringkasan metrik</h2>`, paragraf sumber data, dan `<ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">`.
- Setiap `<li>` berisi `<Link>` dengan kelas `group flex h-full flex-col border border-line bg-ink-800 p-5 transition-colors hover:border-ember hover:bg-ink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember`.
- Di dalam link: label (`text-sm text-sand-600`), angka (`text-3xl font-bold text-sand`), deskripsi (`text-sm text-sand-600`), dan ajakan (`mt-auto pt-4 text-xs font-semibold uppercase tracking-wider text-sand-600 group-hover:text-ember`) dengan panah `aria-hidden="true"`.
- Kartu “Pembaruan konten terakhir” tetap statis, tetapi memakai `formatDateTimeId(dashboard.latestContentUpdatedAt) ?? "Belum ada pembaruan konten."` dan `<time dateTime={...}>` bila ada nilai. Tambahkan keterangan “Maksimum dari waktu pembaruan konten; tidak termasuk komentar dan wishlist.”
- Tidak ada JavaScript klien baru; seluruh bagian tetap server component.

**Helper waktu:**

```ts
const formatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
  timeZoneName: "short",
});

export function formatDateTimeId(
  value: Date | string | null | undefined,
): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return formatter.format(date);
}
```

**Kriteria selesai:**

- Enam kartu dapat diklik dan menuju halaman yang benar.
- Angka dan deskripsi sumber data terbaca jelas di 360/768/1280 px.
- Tidak ada lagi `toISOString()` di UI.
- Fokus keyboard terlihat; tautan memiliki nama aksesibel yang jelas.
- `dashboard-layout.test.mjs` diperbarui untuk struktur `<ul>` dan tidak adanya ISO mentah.

### Langkah 3 — E16-3: Kontrak komentar admin & total

**File diubah:** `src/lib/api/comments.ts`, `src/app/api/comments/route.ts`, `src/lib/admin-comments-client.ts`, `src/components/admin/comments-manager.tsx`.

**3a. `src/lib/api/comments.ts`**

Tambahkan:

```ts
export type AdminCommentsPage = {
  comments: CommentListItem[];
  total: number;
};

export async function listAdminComments(): Promise<AdminCommentsPage> {
  const { db, comments, users } = await getDatabase();
  const rows = await db
    .select({
      id: comments.id,
      body: comments.body,
      userName: users.name,
      userPhotoUrl: users.image,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .orderBy(desc(comments.createdAt), desc(comments.id));

  const items = rows.map((row) => ({
    ...row,
    userName: row.userName ?? "Anonim",
    createdAt: row.createdAt.toISOString(),
  }));

  return { comments: items, total: items.length };
}
```

Catatan:

- Jangan bungkus dengan `try/catch` yang mengembalikan `[]`. Biarkan route handler yang memetakan error ke amplop standar.
- Tidak ada `.limit()` agar total dan daftar konsisten. Untuk volume besar di masa depan, tambahkan paginasi eksplisit (lihat §7).
- `leftJoin` menjaga komentar tetap tampil bila baris user tidak ditemukan, meskipun FK saat ini memakai `onDelete: "cascade"`.

**3b. `src/app/api/comments/route.ts`**

- Ubah signature `GET()` menjadi `GET(request: Request)`.
- Bila `new URL(request.url).searchParams.get("scope") === "admin"`:
  - Panggil `requireAdminResponse("GET /api/comments?scope=admin")`; kembalikan respons 401/403 bila ditolak.
  - Panggil `listAdminComments()` dan kembalikan `NextResponse.json({ comments, total })`.
  - Tangkap error, log, lalu kembalikan `fromResult(toDbResult(error))`.
- Selain scope admin, perilaku publik tetap persis seperti sekarang: `listComments()` dan `NextResponse.json({ comments })`.

**3c. `src/lib/admin-comments-client.ts`**

- Ubah hasil sukses menjadi `{ ok: true, data: AdminComment[]; total: number }`.
- Terima bentuk `{ comments: [...], total?: number }`:
  - `total` dipakai bila bilangan bulat dan `>= data.length`;
  - jika tidak ada atau tidak konsisten, fallback ke `data.length`.
- Tetap dukung amplop gagal `{ ok: false, error: { message } }`.
- Tetap lewati item rusak dan normalkan `userName` kosong menjadi “Anonim”, `userPhotoUrl` kosong menjadi `null`.

**3d. `src/components/admin/comments-manager.tsx`**

- Muat `/api/comments?scope=admin` (bukan `/api/comments`).
- Simpan `total` di state; render selalu:
  - `Total {total} komentar.` dengan `data-testid="admin-comments-total"`;
  - bila `comments.length < total`, tambahkan “Menampilkan {comments.length} komentar.”
- Ganti `new Date(comment.createdAt).toLocaleString("id-ID")` dengan `formatDateTimeId(comment.createdAt) ?? "Waktu tidak tersedia"` dan bungkus dalam `<time dateTime={comment.createdAt}>`.
- Empty state tetap “Belum ada komentar.”; error state menampilkan pesan dari parser, bukan daftar kosong.
- Tambahkan atribut `id` berformat `komentar-{id}` pada setiap kartu agar bisa ditautkan dari widget.
- Setelah hapus sukses, muat ulang daftar sehingga `total` ikut turun.

**Kriteria selesai:**

- `/admin/comments` menampilkan total yang sama dengan kartu Komentar di dasbor.
- Komentar tanpa nama/foto tetap tampil sebagai “Anonim” dengan avatar fallback.
- Kegagalan database menampilkan pesan error, bukan “Belum ada komentar.”
- Anonim/non-admin mendapat 401/403 dari scope admin.
- API publik `GET /api/comments` tidak berubah.

### Langkah 4 — E16-4: Widget “Komentar Terbaru”

**File baru:** `src/components/admin/recent-comments.tsx`

**File diubah:** `src/app/admin/page.tsx`

**Query:** setelah `Promise.all` count/timestamp, ambil tiga komentar terbaru:

```ts
const recentComments = await db
  .select({
    id: comments.id,
    body: comments.body,
    userName: users.name,
    createdAt: comments.createdAt,
  })
  .from(comments)
  .leftJoin(users, eq(comments.userId, users.id))
  .orderBy(desc(comments.createdAt), desc(comments.id))
  .limit(3);
```

**Tampilan:**

- `<section aria-labelledby="komentar-terbaru">` dengan judul “Komentar Terbaru” dan tautan “Lihat semua komentar” ke `/admin/comments`.
- Setiap item: nama penulis (`userName ?? "Anonim"`), cuplikan isi maksimal dua baris (`line-clamp-2`), dan `<time>` lokal.
- Setiap item menautkan ke `/admin/comments#komentar-{id}`.
- Empty state: “Belum ada komentar. Komentar pengunjung akan muncul di sini.”
- Gunakan token `border-line bg-ink-800 text-sand`; jangan menambah warna baru.
- Widget ditempatkan setelah grid metrik dan sebelum navigasi “Modul Konten”.

**Kriteria selesai:**

- Dasbor menampilkan maksimal tiga komentar terbaru tanpa error.
- Komentar yang sama dapat dibuka dari widget dan dikelola di `/admin/comments`.
- Empty state tampil bila belum ada komentar.
- Tidak ada query per item (satu query untuk widget).

### Langkah 5 — E16-5: Samakan guard page-level

Tambahkan blok guard yang sama seperti `src/app/admin/faq/page.tsx` dan `export const dynamic = "force-dynamic"` pada:

- `src/app/admin/comments/page.tsx`
- `src/app/admin/news/page.tsx`
- `src/app/admin/hero/page.tsx`
- `src/app/admin/how-to-play/page.tsx`
- `src/app/admin/landing-cards/page.tsx`

Blok guard:

```ts
export const dynamic = "force-dynamic";

export default async function Page() {
  let session = null;
  try {
    session = await auth();
  } catch {
    redirect("/admin/login");
  }
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user) redirect("/admin/login");
  if (role !== "admin") redirect("/admin/login?error=AksesDitolak");

  // ...render
}
```

Catatan: `src/proxy.ts` sudah menolak anonim/non-admin untuk seluruh `/admin/*`. Guard ini adalah lapisan kedua dan menyamakan perilaku dengan halaman admin lain. Jangan mengubah proxy pada task ini.

**Kriteria selesai:**

- Kelima halaman memakai `force-dynamic` dan guard yang sama.
- Tidak ada perubahan perilaku pengguna yang sudah login sebagai admin.
- `tsc --noEmit` dan lint lulus.

### Langkah 6 — E16-6: Tes regresi

**Unit test (`node:test`, pola `.test.mjs` yang ada):**

| File                                       | Cakupan                                                                                                                            |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/admin/dashboard.test.mjs`         | Pastikan `comments` diteruskan apa adanya; tambahkan assertion yang sebelumnya belum ada                                           |
| `src/lib/admin/dashboard-metrics.test.mjs` | Enam metrik, urutan, label, `href`, dan deskripsi; tidak ada `href` kosong                                                         |
| `src/lib/admin/datetime.test.mjs`          | Tanggal valid → mengandung “Oktober 2026” dan “WIB”; `null` → `null`; string rusak → `null`; zona waktu eksplisit                  |
| `src/lib/admin-comments-client.test.mjs`   | `{ comments, total }`; `total` hilang → fallback `data.length`; `total` lebih kecil dari data → fallback; amplop gagal; item rusak |
| `src/lib/admin-features-client.test.mjs`   | Daftar fitur valid; amplop gagal; item rusak dilewati; tipe field opsional tetap aman                                              |
| `src/app/admin/dashboard-layout.test.mjs`  | Struktur `<ul>`/`<Link>`, pemakaian `buildDashboardMetrics`, dan tidak ada `toISOString()` di UI                                   |

Jalankan:

```bash
node --test $(find src -name '*.test.*')
```

**Playwright (`scripts/test-admin-content.mjs`):**

1. Login admin; daftarkan listener `page.on("pageerror", ...)`.
2. `/admin`:
   - pastikan enam kartu metrik tampil dan dapat difokuskan dengan keyboard;
   - baca angka pada kartu Komentar;
   - klik kartu Komentar dan pastikan URL menjadi `/admin/comments`;
   - lakukan pengecekan **dengan data riil** sebelum memasang mock: pastikan teks `Total {angka} komentar.` tampil dan angkanya sama;
   - pastikan waktu pembaruan tidak mengandung pola ISO mentah (`T\d{2}:\d{2}:\d{2}`).
3. `/admin/comments` (skenario hapus):
   - setelah pengecekan data riil, mock `GET **/api/comments?scope=admin` dengan `{ comments: [...], total: 1 }`;
   - muat ulang halaman; pastikan nama, avatar fallback, dan waktu lokal (`WIB`) tampil;
   - mock `DELETE **/api/comments/9001` → `{ success: true }`;
   - klik Hapus, konfirmasi, pastikan toast “Komentar dihapus”.
4. `/admin/features`:
   - buat fitur uji dengan judul unik (mis. `Fitur Uji <timestamp>`);
   - pastikan muncul di daftar;
   - edit judul, simpan, pastikan perubahan tampil;
   - hapus, konfirmasi, pastikan hilang.
5. Konteks anonim:
   - buka `/admin/comments` tanpa sesi; pastikan diarahkan ke `/admin/login`.
6. Di akhir, assert tidak ada `pageerror` dan tidak ada teks “Gagal memuat”.
7. Bersihkan fitur uji di `finally` bila langkah hapus belum tercapai.

Perbarui mock lama yang memakai `**/api/comments` menjadi pola yang cocok dengan query `?scope=admin` (mis. regex `/\/api\/comments\?scope=admin$/`).

**Kriteria selesai:**

- Seluruh unit test lulus; jumlah test tidak menurun.
- Playwright dasbor/komentar/fitur lulus tanpa `pageerror`.
- Assertion keselarasan angka dasbor ↔ total komentar berjalan untuk kasus 0 maupun >0.

### Langkah 7 — Verifikasi & dokumentasi

Jalankan berurutan:

```bash
node --test $(find src -name '*.test.*')
pnpm exec tsc --noEmit
pnpm lint
pnpm format:check
pnpm build
pnpm preview   # terminal terpisah; butuh .dev.vars + binding R2
node scripts/test-admin-content.mjs http://localhost:8787
```

Verifikasi manual:

- Login admin → `/admin`: enam kartu tampil, dapat diklik, dan deskripsi sumber data terbaca.
- Klik Komentar → `/admin/comments`: total sama dengan kartu; daftar memuat komentar yang sama; hapus berkonfirmasi memperbarui total.
- Klik Fitur → `/admin/features`: create/edit/delete berjalan.
- Waktu tampil dalam format Indonesia/WIB di dasbor dan daftar komentar.
- Widget “Komentar Terbaru” menampilkan maksimal tiga item dan tautannya berfungsi.
- Buka `/admin/comments` di jendela privat → diarahkan ke login.
- Responsif 360/768/1280 px tanpa gulir horizontal; fokus keyboard terlihat; kontras teks memadai.
- Konsol browser bersih dari error.
- Setelah semua lulus: ubah E16-1..E16-6 menjadi `Done`, isi Catatan (tanggal + ringkasan + tautan commit/PR), tambahkan entri Log Progress §4, perbarui progress §1 menjadi 100%, lalu arsipkan plan ini ke `docs/superpowers/plans/archive/`.

## 5. Matriks File

| File                                        | Tindakan | Rincian                                                          |
| ------------------------------------------- | -------- | ---------------------------------------------------------------- |
| `docs/TASK_BREAKDOWN.md`                    | Ubah     | Daftarkan E16, traceability, progress, log, catatan E8-1/E8-4    |
| `src/app/admin/page.tsx`                    | Ubah     | Kartu metrik menjadi link, waktu lokal, widget komentar terbaru  |
| `src/lib/admin/dashboard-metrics.ts`        | Tambah   | Konfigurasi enam metrik + `href` + deskripsi                     |
| `src/lib/admin/datetime.ts`                 | Tambah   | Formatter `id-ID`/`Asia/Jakarta`                                 |
| `src/components/admin/recent-comments.tsx`  | Tambah   | Widget tiga komentar terbaru                                     |
| `src/app/admin/features/page.tsx`           | Tambah   | Halaman admin Kelola Fitur dengan guard                          |
| `src/components/admin/features-manager.tsx` | Tambah   | CRUD fitur + upload ikon + toast/konfirmasi                      |
| `src/lib/admin-features-client.ts`          | Tambah   | Tipe `AdminFeature` + parser respons                             |
| `src/app/admin/layout.tsx`                  | Ubah     | Tautan nav “Fitur”                                               |
| `src/lib/api/comments.ts`                   | Ubah     | Tambah `listAdminComments()` tanpa limit dan tanpa menelan error |
| `src/app/api/comments/route.ts`             | Ubah     | Cabang `?scope=admin` dengan guard dan `{ comments, total }`     |
| `src/lib/admin-comments-client.ts`          | Ubah     | Parsing `total`, normalisasi tetap                               |
| `src/components/admin/comments-manager.tsx` | Ubah     | Fetch scope admin, tampilkan total, waktu lokal, anchor item     |
| `src/app/admin/comments/page.tsx`           | Ubah     | Guard + `force-dynamic`                                          |
| `src/app/admin/news/page.tsx`               | Ubah     | Guard + `force-dynamic`                                          |
| `src/app/admin/hero/page.tsx`               | Ubah     | Guard + `force-dynamic`                                          |
| `src/app/admin/how-to-play/page.tsx`        | Ubah     | Guard + `force-dynamic`                                          |
| `src/app/admin/landing-cards/page.tsx`      | Ubah     | Guard + `force-dynamic`                                          |
| `src/lib/admin/dashboard.test.mjs`          | Ubah     | Assertion metrik komentar                                        |
| `src/lib/admin/dashboard-metrics.test.mjs`  | Tambah   | Unit test konfigurasi metrik                                     |
| `src/lib/admin/datetime.test.mjs`           | Tambah   | Unit test formatter waktu                                        |
| `src/lib/admin-comments-client.test.mjs`    | Ubah     | Unit test `total` dan fallback                                   |
| `src/lib/admin-features-client.test.mjs`    | Tambah   | Unit test parser fitur                                           |
| `src/app/admin/dashboard-layout.test.mjs`   | Ubah     | Assertion struktur link dan tidak ada ISO mentah                 |
| `scripts/test-admin-content.mjs`            | Ubah     | Skenario dasbor, total komentar, dan CRUD fitur                  |

Tidak ada perubahan pada `src/db/schema.ts`, folder `drizzle/`, atau kontrak API publik.

## 6. Skenario Uji

| #   | Skenario                                          | Hasil yang Diharapkan                                                                |
| --- | ------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1   | Buka `/admin` sebagai admin                       | Enam kartu metrik tampil dengan angka dan deskripsi sumber data                      |
| 2   | Klik kartu Komentar                               | Berpindah ke `/admin/comments`                                                       |
| 3   | Klik kartu Fitur                                  | Berpindah ke `/admin/features`                                                       |
| 4   | Kartu Berita/Galeri/FAQ/Wishlist                  | Masing-masing menuju halaman modul yang benar                                        |
| 5   | Dasbor menampilkan komentar                       | Angka kartu Komentar sama dengan `Total N komentar.` di halaman komentar             |
| 6   | Dasbor tanpa komentar                             | Kartu Komentar `0`; halaman komentar menampilkan `Total 0 komentar.` dan empty state |
| 7   | `GET /api/comments?scope=admin` tanpa sesi        | 401                                                                                  |
| 8   | `GET /api/comments?scope=admin` sebagai non-admin | 403                                                                                  |
| 9   | `GET /api/comments?scope=admin` sebagai admin     | 200; `{ comments, total }`; semua komentar terbaru dulu                              |
| 10  | Database error pada daftar komentar admin         | Amplop error 500; UI menampilkan pesan, bukan “Belum ada komentar.”                  |
| 11  | Komentar tanpa nama/foto                          | Nama “Anonim” dan avatar inisial tampil                                              |
| 12  | Hapus komentar                                    | 200; toast “Komentar dihapus”; total berkurang                                       |
| 13  | Widget Komentar Terbaru                           | Maksimal tiga item; tautan menuju anchor komentar yang benar                         |
| 14  | Waktu di dasbor dan daftar komentar               | Format `id-ID` dengan “WIB”; tidak ada ISO mentah                                    |
| 15  | `/admin/features` create/edit/delete              | Data berubah dan daftar diperbarui tanpa error                                       |
| 16  | Validasi fitur (judul kosong)                     | Pesan inline “Judul fitur wajib diisi.”                                              |
| 17  | Buka `/admin/comments` tanpa sesi                 | Dialihkan ke `/admin/login`                                                          |
| 18  | `GET /api/comments` publik                        | Tetap `{ comments }`, maksimal 100, tanpa `total`; landing tidak berubah             |
| 19  | Responsivitas 360/768/1280 px                     | Tidak ada gulir horizontal; kartu dan widget tetap terbaca                           |
| 20  | Navigasi keyboard                                 | Semua kartu dan tombol dapat difokuskan; cincin fokus terlihat                       |

## 7. Risiko dan Catatan

- **Issue #2 jangan diregresikan.** Perbaikan `d05ae06` pada `CommentsManager` (field datar, avatar fallback, hapus aman) harus tetap utuh. Perubahan E16-3 hanya menambah scope admin, total, dan format waktu.
- **API publik stabil.** `GET /api/comments` tetap dipakai landing page dan tidak boleh berubah bentuk. `?scope=admin` adalah jalur terpisah yang dijaga.
- **Daftar komentar admin tanpa limit.** Saat ini volume komentar kecil. Bila melewati ±500 baris, tambahkan paginasi eksplisit dan tampilkan “Menampilkan X dari Y” agar performa tetap wajar. Jangan menambahkan limit diam-diam karena akan mengembalikan masalah ketidakselarasan angka.
- **Snapshot count.** `total` dihitung dari baris yang dikembalikan pada kueri yang sama, sehingga angka dasbor dan daftar admin konsisten. Jika ada komentar baru di antara dua permintaan halaman, selisih satu adalah hal normal; keterangan “dihitung saat halaman dimuat” menjelaskannya.
- **Halaman Fitur adalah celah lama.** E8-4 ditandai Done, tetapi UI Fitur tidak pernah dibangun. E16-1 menutup celah ini tanpa mengubah status historis E8-4. Jika prioritas berubah, kartu Fitur tidak boleh ditautkan ke route yang belum ada.
- **Guard page-level bersifat defense-in-depth.** `src/proxy.ts` sudah menjadi lapisan utama. E16-5 hanya menyamakan konvensi; jangan menghapus atau melemahkan proxy.
- **Zona waktu.** Formatter memakai `Asia/Jakarta` eksplisit agar hasil sama di server, browser, dan Cloudflare Workers. Jangan memakai zona waktu default perangkat.
- **Intl di Workers.** `Intl.DateTimeFormat` dengan locale `id-ID` tersedia di runtime Workers; tetap jalankan `pnpm preview` untuk memverifikasi hasil build OpenNext.
- **Tanpa migrasi.** Tidak ada perubahan skema/tabel. Jangan membuat migrasi untuk task ini.
- **Dokumen requirement tidak berubah.** FR-ADM-07/12/31 sudah mencakup pekerjaan ini; `docs/PRD.md` dan `docs/SRS.md` tidak perlu diubah. Jika implementasi menemukan kebutuhan baru, sinkronkan dokumen tersebut lebih dulu sesuai `AGENTS.md`.
- **Playwright membutuhkan environment.** Server preview, DB Neon, dan kredensial admin (`E2_TEST_ADMIN_EMAIL`/`E2_TEST_ADMIN_PASSWORD`) harus tersedia. Jika tidak, jalankan unit test + verifikasi manual dan catat blocker; jangan menandai Done tanpa bukti.

## 8. Checklist Selesai

- [x] E16-1..E16-6 terdaftar di `docs/TASK_BREAKDOWN.md` dan ditandai `In Progress` sebelum coding.
- [x] `/admin/features` tersedia dengan guard, CRUD, upload ikon, dan tautan nav.
- [x] Enam kartu metrik menjadi tautan yang dapat diklik dan memiliki deskripsi sumber data.
- [x] Waktu pembaruan dan waktu komentar memakai format `id-ID`/`Asia/Jakarta` (WIB), bukan ISO mentah.
- [x] `GET /api/comments?scope=admin` dijaga, mengembalikan `{ comments, total }`, dan tidak menelan error.
- [x] `/admin/comments` menampilkan total yang sama dengan kartu Komentar dan empty state yang benar.
- [x] Widget “Komentar Terbaru” menampilkan maksimal tiga komentar dan tautan yang berfungsi.
- [x] Lima halaman admin yang tersisa memakai guard page-level + `force-dynamic`.
- [x] Unit test baru lulus; total test tidak menurun.
- [x] Playwright dasbor/komentar/fitur lulus tanpa `pageerror`.
- [x] `tsc --noEmit`, `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm preview` lulus.
- [x] Verifikasi manual responsif, keyboard, kontras, dan alur hapus komentar lulus.
- [x] `TASK_BREAKDOWN.md` §1/§2/§4/§E16 diperbarui; plan diarsipkan setelah semua task `Done`.
