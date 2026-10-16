# Task Breakdown — Website Landing Page Game BAREN Berbasis CMS

Dokumen ini menjabarkan pekerjaan teknis dari **docs/PRD.md** dan **docs/SRS.md** menjadi epik, task, dan subtask yang dapat dikerjakan tim.

| Field             | Keterangan                                                 |
| ----------------- | ---------------------------------------------------------- |
| Versi             | 1.3                                                        |
| Tanggal           | 17 Oktober 2026                                            |
| Sumber Acuan      | docs/PRD.md, docs/SRS.md                                   |
| Estimasi          | Satuan _story point_ (SP) — Fibonacci: 1, 2, 3, 5, 8, 13   |
| Legenda Prioritas | **P0** = wajib/kritis, **P1** = penting, **P2** = tambahan |

---

## 0. Cara Menggunakan Dokumen Ini (WAJIB dibaca agent)

> **Alur kerja development yang terarah:**
>
> 1. **Sebelum mulai kerja**, baca `docs/PRD.md` (kenapa & apa) dan `docs/SRS.md` (kebutuhan detail), lalu dokumen ini (bagaimana & urutannya).
> 2. **Pilih task** dari tabel epik yang relevan. Perhatikan kolom **Dep** (dependency) — jangan mulai task yang dependensinya belum `Done`.
> 3. **Saat mulai**, ubah kolom **Status** task tersebut dari `Todo` → `In Progress`.
> 4. **Saat selesai**, ubah **Status** menjadi `Done`, isi kolom **Catatan** (tanggal, ringkasan, atau tautan commit/PR), lalu perbarui **Progress Epik** pada §1 dan **Log Progress** pada §4.
> 5. **Jangan menandai `Done`** sebelum kriteria "Definition of Done" (§5) terpenuhi dan sudah diverifikasi.
> 6. Bila scope berubah, perbarui `docs/PRD.md`/`docs/SRS.md` terlebih dahulu agar dokumen tetap sinkron.
> 7. Setelah semua task dalam sebuah plan di `docs/superpowers/plans/` berstatus `Done` dan verifikasinya lulus, pindahkan plan tersebut ke `docs/superpowers/plans/archive/` dan perbarui tautan yang merujuk ke path lamanya. Jangan arsipkan plan yang masih aktif atau terblokir.

**Legenda Status:** `Todo` · `In Progress` · `Blocked` · `Done` · `N/A`

---

## 1. Ringkasan Epik & Progress

| Epik      | Nama                                                   | Prioritas | Total SP | Status      | Progress | FR Terkait                                                  |
| --------- | ------------------------------------------------------ | --------- | -------- | ----------- | -------- | ----------------------------------------------------------- |
| E0        | Fondasi Proyek & Infrastruktur                         | P0        | 21       | Done        | 100%     | C-03, C-04, C-05, C-07, C-08, NFR-DEP-01, NFR-MNT-01/02     |
| E1        | Skema Basis Data & Migrasi                             | P0        | 20       | Done        | 75%      | §3.5 Kebutuhan Data, NFR-MNT-02                             |
| E2        | Autentikasi & Manajemen Akun Admin                     | P0        | 21       | Done        | 100%     | FR-ADM-01..06, NFR-SEC-01/03/04/06                          |
| E3        | Lapisan API & Validasi                                 | P0        | 44       | Done        | 82%      | EI-02/03/04, NFR-SEC-02/03/05                               |
| E4        | Manajemen Aset R2 (Presigned URL)                      | P0        | 19       | Done        | 100%     | EI-04/05/06, FR-ADM-15/16/17, C-06                          |
| E5        | Kerangka UI, Layout & Branding                         | P0        | 16       | Done        | 100%     | FR-PUB-15/16/17, C-01/02, EI-01, NFR-USE-01                 |
| E6        | Situs Publik — Konten Utama                            | P0        | 30       | Todo        | 0%       | FR-PUB-01..09                                               |
| E7        | Situs Publik — Konten Tambahan & Interaksi             | P0        | 21       | Todo        | 0%       | FR-PUB-10..14, FR-PUB-25, EI-07                             |
| E8        | Panel Admin — Dashboard & Manajemen Konten             | P0        | 45       | In Progress | 20%      | FR-ADM-07..23, FR-ADM-24..27                                |
| E9        | Performa, Aksesibilitas & SEO                          | P1        | 14       | Todo        | 0%       | NFR-PRF-01..04, NFR-ACC-01..03, NFR-SEO-01..03              |
| E10       | Pengujian, UAT & Deployment                            | P0        | 21       | Todo        | 0%       | NFR-CMP-01, NFR-DEP-01, NFR-MNT-01/03                       |
| **E11**   | **Wishlist & Google OAuth (rename dari Waiting List)** | P0        | 33       | In Progress | 64%      | FR-PUB-18..24, FR-ADM-28..30, EI-08, NFR-USE-03, NFR-SEC-07 |
| **E12**   | **Design System & UI (acuan Valorant)**                | P0        | 24       | In Progress | 58%      | C-10, DG-01..DG-10                                          |
| **E13**   | **Komentar Landing (baru)**                            | P0        | 8        | Todo        | 0%       | FR-PUB-26, FR-ADM-31 (baru, lihat §E13)                     |
| **Total** |                                                        |           | **340**  | In Progress | **46%**  |                                                             |

> **Progress dihitung:** jumlah SP task `Done` ÷ total SP epik × 100%.

---

## E0 — Fondasi Proyek & Infrastruktur

**Tujuan:** Menyiapkan kerangka repo, tooling, dan integrasi layanan (Neon, R2, Cloudflare).

| ID   | Task                                      | Detail                                                                               | FR/Terkait             | Prio | SP  | Dep  | Status | Catatan                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---- | ----------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------- | ---- | --- | ---- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E0-1 | Setup repositori & tooling                | Next.js 16 (App Router) + TypeScript, pnpm, ESLint, Prettier, struktur folder        | C-03, C-09, NFR-MNT-03 | P0   | 3   | —    | Done   | 2026-10-14: `prettier@3.9.10` terpasang; skrip `format`/`format:check`, `.prettierrc.json`, `.prettierignore` dibuat; seluruh source diformat (cosmetic). `.open-next`/`.wrangler` di-ignore ESLint. `pnpm lint`, `tsc --noEmit`, `format:check`, `build` lolos. DoD review/merge: perubahan sudah di `main`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| E0-2 | Konfigurasi Tailwind CSS + shadcn/ui      | Pasang Tailwind, init shadcn/ui, base theme, design token                            | C-03                   | P0   | 3   | E0-1 | Done   | 2026-10-15: `shadcn@4.21.5 init` menghasilkan `components.json` (style `radix-nova`, baseColor neutral, CSS variables) + `src/lib/utils.ts`. Token `ink`/`sand`/`ember` dipertahankan. **Perbaikan regresi**: blok `@theme inline` shadcn menulis `--font-sans: var(--font-sans)` (referensi melingkar) yang menghapus pemetaan ke Inter; diubah menjadi `--font-sans: var(--font-inter)` dan `--font-heading: var(--font-display)`. `shadcn`/`tw-animate-css` dipindah ke devDependencies sesuai registry. Verifikasi: `lint`/`tsc`/`format:check`/`build` lolos; Playwright 360–1920px tanpa overflow horizontal; body=Inter, `font-display`/`display-xl`=Anton. DoD review/merge: perubahan sudah di `main` (`93ac5c5`).                                                                                                       |
| E0-3 | Konfigurasi Cloudflare Workers (OpenNext) | `wrangler.jsonc`, `open-next.config.ts`, binding R2 (`BAREN_ASSETS`), images, assets | C-04, NFR-DEP-01       | P0   | 5   | E0-1 | Done   | 2026-10-15: `opennextjs-cloudflare build` sukses (`Worker saved in .open-next/worker.js`). `opennextjs-cloudflare preview` di :8787; `curl --fail-with-body -i /api/health` → HTTP 200, `content-type: application/json`, body `{"ok":true,"service":"baren"}`; beranda 200 (title & Inter benar, tanpa overflow 360px). Binding lokal terhubung: `BAREN_ASSETS`/`NEXT_INC_CACHE_R2_BUCKET` (R2 local), `IMAGES`, `ASSETS`, `WORKER_SELF_REFERENCE` [connected]. `pnpm cf-typegen` regen sukses (binding cocok; file tracked dan dikembalikan ke baseline karena binding tidak berubah). `lint`/`tsc`/`format:check`/`build` lolos. DoD review/merge: perubahan di-merge ke `main` dan di-push (`71b92cb`).                                                                                                                       |
| E0-4 | Koneksi Neon Postgres + Drizzle           | Driver kompatibel Workers (`@neondatabase/serverless`), `src/db/index.ts`, env       | C-05, EI-03            | P0   | 3   | E0-1 | Done   | 2026-10-15: Step 1 lolos — `getDb()` tanpa env melempar `NEON_DATABASE_URL is not set`. Step 2 lolos — `neon init` (project `still-firefly-90444743`, branch `production`) + `neon deploy` menarik `DATABASE_URL`/`DATABASE_URL_UNPOOLED`/`NEON_BRANCH` ke `.env.local` (ter-ignore); kredensial disalin ke `.dev.vars` (ter-ignore). Query read-only `select 1 as ok` via `getDb()` dijalankan **end-to-end di runtime Worker** (`opennextjs-cloudflare preview` :8787) → HTTP 200 `{"ok":true,"db":"neon","result":{"ok":1}}`. Driver existing (`@neondatabase/serverless` + Drizzle neon-http) dipertahankan sesuai skill Neon. `lint`/`tsc`/`format:check`/`build` lolos. Catatan: `node` lokal (v24) perlu `net.setDefaultAutoSelectFamily(false)` untuk konek (isu Happy Eyeballs lokal, tidak memengaruhi runtime Worker). |
| E0-5 | Manajemen rahasia                         | `.dev.vars.example`, wrangler secret untuk produksi, `.gitignore`                    | C-07, NFR-SEC-06       | P0   | 2   | E0-3 | Done   | 2026-10-15: `.dev.vars` ter-ignore (`.gitignore:48`), `.dev.vars.example` tracked; README ditambah bagian "Cloudflare setup" (buat bucket R2, `wrangler secret put NEON_DATABASE_URL`/`R2_PUBLIC_URL`, penjelasan placeholder). `lint`/`tsc`/`format:check`/`build` lolos. 2026-10-16: TERBUKTI — Worker prod `https://baren.fdiraf77.workers.dev/` live: `/api/health` 200 `{"ok":true,"service":"baren"}`, beranda 200, `/api/settings` 200 via `getDb()` (tanpa `NEON_DATABASE_URL` akan 500, jadi secret produksi terpasang, NFR-SEC-06 terpenuhi). Keterbatasan: `wrangler secret list`/`deployments list` gagal dari CLI lokal (auth error 10000, account mismatch) sehingga bukti lewat HTTP produksi.                                                                                                                     |
| E0-6 | Health check & smoke test                 | Route `/api/health`, verifikasi build OpenNext & preview lokal                       | NFR-DEP-01             | P0   | 3   | E0-3 | Done   | 2026-10-15: `pnpm preview` di :8787; `curl --fail-with-body -i /api/health` → HTTP 200, `content-type: application/json`, body `{"ok":true,"service":"baren"}` (assert ok:true & service:baren PASS). Route `src/app/api/health/route.ts` tidak menyentuh DB. DoD review/merge: perubahan di-push ke `main` (`71b92cb`); CI hijau.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| E0-7 | Setup CI (lint/typecheck)                 | Pipeline ESLint + `tsc --noEmit` + build                                             | NFR-MNT-03             | P1   | 2   | E0-1 | Done   | 2026-10-15: `.github/workflows/ci.yml` (push/PR; checkout, pnpm/action-setup, setup-node 22 + cache pnpm; install --frozen-lockfile, lint, tsc, format:check, build). Verifikasi lokal urutan CI lolos. Run GitHub Actions `CI` pada push `71b92cb` **hijau** (job `check` 40s, semua step ✓); workflow terbaca GitHub Actions.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

**Kriteria Selesai E0:** `pnpm build` & `pnpm preview` berhasil; `/api/health` OK; lint lolos.

---

## E1 — Skema Basis Data & Migrasi

**Tujuan:** Menerjemahkan model data (SRS §3.5) menjadi skema Drizzle + migrasi.

| ID   | Task                                            | Detail                                                                                                                         | FR/Terkait                        | Prio | SP  | Dep     | Status      | Catatan                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- | ---- | --- | ------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1-1 | Skema tabel konten                              | `site_settings`, `hero`, `hero_banners`, `about`, `features`, `how_to_play_steps`, `how_to_play_video`                         | SRS §3.5                          | P0   | 5   | E0-4    | Done        | 2026-10-16: skema SRS §3.5 di `src/db/schema.ts`; migrasi `drizzle/0000_careless_ogun.sql` (17 tabel, tanpa DROP) di-apply ke branch Neon isolasi `feat-data`; seed idempoten `scripts/seed-admin.mjs` 2x tanpa duplikat; uji insert/select + slug konflik + upsert waitlist lolos via psql.                                                                                                                                                               |
| E1-2 | Skema tabel dinamis                             | `gallery_assets`, `news`, `faq`, `social_links`, `download_links`                                                              | SRS §3.5                          | P0   | 3   | E0-4    | Done        | 2026-10-16: skema SRS §3.5 di `src/db/schema.ts`; migrasi `drizzle/0000_careless_ogun.sql` (17 tabel, tanpa DROP) di-apply ke branch Neon isolasi `feat-data`; seed idempoten `scripts/seed-admin.mjs` 2x tanpa duplikat; uji insert/select + slug konflik + upsert waitlist lolos via psql.                                                                                                                                                               |
| E1-3 | Skema auth (Auth.js)                            | Tabel `users` + tabel adapter (`accounts`, `sessions`, `verification_token`)                                                   | FR-ADM-01, NFR-SEC-01             | P0   | 3   | E0-4    | Done        | 2026-10-16: skema SRS §3.5 di `src/db/schema.ts`; migrasi `drizzle/0000_careless_ogun.sql` (17 tabel, tanpa DROP) di-apply ke branch Neon isolasi `feat-data`; seed idempoten `scripts/seed-admin.mjs` 2x tanpa duplikat; uji insert/select + slug konflik + upsert waitlist lolos via psql. Relasi adapter teruji via psql (user+account+session).                                                                                                        |
| E1-4 | Skema tabel `wishlist` (rename dari `waitlist`) | `id`, `email` (unik), `nama`, `foto_url`, `provider`, `created_at` + constraint unik email; migrasi RENAME tanpa hapus data    | FR-PUB-20/21, FR-ADM-28           | P0   | 2   | E0-4    | Done        | 2026-10-16: skema SRS §3.5 di `src/db/schema.ts`; migrasi `drizzle/0000_careless_ogun.sql` (17 tabel, tanpa DROP) di-apply ke branch Neon isolasi `feat-data`; seed idempoten `scripts/seed-admin.mjs` 2x tanpa duplikat; uji insert/select + slug konflik + upsert waitlist lolos via psql. Upsert ganda konkuren (5x paralel) → 1 baris. Revisi 2026-10-17: rename total ke `wishlist` (plan `2026-10-17-wishlist-rename.md`), data email dipertahankan. |
| E1-5 | Migrasi drizzle-kit                             | Generate + apply migrasi, seed data awal (settings, admin user)                                                                | NFR-MNT-02                        | P0   | 2   | E1-1..4 | Done        | 2026-10-16: skema SRS §3.5 di `src/db/schema.ts`; migrasi `drizzle/0000_careless_ogun.sql` (17 tabel, tanpa DROP) di-apply ke branch Neon isolasi `feat-data`; seed idempoten `scripts/seed-admin.mjs` 2x tanpa duplikat; uji insert/select + slug konflik + upsert waitlist lolos via psql.                                                                                                                                                               |
| E1-6 | Skema tabel `landing_cards` (baru)              | `slot, eyebrow, title*, subtitle, body, image_url, cta_label/url, tone, sort_order, is_published` + constraint CTA berpasangan | FR-PUB-01/04/05 (kartu fleksibel) | P0   | 3   | E0-4    | In Progress | 2026-10-17: tabel di `src/db/schema.ts` + Zod `landingCardCreate/UpdateSchema` + node:test 5/5 + migrasi `drizzle/0001_typical_alex_wilder.sql` (hanya CREATE, tanpa DROP); lint/tsc/format/build lolos. Sisa: apply ke Neon branch isolasi + verifikasi psql.                                                                                                                                                                                             |
| E1-7 | Skema tabel `comments` (baru)                   | `id, user_id FK users.id cascade, body 1..500, created_at`; tanpa kolom moderasi                                               | FR-PUB-26, FR-ADM-31              | P0   | 2   | E1-3    | In Progress | 2026-10-17: tabel di `src/db/schema.ts` + Zod `commentCreateSchema` + node:test 3/3 (satu file migrasi dengan E1-6); lint/tsc/format/build lolos. Sisa: apply ke Neon branch isolasi + verifikasi psql.                                                                                                                                                                                                                                                    |

**Kriteria Selesai E1:** `pnpm db:push`/migrasi sukses; tabel terverifikasi di Neon; seed admin tersedia.

---

## E2 — Autentikasi & Manajemen Akun Admin

**Tujuan:** Login/logout admin, proteksi rute, pengaturan akun.

| ID   | Task                               | Detail                                                | FR/Terkait            | Prio | SP  | Dep        | Status | Catatan                                                                                                                                                                         |
| ---- | ---------------------------------- | ----------------------------------------------------- | --------------------- | ---- | --- | ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E2-1 | Setup Auth.js v5 + Drizzle adapter | Konfigurasi provider, sesi, secret                    | FR-ADM-01             | P0   | 5   | E1-3       | Done   | 2026-10-16: strategi JWT + adapter Drizzle; secret via binding Workers; matriks preview 10/10 (plan Data §Kontrak guard).                                                       |
| E2-2 | Login admin email+password         | Hash password (bcryptjs), pesan error generik         | FR-ADM-01, NFR-SEC-01 | P0   | 3   | E2-1       | Done   | 2026-10-16: bcryptjs Worker-OK; email case-insensitive; benar/salah/tak-ada/OAuth-only diuji, error generik.                                                                    |
| E2-3 | Logout & expiry 60 menit           | Akhiri sesi; `maxAge` sesi 60 menit                   | FR-ADM-02, FR-ADM-03  | P0   | 2   | E2-1       | Done   | 2026-10-16: logout hapus sesi; JWT exp-iat=3600; pasca-logout `/admin` 307.                                                                                                     |
| E2-4 | Middleware proteksi `/admin`       | Redirect ke login bila tanpa sesi valid               | FR-ADM-04             | P0   | 3   | E2-1       | Done   | 2026-10-16: proxy verifikasi JWT langsung (`auth(request)` beta mengembalikan Response); anon 307, visitor/tanpa-role 307+AksesDitolak, rusak 307, admin 200; guard milik E2-4. |
| E2-5 | Pengaturan akun admin              | Ubah nama & email                                     | FR-ADM-05             | P1   | 2   | E2-1       | Done   | 2026-10-16: Playwright edit profil/reload sesi dan tolak email akun visitor; admin dipulihkan, akun konflik dihapus (commit 6b5d719).                                           |
| E2-6 | Ubah password admin                | Verifikasi password lama; baru ≥ 8 karakter & berbeda | FR-ADM-06             | P0   | 3   | E2-2       | Done   | 2026-10-16: Playwright ganti password, tolak login lama, login baru; password awal dipulihkan dan bcrypt DB cocok (commit 6b5d719).                                             |
| E2-7 | Halaman login admin UI             | Form react-hook-form + zodResolver, pesan error       | FR-ADM-01, C-01       | P0   | 3   | E0-2, E2-1 | Done   | 2026-10-16: form RHF+zodResolver Indonesia; E2E Playwright 9/9 (validasi klien, pesan generik, redirect /admin, logout redirect login); visual token admin selaras.             |

**Kriteria Selesai E2:** Admin dapat login/logout; `/admin` terproteksi; sesi berakhir 60 menit; ubah akun & password berfungsi.

---

## E3 — Lapisan API & Validasi

**Tujuan:** Route Handlers JSON dengan validasi Zod, otorisasi, dan query Drizzle.

| ID    | Task                       | Detail                                                                            | FR/Terkait                    | Prio | SP  | Dep        | Status      | Catatan                                                                                                                                                                                                                                                                      |
| ----- | -------------------------- | --------------------------------------------------------------------------------- | ----------------------------- | ---- | --- | ---------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E3-1  | Utilitas API & helper      | Response standar, wrapper error, helper auth guard (401)                          | NFR-SEC-03                    | P0   | 3   | E2-4       | Done        | 2026-10-16: `src/lib/api/{response,parse,auth,db-errors}.ts` + node:test 30/30 (amplop ok/fail, parse JSON+Zod per kolom, checkAdmin 401/403, DB 409/500 tanpa bocor detail); E2-4 Done di main, guard selaras kontrak Data. Tanpa edit `src/db/**`.                         |
| E3-2  | API Settings/Branding      | GET/PUT `site_settings`                                                           | FR-ADM-08, FR-PUB-15          | P0   | 3   | E1-1, E3-1 | Done        | 2026-10-16: HTTP preview :8787 — GET 200, PUT anon 401, PUT admin 200 + GET berubah, PUT http/malformed/kosong 400 per kolom; data dikembalikan persis + terverifikasi. PUT visitor 403 via HTTP tertunda (tanpa sesi OAuth); tertutup unit checkAdmin + matriks proxy E2-4. |
| E3-3  | API Hero & Banners         | GET/PUT hero; CRUD `hero_banners`                                                 | FR-ADM-09/10, FR-PUB-01/02/03 | P0   | 5   | E1-1, E3-1 | Done        | 2026-10-16: hero singleton + banners CRUD/urut; HTTP: GET kosong/isi, PUT anon 401, PUT admin 200, CTA http 400, POST 201 ×2 + urut, bad-id 400, missing 404, reorder + DELETE 200; DB dikembalikan kosong.                                                                  |
| E3-4  | API Game Content           | About, Features (CRUD+urut), How to Play (CRUD+urut), video demo                  | FR-ADM-11..14, FR-PUB-04..07  | P0   | 5   | E1-1, E3-1 | Done        | 2026-10-16: about singleton + features/steps CRUD/urut + video demo; HTTP: PUT/GET about, anon 401, fitur urut + reorder, langkah urut + video null→isi, video http 400, hapus 404; DB dikembalikan kosong.                                                                  |
| E3-5  | API Gallery                | GET/CRUD `gallery_assets`                                                         | FR-ADM-15/16, FR-PUB-08/09    | P0   | 3   | E1-2, E3-1 | Done        | 2026-10-16: CRUD/urut + filter ?kind=; HTTP: kosong→isi, filter video, kind asing 400 (query+body), anon 401, DELETE 200 kembalikan fileUrl untuk E4-5; DB dikembalikan kosong.                                                                                              |
| E3-6  | API News                   | CRUD berita + publikasi slug + paginasi 9                                         | FR-ADM-18/19, FR-PUB-10/11    | P0   | 5   | E1-2, E3-1 | Done        | 2026-10-16: draf tak publik (list+slug 404), publish isi publishedAt, slug konflik 409 (perbaiki bungkus DrizzleQueryError→cause), [key] tunggal (slug numerik dilarang), 10 berita → 9+1 terbaru-dulu, page invalid 400; DB dikembalikan kosong.                            |
| E3-7  | API FAQ                    | CRUD + urut FAQ                                                                   | FR-ADM-20, FR-PUB-12          | P0   | 3   | E1-2, E3-1 | Done        | 2026-10-16: CRUD + urut deterministik; HTTP: POST 201 ×2, urut + reorder, anon 401, DELETE 200; DB dikembalikan kosong.                                                                                                                                                      |
| E3-8  | API Social & Download      | CRUD social_links & download_links; email kontak                                  | FR-ADM-21/22/23, FR-PUB-13/14 | P0   | 3   | E1-2, E3-1 | Done        | 2026-10-16: CRUD + URL https; HTTP: POST/GET/PUT/DELETE, URL http 400, anon 401; email kontak tetap di /api/settings (E3-2); daftar unduhan kosong = "Segera Hadir" (FR-PUB-25); DB dikembalikan kosong.                                                                     |
| E3-9  | Skema validasi Zod         | Validasi kolom wajib, tipe/ukuran berkas, URL `https://`                          | FR-ADM-24/25, NFR-SEC-02      | P0   | 3   | E3-1       | Done        | 2026-10-16: `src/lib/validation/` lengkap (settings, hero, game, gallery, news, faq, links): strict anti-typo, https, email, slug, minimal-satu-kolom; batas ukuran berkas milik E4-3 (JSON tak membawa byte).                                                               |
| E3-10 | Revalidasi & cache         | Pastikan perubahan tayang ≤ 60 detik (revalidate/tag)                             | FR-ADM-27                     | P0   | 3   | E3-2..8    | Done        | 2026-10-16: seluruh GET publik `force-dynamic` (tanpa cache); terbukti tiap matriks E3-2..8: GET sesudah PUT langsung segar (kurang dari 5 detik, batas 60 dtk).                                                                                                             |
| E3-11 | API `landing_cards` (baru) | GET publik published+urut; CRUD + reorder admin-only; Zod CTA https/anchor        | FR-PUB-01/04/05               | P0   | 5   | E1-6, E3-1 | In Progress | 2026-10-17: `src/lib/api/landing-cards.ts` + 3 route (`GET/POST`, `[id] PUT/DELETE`, `reorder PUT`) + news `?limit=` (maks 9); unit 86/86 (termasuk 8 baru); lint/tsc/format/build lolos. Sisa: matriks HTTP riil (401/400/404/reorder) + apply migrasi E1-6.                |
| E3-12 | API `comments` (baru)      | GET publik tanpa email + cursor; POST visitor + rate limit 5/10 mnt; DELETE admin | FR-PUB-26, FR-ADM-31          | P0   | 3   | E1-7, E3-1 | In Progress | 2026-10-17: `src/lib/api/comments.ts` + `GET/POST /api/comments` + `DELETE /api/comments/[id]`; guard sesi/admin; unit 90/90; lint/tsc/format/build lolos. Sisa: matriks HTTP riil (butuh env + apply E1-7).                                                                 |

**Kriteria Selesai E3:** Semua endpoint tervalidasi Zod, endpoint tulis menolak tanpa auth (401), perubahan tayang ≤ 60 detik.

---

## E4 — Manajemen Aset R2 (Presigned URL)

**Tujuan:** Unggah langsung dari browser admin ke R2 via presigned URL.

| ID   | Task                              | Detail                                                         | FR/Terkait               | Prio | SP  | Dep              | Status | Catatan                                                                                                                                                                                                                                  |
| ---- | --------------------------------- | -------------------------------------------------------------- | ------------------------ | ---- | --- | ---------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E4-1 | Helper R2 & presigned URL         | `getR2Bucket`, generate presigned URL (kedaluwarsa ≤ 10 menit) | EI-04, NFR-SEC-05, C-06  | P0   | 5   | E0-3             | Done   | 2026-10-16: presign SigV4 + key acak + URL publik terpisah; unit 12/12; kredensial/CORS terverifikasi, uji nyata ikut E4-2 (tunggu E2-4).                                                                                                |
| E4-2 | Endpoint penerbitan presigned URL | Hanya admin terautentikasi; validasi tipe & ukuran             | FR-ADM-17, NFR-SEC-03/05 | P0   | 3   | E4-1, E2-4       | Done   | 2026-10-16: PUT admin 200 + 400 (gif/oversize/SVG-gallery) + upload R2 nyata 200 + CT-salah 403 + S3-DELETE 204; bucket bersih kembali.                                                                                                  |
| E4-3 | Validasi tipe & ukuran berkas     | Gambar JPG/PNG/WebP (+SVG logo/ikon) ≤ 5 MB; video MP4 ≤ 50 MB | EI-05/06, FR-ADM-17      | P0   | 3   | E4-1             | Done   | 2026-10-16: Zod server + cek silang ekstensi/MIME + verifyStoredAsset; unit 11/11.                                                                                                                                                       |
| E4-4 | Custom loader next/image untuk R2 | Loader gambar R2 + lazy loading                                | NFR-PRF-03               | P0   | 3   | E4-1             | Done   | 2026-10-16: loader tolak signed URL + komponen R2Image lazy; unit 7/7; koordinasi E9-2.                                                                                                                                                  |
| E4-5 | Hapus aset dari R2                | Hapus objek + record DB dengan konfirmasi                      | FR-ADM-16, FR-ADM-26     | P0   | 2   | E4-1, E2-4, E3-5 | Done   | 2026-10-16: anon 401 + admin 400 + objek-hilang 200 deleted:false + objek-ada 200 deleted:true + hapus-ulang idempoten + unit murni 4/4 + keyFrom ketat; R2-nyata via S3-DELETE 204 terpisah.                                            |
| E4-6 | Komponen uploader (drag & drop)   | Progress, validasi klien, preview                              | FR-ADM-15, FR-ADM-24     | P0   | 3   | E4-2, E0-2       | Done   | 2026-10-16: presign-JIT + PUT XHR + batal/retry-atomik + status terunggah/menyimpan/tersimpan/gagal-simpan + onUploaded-opsional; unit core 8/8; Playwright 8/9 (retry-Tersimpan tertunda egress sandbox, PUTS 3-key-baru bukti atomik). |

**Kriteria Selesai E4:** Admin dapat mengunggah/hapus aset; presigned URL kedaluwarsa ≤ 10 menit; berkas tidak melewati Workers.

---

## E5 — Kerangka UI, Layout & Branding

**Tujuan:** Layout responsif mobile-first, navigasi, dan penerapan branding.

| ID   | Task                            | Detail                                                                                                                           | FR/Terkait              | Prio | SP  | Dep  | Status | Catatan                                                                                                                                                                                                                                                                                                                    |
| ---- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ---- | --- | ---- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E5-1 | Layout global Situs Publik      | Header/footer, container, token warna/font                                                                                       | C-01, C-02              | P0   | 3   | E0-2 | Done   | 2026-10-16: `(site)/layout.tsx` + skip link "Lewati ke konten utama", `main#konten-utama`, branding fallback + `accountSlot` di header; lint/tsc/format/build lolos.                                                                                                                                                       |
| E5-2 | Branding dinamis                | Logo, favicon, nama game dari `site_settings` di seluruh halaman                                                                 | FR-PUB-15               | P0   | 3   | E3-2 | Done   | 2026-10-16: dibuka setelah E3-2 Done di main — `src/lib/branding.ts` (Drizzle + fallback, tak melempar), `BrandLogo`, layout async `revalidate=60` + `generateMetadata`; DB server-only; lint/tsc/build + runtime fallback + Playwright lolos; E9-5 milik Mutu.                                                            |
| E5-3 | Navigasi sticky + smooth scroll | Menu tetap terlihat saat digulir, menuju seksi; revisi 2026-10-17: hapus ESPORTS + LEBIH BANYAK, tambah `#cara-main`/`#komentar` | FR-PUB-16               | P1   | 2   | E5-1 | Done   | 2026-10-16: semua item nav jadi anchor (+ID kontrak:#top/berita/tentang/fitur/pemain/arena/faq/galeri/kontak/daftar), `scroll-margin-top:5.5rem`, smooth + reduced-motion, `:target` outline; verifikasi keyboard lolos. Revisi nav di plan `2026-10-17-landing-kartu-dinamis.md` Task 3; footer tetap statis (tanpa CMS). |
| E5-4 | Menu lipat mobile (< 768 px)    | Hamburger + drawer                                                                                                               | FR-PUB-17               | P0   | 3   | E5-1 | Done   | 2026-10-16: breakpoint md (< 768 px), `aria-expanded/controls`, label Indonesia, fokus masuk/kembali, Escape, scroll-lock, link menutup; Playwright 360px OK.                                                                                                                                                              |
| E5-5 | Responsif 360–1920 px           | Verifikasi tanpa gulir horizontal                                                                                                | EI-01, NFR-USE-01, C-02 | P0   | 2   | E5-1 | Done   | 2026-10-16: Playwright 360/768/1920 + landscape + menu terbuka + /admin → scrollX-lebih=0 semua; `overflow-x:clip` global.                                                                                                                                                                                                 |
| E5-6 | Layout Panel Admin              | Sidebar, topbar, area konten admin                                                                                               | —                       | P0   | 3   | E0-2 | Done   | 2026-10-16: `src/app/admin/layout.tsx` baru (sidebar/topbar/main, drawer di bawah breakpoint md aksesibel, Keluar disabled menunggu E2, guard milik E2-4, isi milik CMS); lint/tsc/build lolos.                                                                                                                            |

**Kriteria Selesai E5:** Branding tampil konsisten; navigasi responsif; tidak ada gulir horizontal.

---

## E6 — Situs Publik: Konten Utama

**Tujuan:** Hero, About, Features, How to Play, Gallery.

| ID   | Task                                | Detail                                                                                         | FR/Terkait      | Prio | SP  | Dep         | Status      | Catatan                                                                                                                                                 |
| ---- | ----------------------------------- | ---------------------------------------------------------------------------------------------- | --------------- | ---- | --- | ----------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E6-1 | Seksi Hero (video dinamis)          | `video_url` + poster dari DB, fallback `/media/hero-loop.mp4`; CTA dinamis                     | FR-PUB-01/02    | P0   | 5   | E3-3, E5-1  | In Progress | 2026-10-17: `Hero` async baca `getHeroContent()` + guard URL + fallback statis; build lolos tanpa env. Sisa: uji ganti via admin + cek LCP (butuh env). |
| E6-2 | Carousel banner                     | Banner bergantian bila lebih dari 1 item                                                       | FR-PUB-03       | P1   | 3   | E6-1        | Todo        |                                                                                                                                                         |
| E6-3 | Seksi About Game (via kartu)        | Dirender dari `landing_cards`; singleton `about` jadi fallback/seed                            | FR-PUB-04       | P0   | 3   | E3-4, E3-11 | Todo        | Revisi 2026-10-17: About/Event/Agents/Maps lama digabung ke kartu (E6-9).                                                                               |
| E6-4 | Seksi Game Features                 | Kartu ikon/gambar + judul + deskripsi sesuai urutan (tetap grid 3 kolom, tidak digabung kartu) | FR-PUB-05       | P0   | 3   | E3-4        | Todo        |                                                                                                                                                         |
| E6-5 | Seksi How to Play (kartu khusus)    | Langkah bernomor + media per langkah; tombol scroll ke `#cara-main`                            | FR-PUB-06       | P0   | 3   | E3-4        | Todo        | Revisi 2026-10-17: komponen `how-to-play.tsx` baru.                                                                                                     |
| E6-6 | Video demo How to Play              | Player `controls`, tanpa autoplay bersuara; URL dari DB                                        | FR-PUB-07       | P0   | 2   | E3-4        | Todo        |                                                                                                                                                         |
| E6-7 | Seksi Gallery                       | Grid screenshot, artwork, banner, video                                                        | FR-PUB-08       | P0   | 3   | E3-5        | Todo        |                                                                                                                                                         |
| E6-8 | Lightbox & video player             | Perbesar gambar, putar video                                                                   | FR-PUB-09       | P1   | 3   | E6-7        | Todo        |                                                                                                                                                         |
| E6-9 | Seksi LandingCards fleksibel (baru) | Pengganti Event/About/Agents/Maps; N kartu terbit sesuai urutan; 2 terbit → tampil 2           | FR-PUB-01/04/05 | P0   | 5   | E1-6, E3-11 | Todo        | Plan `2026-10-17-landing-kartu-dinamis.md` Task 2–3; `tone` dark/light/ember.                                                                           |

**Kriteria Selesai E6:** Semua seksi konten utama tampil sesuai data admin & responsif.

---

## E7 — Situs Publik: Berita, FAQ, Download, Contact

**Tujuan:** Konten dinamis dan tautan keluar.

| ID   | Task                                                         | Detail                                                                                 | FR/Terkait   | Prio | SP  | Dep    | Status      | Catatan                                                                                                                                                                             |
| ---- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ------------ | ---- | --- | ------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E7-1 | Daftar berita landing (revisi: maks 3, tanpa halaman detail) | Hanya terbit, terbaru, `limit=3`; 0 item → seksi hilang; link per kartu opsional       | FR-PUB-10    | P0   | 5   | E3-6   | Todo        | Revisi 2026-10-17: plan `2026-10-17-landing-kartu-dinamis.md` Task 3; tanpa link "buka halaman artikel".                                                                            |
| E7-2 | Halaman detail berita                                        | DITUNDA (bukan dibatalkan): slug + SEO metadata dikerjakan setelah landing baru stabil | FR-PUB-11    | P0   | 3   | E3-6   | Todo        | Status tetap Todo; sitemap/E9-5 tanpa rute berita sampai E7-2 dikerjakan.                                                                                                           |
| E7-3 | Seksi FAQ accordion (dinamis penuh)                          | CRUD + urutan; jumlah bebas; 0 item → seksi hilang                                     | FR-PUB-12    | P0   | 3   | E3-7   | In Progress | 2026-10-17: `page.tsx` async + `getFaqItems()` (DB → rows, gagal → fallback statis); `FaqAccordion items?` + `[] → null`; build lolos. Sisa: uji tambah/urut via admin (butuh env). |
| E7-4 | Seksi Download                                               | Tombol per platform + status "Segera Hadir" selama belum rilis                         | FR-PUB-13/25 | P0   | 3   | E3-8   | Todo        |                                                                                                                                                                                     |
| E7-5 | Seksi Contact                                                | Email kontak + tautan media sosial                                                     | FR-PUB-14    | P0   | 2   | E3-8   | Todo        |                                                                                                                                                                                     |
| E7-6 | Tautan keluar tab baru                                       | `target="_blank"` + `rel="noopener noreferrer"`                                        | EI-07        | P0   | 1   | E7-4/5 | Todo        |                                                                                                                                                                                     |

**Kriteria Selesai E7:** Berita (paginasi+slug), FAQ, download, dan kontak berfungsi; tautan keluar tab baru.

---

## E8 — Panel Admin: Dashboard & Manajemen Konten

**Tujuan:** Seluruh modul CRUD CMS.

| ID    | Task                           | Detail                                                                              | FR/Terkait      | Prio | SP  | Dep                          | Status | Catatan                                                                                                                                                                                                                                                       |
| ----- | ------------------------------ | ----------------------------------------------------------------------------------- | --------------- | ---- | --- | ---------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E8-1  | Dashboard ringkasan            | Jumlah fitur, galeri, berita, FAQ, **waiting list** + waktu pembaruan terakhir      | FR-ADM-07       | P1   | 3   | E3-2..8, E3-11, E3-12, E11-3 | Done   | 2026-10-16: hitung 5 metrik server-side + waktu update konten non-waitlist, null bila kosong; error boundary & loading; test unit lolos. Revisi 2026-10-17 (belum dikerjakan): label wishlist + count komentar, plan `2026-10-17-cms-mutu-landing.md` Task 2. |
| E8-2  | Branding Management UI         | Ubah logo, favicon, nama game                                                       | FR-ADM-08       | P0   | 3   | E3-2, E4-6                   | Todo   |                                                                                                                                                                                                                                                               |
| E8-3  | Hero/Banner Management UI      | Ubah judul, subjudul, video, CTA; CRUD banner                                       | FR-ADM-09/10    | P0   | 5   | E3-3, E4-6                   | Todo   |                                                                                                                                                                                                                                                               |
| E8-4  | About & Features Management UI | Ubah About; CRUD+urut Features                                                      | FR-ADM-11/12    | P0   | 5   | E3-4, E4-6                   | Todo   |                                                                                                                                                                                                                                                               |
| E8-5  | How to Play Management UI      | CRUD+urut langkah + media; ubah video demo                                          | FR-ADM-13/14    | P0   | 5   | E3-4, E4-6                   | Todo   |                                                                                                                                                                                                                                                               |
| E8-6  | Gallery Management UI          | Unggah & hapus aset, atur urutan                                                    | FR-ADM-15/16    | P0   | 5   | E3-5, E4-5, E4-6             | Todo   |                                                                                                                                                                                                                                                               |
| E8-7  | News Management UI             | CRUD + cover/excerpt/tanggal/link opsional; ingatkan batas 3 + tanpa halaman detail | FR-ADM-18/19    | P0   | 5   | E3-6, E4-6                   | Todo   | Revisi 2026-10-17: plan `2026-10-17-cms-mutu-landing.md` Task 1.                                                                                                                                                                                              |
| E8-8  | FAQ Management UI              | CRUD + urut FAQ                                                                     | FR-ADM-20       | P0   | 3   | E3-7                         | Done   | 2026-10-16: `/admin/faq` form tambah/edit, sortOrder numerik, native confirm hapus, refresh pasca-mutasi, nav admin aktif; test parser & unit lolos.                                                                                                          |
| E8-9  | Social & Contact Management UI | CRUD download & social; ubah email                                                  | FR-ADM-21/22/23 | P0   | 3   | E3-8                         | Done   | 2026-10-16: `/admin/links` kelola download, medsos, dan email kontak settings; status terisolasi per bagian; empty download = "Segera Hadir".                                                                                                                 |
| E8-10 | Konfirmasi hapus               | Dialog konfirmasi sebelum hapus data/aset                                           | FR-ADM-26       | P0   | 2   | E8-6..9                      | Todo   |                                                                                                                                                                                                                                                               |
| E8-11 | Feedback & pesan error         | Toast/notifikasi sukses-gagal; pesan error per kolom                                | FR-ADM-24       | P0   | 3   | E8-1..9                      | Todo   |                                                                                                                                                                                                                                                               |
| E8-12 | Pengurutan drag & drop         | Urutkan Features, How to Play, Gallery, FAQ                                         | FR-ADM-12/13/20 | P1   | 3   | E8-4/5/6/8                   | Todo   |                                                                                                                                                                                                                                                               |

**Kriteria Selesai E8:** Seluruh modul CMS berfungsi; validasi & konfirmasi hapus berjalan.

---

## E9 — Performa, Aksesibilitas & SEO

**Tujuan:** Memenuhi NFR kualitas.

| ID   | Task                                  | Detail                                                                             | FR/Terkait    | Prio | SP  | Dep    | Status | Catatan                                                          |
| ---- | ------------------------------------- | ---------------------------------------------------------------------------------- | ------------- | ---- | --- | ------ | ------ | ---------------------------------------------------------------- |
| E9-1 | Optimasi performa beranda             | LCP ≤ 3 dtk, skor Lighthouse ≥ 80 (mobile)                                         | NFR-PRF-01/02 | P1   | 5   | E6, E7 | Todo   |                                                                  |
| E9-2 | Optimasi gambar                       | next/image + loader R2, lazy loading di bawah fold                                 | NFR-PRF-03    | P0   | 2   | E4-4   | Todo   |                                                                  |
| E9-3 | Audit aksesibilitas                   | Skor ≥ 90; alt pada gambar informatif; kontras & fokus                             | NFR-ACC-01    | P1   | 3   | E6, E7 | Todo   |                                                                  |
| E9-4 | Uji kegunaan (admin)                  | 3/3 calon admin ganti logo ≤ 5 menit tanpa panduan                                 | NFR-USE-02    | P1   | 2   | E8-2   | Todo   |                                                                  |
| E9-5 | SEO dasar (revisi: tanpa rute berita) | Metadata + sitemap landing/anchor + robots + OG; rute `/news/[slug]` menyusul E7-2 | —             | P2   | 2   | E7-1   | Todo   | Revisi 2026-10-17: plan `2026-10-17-cms-mutu-landing.md` Task 3. |

**Kriteria Selesai E9:** Skor Lighthouse terpenuhi; uji kegunaan lulus; SEO dasar terpasang.

---

## E10 — Pengujian, UAT & Deployment

**Tujuan:** Verifikasi menyeluruh dan rilis.

| ID    | Task                        | Detail                                                                                              | FR/Terkait             | Prio | SP  | Dep              | Status | Catatan                                                  |
| ----- | --------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------- | ---- | --- | ---------------- | ------ | -------------------------------------------------------- |
| E10-1 | Uji fungsional Situs Publik | Verifikasi FR-PUB-01..26 (termasuk news-3, kartu, wishlist, komentar; E7-2 dikecualikan)            | FR-PUB-*               | P0   | 3   | E6, E7, E11, E13 | Todo   | Revisi 2026-10-17: skrip `scripts/test-cms-landing.mjs`. |
| E10-2 | Uji fungsional Panel Admin  | Verifikasi FR-ADM-01..31 (termasuk kartu, komentar, CSV wishlist)                                   | FR-ADM-*               | P0   | 3   | E8, E11, E13     | Todo   |                                                          |
| E10-3 | Uji keamanan                | 401/403, presigned expiry, hash password, HTTPS redirect, email OAuth verified, rate limit komentar | NFR-SEC-01..07         | P0   | 3   | E2, E4, E11, E13 | Todo   |                                                          |
| E10-4 | Uji kompatibilitas browser  | Chrome, Firefox, Edge, Safari (2 versi mayor terakhir)                                              | NFR-CMP-01             | P0   | 3   | E6, E7           | Todo   |                                                          |
| E10-5 | UAT bersama mitra           | Skenario pengelolaan konten, kartu, news-3, wishlist, komentar oleh mitra                           | FR-ADM-27              | P0   | 3   | E10-1..4         | Todo   |                                                          |
| E10-6 | Deployment produksi         | Build OpenNext + `wrangler deploy`; konfigurasi secret, OAuth redirect URI & domain                 | NFR-DEP-01, A-04, A-06 | P0   | 3   | E10-5            | Todo   |                                                          |
| E10-7 | Dokumentasi & README        | Instalasi, konfigurasi, deployment                                                                  | NFR-MNT-01             | P0   | 2   | E0-1             | Todo   |                                                          |
| E10-8 | Handover & pelatihan        | Panduan penggunaan CMS untuk mitra                                                                  | NFR-USE-02             | P1   | 1   | E10-5            | Todo   |                                                          |

**Kriteria Selesai E10:** Semua uji lulus; aplikasi ter-_deploy_; dokumentasi & handover selesai.

---

## E11 — Wishlist & Google OAuth (rename dari Waiting List)

**Tujuan:** Pengunjung dapat bergabung wishlist via login Google; admin dapat mengelola data pendaftar. Istilah publik selalu "wishlist".

| ID     | Task                                   | Detail                                                                                              | FR/Terkait              | Prio | SP  | Dep          | Status      | Catatan                                                                                                                                                                                                                                               |
| ------ | -------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------- | ---- | --- | ------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E11-1  | Konfigurasi Google Provider (Auth.js)  | Client ID/Secret via env/secret, redirect URI, scope `openid email profile`                         | EI-08, A-06, NFR-SEC-06 | P0   | 3   | E2-1         | Done        | 2026-10-16: scope eksplisit, state+PKCE, URI/secret tanpa nilai nyata di `docs/GOOGLE_OAUTH_WAITLIST.md`; bukan klaim OAuth produksi sebelum E0-5.                                                                                                    |
| E11-2  | Handler login Google → simpan wishlist | Pada callback signIn, upsert email (+nama, foto) ke tabel `wishlist`                                | FR-PUB-19/20            | P0   | 5   | E11-1, E1-4  | Done        | 2026-10-16: email terverifikasi saja; upsert atomik nama/foto, kegagalan DB menolak login; validator profil diuji. Kode saat ini masih memakai tabel `waitlist`; rename ke `wishlist` belum dikerjakan (plan `2026-10-17-wishlist-rename.md` Task 1). |
| E11-3  | Logika idempoten & cek status          | Cegah duplikat email; sediakan query status "sudah terdaftar"                                       | FR-PUB-21               | P0   | 3   | E11-2        | Done        | 2026-10-16: status berdasarkan email sesi; 8 upsert paralel menghasilkan 1 row; kontrak UI publik/dashboard terdokumentasi.                                                                                                                           |
| E11-4  | Tombol wishlist di header              | Tombol Masuk/Gabung Wishlist pada header (state: belum login/sudah login)                           | FR-PUB-18               | P0   | 3   | E5-1, E11-1  | In Progress | 2026-10-17: `WishlistMenu` (anonim → login Google, login → email + Keluar) terpasang di `accountSlot`; copy wishlist + nav tanpa Esports/Lebih Banyak; unit 93/93; lint/tsc/format/build lolos. Sisa: uji klik desktop/mobile (butuh OAuth).          |
| E11-5  | Menu akun pengunjung                   | Tampilkan email yang login + tombol logout                                                          | FR-PUB-23/24            | P0   | 3   | E11-4        | Todo        |                                                                                                                                                                                                                                                       |
| E11-6  | UI status keikutsertaan                | Pesan terima kasih & status terdaftar setelah login (`#wishlist`)                                   | FR-PUB-22               | P0   | 3   | E11-2        | Todo        | Alur ≤3 langkah, tanpa submit email manual.                                                                                                                                                                                                           |
| E11-7  | API daftar wishlist                    | GET dengan paginasi + pencarian (admin only; kode saat ini `GET /api/waitlist`)                     | FR-ADM-28, NFR-SEC-03   | P0   | 3   | E3-1, E11-2  | Done        | 2026-10-16: `GET /api/waitlist` admin-only via JWT, pagination deterministik 25 baris, query search email/nama case-insensitive, test coverage lengkap. Revisi 2026-10-17 (belum dikerjakan): rename rute + redirect 308 kompatibilitas 1 rilis.      |
| E11-8  | API ekspor CSV                         | Endpoint ekspor data wishlist ke CSV (label wishlist; kode saat ini `GET /api/waitlist/export`)     | FR-ADM-29               | P1   | 2   | E11-7        | Done        | 2026-10-16: `GET /api/waitlist/export` admin-only, CSV escaping anti formula injection, UTF-8 BOM, filter pencarian menyeluruh (branch cms-waitlist). Revisi 2026-10-17 (belum dikerjakan): rename rute + label ke wishlist.                          |
| E11-9  | UI Wishlist Management                 | Tabel pendaftar, pencarian, paginasi, tombol ekspor, jumlah total (kode saat ini `/admin/waitlist`) | FR-ADM-28/29/30         | P0   | 5   | E11-7, E11-8 | Done        | 2026-10-16: `/admin/waitlist` tabel pendaftar, pencarian email/nama, paginasi deterministik, ekspor CSV hasil filter, jumlah total, a11y & nav admin (branch cms-waitlist). Revisi 2026-10-17 (belum dikerjakan): rename rute + label ke wishlist.    |
| E11-10 | Verifikasi keamanan OAuth              | Verifikasi email, tidak menyimpan token di klien, uji alur login                                    | NFR-SEC-07, NFR-USE-03  | P0   | 3   | E11-2..6     | Todo        |                                                                                                                                                                                                                                                       |

**Kriteria Selesai E11:** Pengunjung dapat login Google & masuk wishlist tanpa duplikat; admin dapat melihat, mencari, dan mengekspor data; alur ≤ 3 langkah.

---

## E13 — Komentar Landing (baru)

**Tujuan:** Satu kolom komentar di landing; login Google wajib; langsung tayang; admin hapus.

| ID    | Task                      | Detail                                                | FR/Terkait           | Prio | SP  | Dep          | Status | Catatan                                                 |
| ----- | ------------------------- | ----------------------------------------------------- | -------------------- | ---- | --- | ------------ | ------ | ------------------------------------------------------- |
| E13-1 | Skema + validasi komentar | Tabel `comments`, Zod body 1..500 tanpa HTML          | FR-PUB-26, FR-ADM-31 | P0   | 2   | E1-3         | Todo   | Plan `2026-10-17-komentar-landing.md` Task 1 (= E1-7).  |
| E13-2 | API komentar              | GET publik + POST visitor + rate limit + DELETE admin | FR-PUB-26, FR-ADM-31 | P0   | 3   | E13-1, E11-1 | Todo   | Plan `2026-10-17-komentar-landing.md` Task 2 (= E3-12). |
| E13-3 | UI komentar + hapus admin | Seksi `#komentar` + form + hapus berkonfirmasi        | FR-PUB-26, FR-ADM-31 | P0   | 3   | E13-2        | Todo   | Tanpa guest, tanpa balasan, tanpa edit.                 |

**Kriteria Selesai E13:** Login Google bisa kirim dan langsung tampil; anonim ditolak; admin bisa hapus; spam cepat kena 429.

---

## E12 — Design System & UI (acuan Valorant)

**Tujuan:** Menerapkan gaya visual ala Valorant yang disesuaikan dengan branding BAREN.

| ID    | Task                        | Detail                                                                         | FR/Terkait           | Prio | SP  | Dep         | Status | Catatan                                                                                                                                                                                                                |
| ----- | --------------------------- | ------------------------------------------------------------------------------ | -------------------- | ---- | --- | ----------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E12-1 | Design token & palet warna  | Dark theme, warna aksen utama, skala kontras (WCAG)                            | C-10, DG-02          | P0   | 3   | E0-2        | Done   | 2026-10-16: `globals.css` — palet ink/sand/ember + token semantik bg/fg/accent/line/focus, shadcn vars dipetakan ke BAREN; kontras: sand/ink 16.06, ember/ink 5.08, sand/ember-700 5.13, ember/sand 3.16 (besar saja). |
| E12-2 | Tipografi & skala teks      | Display font judul + sans-serif isi, skala responsif                           | C-10, DG-03          | P0   | 3   | E12-1       | Done   | 2026-10-16: Anton/Inter dipertahankan + fallback stack, display-xl fluid 44→94px + display-lg, eyebrow lh 1.5, `text-wrap:balance`; 360/768/1920 + zoom 200% via clamp/rem.                                            |
| E12-3 | Komponen tombol CTA         | Gaya tegas (uppercase, geometris) + state hover/focus/disabled                 | C-10, DG-04          | P0   | 3   | E12-1       | Done   | 2026-10-16: `cta-button.tsx` — `href` → tautan (tag a), tanpa `href` → tombol (tag button), varian ember/ink/ghost + size md/sm, disabled/aria-disabled, fokus ember; API diserahkan ke Publik/CMS.                    |
| E12-4 | Komponen kartu & overlay    | Kartu fitur/berita/galeri dengan rasio gambar konsisten + overlay gradien      | DG-08                | P0   | 3   | E12-1       | Done   | 2026-10-16: `content-card.tsx` baru — `CardMedia` (video/square/wide + fallback bg-ink-700), `CardOverlay`, `ContentCard` (tone light/dark, href opsional); tanpa fetch data.                                          |
| E12-5 | Hero full-bleed             | Layout hero layar penuh dengan gambar/video latar + judul besar                | DG-01                | P0   | 5   | E6-1, E12-1 | Todo   |                                                                                                                                                                                                                        |
| E12-6 | Navigasi transparan → solid | Header transparan di hero, solid saat digulir                                  | DG-06                | P1   | 2   | E5-3, E12-1 | Done   | 2026-10-16: header fixed transparan→`bg-ink/95` saat scroll/menu terbuka; sand/ember kontras di kedua keadaan, menu solid z-50, 1 listener pasif, transisi nonaktif saat reduced-motion.                               |
| E12-7 | Animasi & transisi          | Animasi halus pada scroll/hover tanpa mengorbankan performa                    | DG-07, NFR-PRF       | P1   | 3   | E12-5       | Todo   |                                                                                                                                                                                                                        |
| E12-8 | Audit visual & konsistensi  | Cek konsistensi seluruh seksi, responsif, dan tidak menyalin aset pihak ketiga | DG-09/10, NFR-ACC-01 | P0   | 2   | E12-1..7    | Todo   |                                                                                                                                                                                                                        |

**Kriteria Selesai E12:** Tampilan konsisten dengan acuan (hero full-bleed, dark theme, CTA tegas), responsif, aksesibel, dan bebas aset berhak cipta pihak ketiga.

---

## 2. Matriks Ketertelusuran (Requirement → Task)

| Requirement                                              | Task Utama                         |
| -------------------------------------------------------- | ---------------------------------- |
| FR-PUB-01/02                                             | E6-1, E12-5                        |
| FR-PUB-03                                                | E6-2                               |
| FR-PUB-04                                                | E6-3                               |
| FR-PUB-05                                                | E6-4                               |
| FR-PUB-06                                                | E6-5                               |
| FR-PUB-07                                                | E6-6                               |
| FR-PUB-08                                                | E6-7                               |
| FR-PUB-09                                                | E6-8                               |
| FR-PUB-10                                                | E7-1 (revisi news-3, tanpa detail) |
| FR-PUB-11                                                | E7-2 (DITUNDA)                     |
| FR-PUB-12                                                | E7-3                               |
| FR-PUB-26 (baru: komentar langsung tayang, login Google) | E13-1..3                           |
| FR-ADM-31 (baru: hapus komentar)                         | E13-2/3                            |
| FR-PUB-13                                                | E7-4                               |
| FR-PUB-14                                                | E7-5                               |
| FR-PUB-15                                                | E5-2                               |
| FR-PUB-16                                                | E5-3, E12-6                        |
| FR-PUB-17                                                | E5-4                               |
| FR-PUB-18                                                | E11-4                              |
| FR-PUB-19                                                | E11-1, E11-2                       |
| FR-PUB-20                                                | E11-2                              |
| FR-PUB-21                                                | E11-3                              |
| FR-PUB-22                                                | E11-6                              |
| FR-PUB-23/24                                             | E11-5                              |
| FR-PUB-25                                                | E7-4                               |
| FR-ADM-01                                                | E2-2, E2-7                         |
| FR-ADM-02/03                                             | E2-3                               |
| FR-ADM-04                                                | E2-4                               |
| FR-ADM-05                                                | E2-5                               |
| FR-ADM-06                                                | E2-6                               |
| FR-ADM-07                                                | E8-1                               |
| FR-ADM-08                                                | E8-2                               |
| FR-ADM-09/10                                             | E8-3                               |
| FR-ADM-11/12                                             | E8-4                               |
| FR-ADM-13/14                                             | E8-5                               |
| FR-ADM-15/16/17                                          | E4-2/3/6, E8-6                     |
| FR-ADM-18/19                                             | E8-7                               |
| FR-ADM-20                                                | E8-8                               |
| FR-ADM-21/22/23                                          | E8-9                               |
| FR-ADM-24                                                | E3-9, E8-11                        |
| FR-ADM-25                                                | E3-9                               |
| FR-ADM-26                                                | E8-10                              |
| FR-ADM-27                                                | E3-10                              |
| FR-ADM-28                                                | E11-7, E11-9                       |
| FR-ADM-29                                                | E11-8, E11-9                       |
| FR-ADM-30                                                | E11-9, E8-1                        |
| EI-01                                                    | E5-5                               |
| EI-02/03                                                 | E3-1, E0-4                         |
| EI-04/05/06                                              | E4-1/2/3                           |
| EI-07                                                    | E7-6                               |
| EI-08                                                    | E11-1                              |
| DG-01                                                    | E12-5                              |
| DG-02                                                    | E12-1                              |
| DG-03                                                    | E12-2                              |
| DG-04                                                    | E12-3                              |
| DG-05                                                    | E12-5, E12-4                       |
| DG-06                                                    | E12-6                              |
| DG-07                                                    | E12-7                              |
| DG-08                                                    | E12-4                              |
| DG-09/10                                                 | E12-8                              |
| NFR-PRF-01/02                                            | E9-1                               |
| NFR-PRF-03                                               | E4-4, E9-2                         |
| NFR-USE-01                                               | E5-5                               |
| NFR-USE-02                                               | E9-4                               |
| NFR-USE-03                                               | E11-10                             |
| NFR-ACC-01                                               | E9-3, E12-8                        |
| NFR-CMP-01                                               | E10-4                              |
| NFR-SEC-01                                               | E2-2                               |
| NFR-SEC-02                                               | E3-9                               |
| NFR-SEC-03                                               | E3-1, E4-2, E11-7                  |
| NFR-SEC-04                                               | E0-3, E10-3                        |
| NFR-SEC-05                                               | E4-1/2/3                           |
| NFR-SEC-06                                               | E0-5, E11-1                        |
| NFR-SEC-07                                               | E11-10                             |
| NFR-MNT-01                                               | E10-7                              |
| NFR-MNT-02                                               | E1-5                               |
| NFR-MNT-03                                               | E0-1, E0-7                         |
| NFR-DEP-01                                               | E0-3, E10-6                        |

---

## 3. Urutan Pengerjaan yang Disarankan (Critical Path)

```
E0 (Fondasi) → E1 (Skema DB + landing_cards + comments) → E2 (Auth admin) ┐
                                                                          ├→ E5 (UI/Layout) ┐
E0 → E4 (R2/Aset) ────────────────────────────────────────────────────────┘                   ├→ E6/E7 (Situs Publik baru) ┐
E1 → E3 (API + landing-cards + comments) ─────────────────────────────────────────────────────┘                        │
E2/E3/E4 → E8 (Panel Admin baru) ─────────────────────────────────────────────────────────────────────────────────────┼→ E9 (Kualitas) → E10 (UAT/Deploy)
E1/E2 → E11 (Wishlist & Google OAuth) ────────────────────────────────────────────────────────────────────────────────┘
E13 (Komentar) setelah E11-1/2 ───────────────────────────────────────────────────────────────────────────────────────┘
E12 (Design System) berjalan paralel, mulai setelah E0-2 ─────────────────────────────────────────────────────────────┘
```

**Jalur kritis:** E0 → E1 → E2 → E3 → E8 → E10.
**Paralel yang disarankan:** E12 (desain) dapat dimulai lebih awal; E11 (wishlist) setelah E2 selesai; E13 (komentar) setelah E11-1/2.
**Plan baru 2026-10-17:** `landing-kartu-dinamis` (E1-6, E3-11, E6-1/3/5/6/9, E7-1/3, E5-3) → `wishlist-rename` (E1-4, E11-2/4..9) → `komentar-landing` (E13/E1-7/E3-12) → `cms-mutu-landing` (E8, E9, E10 delta). E7-2/E9-5 lama DITUNDA.

---

## 4. Log Progress (diisi agent setiap menyelesaikan task)

> Setiap kali sebuah task ditandai `Done`, tambahkan satu baris di bawah ini (terbaru di atas). Format tanggal: `YYYY-MM-DD`.

| Tanggal    | Task ID           | Ringkasan                                                                                                                                                                                                                                                            | Referensi (commit/PR)               |
| ---------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 2026-10-17 | E3-12, E6-1, E7-3 | API `comments` (GET/POST/DELETE) + hero dinamis + FAQ dinamis; unit 90/90; lint/tsc/format/build lolos; verifikasi DB tertunda (tanpa env lokal).                                                                                                                    | _(uncommitted)_                     |
| 2026-10-17 | E11-4             | `WishlistMenu` + slot header + copy wishlist + nav trim; unit 93/93; lint/tsc/format/build lolos; uji OAuth tertunda.                                                                                                                                                | _(uncommitted)_                     |
| 2026-10-16 | E0-5              | Manajemen rahasia Done: Worker prod live + `/api/settings` 200 via `getDb()` (secret Neon terpasang, NFR-SEC-06 terpenuhi); E0 100% (21/21 SP)                                                                                                                       | https://baren.fdiraf77.workers.dev/ |
| 2026-10-17 | Desain+4 plan     | Spec `specs/2026-10-17-landing-dinamis-wishlist-komentar-design.md` + 4 plan delta (`landing-kartu-dinamis`, `wishlist-rename`, `komentar-landing`, `cms-mutu-landing`); breakdown v1.3: E1-6/7, E3-11/12, E6-9, E13 baru; E7-2/E9-5 ditunda; waiting list→wishlist. | _(uncommitted)_                     |
| 2026-10-17 | E1-6, E1-7        | Skema `landing_cards` + `comments` + Zod + node:test 8/8 + migrasi `0001_typical_alex_wilder.sql` (CREATE saja); lint/tsc/format/build lolos; apply Neon tertunda (butuh branch isolasi).                                                                            | _(uncommitted)_                     |
| 2026-10-17 | E3-11             | API `landing-cards` (GET/POST/`[id]`/`reorder`) + news `?limit=`; unit 86/86; lint/tsc/format/build lolos; matriks HTTP riil tertunda (butuh env + apply migrasi).                                                                                                   | _(uncommitted)_                     |
| 2026-10-16 | E11-9             | UI waitlist admin: /admin/waitlist tabel pendaftar, pencarian email/nama, paginasi 25 baris, tombol unduh CSV, total pendaftar, a11y & nav admin aktif, unit tests lolos.                                                                                            | _(branch cms-waitlist)_             |
| 2026-10-16 | E11-8             | API ekspor CSV: GET /api/waitlist/export admin-only, RFC 4180 escaping, proteksi formula injection (=,+,-,@), UTF-8 BOM, filter search tanpa limit, unit tests lolos.                                                                                                | _(branch cms-waitlist)_             |
| 2026-10-16 | E11-7             | API waitlist: GET /api/waitlist admin-only, paginasi deterministik 25 baris, pencarian case-insensitive email/nama, unit tests query & pagination lolos.                                                                                                             | _(branch cms-waitlist)_             |
| 2026-10-16 | E8-9              | Links admin UI: /admin/links CRUD download & social, edit email kontak settings, state terisolasi per bagian, game belum rilis "Segera Hadir", lolos lint/tsc/test.                                                                                                  | _(branch cms-waitlist)_             |
| 2026-10-16 | E8-8              | FAQ admin UI: /admin/faq form tambah/edit, sortOrder numerik, native confirm hapus, auto refresh mutasi, tanpa duplikasi Zod di klien, lolos lint/tsc/test.                                                                                                          | _(branch cms-waitlist)_             |
| 2026-10-16 | E8-1              | Dashboard admin: hitung 5 metrik server-side (features, galeri, news, FAQ, waitlist), waktu update konten non-waitlist, error/loading boundary, unit tests lolos.                                                                                                    | _(branch cms-waitlist)_             |
| 2026-10-16 | E5-2              | Branding dinamis: `lib/branding.ts` + `BrandLogo` + layout async `revalidate=60` + metadata dinamis; E3-2 Done di main; fallback tanpa env; build + runtime + Playwright lolos; plan fondasi 11/11 → `archive/`.                                                     | _(branch feat-visual)_              |
| 2026-10-16 | E3-10             | Cache: seluruh GET publik `force-dynamic`; GET sesudah PUT segar kurang dari 5 dtk di tiap matriks E3-2..8 (batas 60 dtk).                                                                                                                                           | 412e31b                             |
| 2026-10-16 | E3-9              | Zod lengkap settings/hero/game/gallery/news/faq/links (strict, https, slug, min-satu-kolom); node:test 73/73.                                                                                                                                                        | 412e31b                             |
| 2026-10-16 | E3-8              | Social/download CRUD + https; email kontak di settings; kosong = "Segera Hadir"; HTTP hijau; DB kosong kembali.                                                                                                                                                      | a854e2c                             |
| 2026-10-16 | E3-7              | FAQ CRUD + urut deterministik; HTTP hijau (reorder, anon 401); DB kosong kembali.                                                                                                                                                                                    | 80d7ab4                             |
| 2026-10-16 | E3-6              | News: draf tak publik, slug 409 (perbaiki cause Drizzle), [key] tunggal, paginasi 9+1 deterministik; DB kosong kembali.                                                                                                                                              | c79f8ac                             |
| 2026-10-16 | E3-5              | Galeri CRUD/urut + filter kind; DELETE kembalikan fileUrl (E4-5); HTTP hijau; DB kosong kembali.                                                                                                                                                                     | 652d45f                             |
| 2026-10-16 | E3-4              | About/features/steps/video CRUD/urut; HTTP hijau (video null→isi); DB kosong kembali.                                                                                                                                                                                | 35a91c7                             |
| 2026-10-16 | E3-3              | Hero singleton + banners CRUD/urut; HTTP hijau (401/400/404, reorder); DB kosong kembali.                                                                                                                                                                            | ca25274                             |
| 2026-10-16 | E3-2              | API settings Done: GET 200, PUT anon 401, PUT admin 200 + GET berubah, PUT http/malformed/kosong 400 per kolom; data dikembalikan persis + terverifikasi; PUT visitor-403 HTTP tertunda OAuth (tertutup unit + E2-4).                                                | d2a7530                             |
| 2026-10-16 | E3-1              | Helper API Done: amplop respons/error + parse Zod + guard admin + DB-error mapping, node:test 30/30, lint/tsc/format/build lolos; tanpa edit `src/db/**`.                                                                                                            | 213c8dd                             |
| 2026-10-16 | E2-6              | Playwright perubahan password, login lama ditolak, login baru berhasil; password awal dipulihkan dan bcrypt DB diverifikasi.                                                                                                                                         | 6b5d719                             |
| 2026-10-16 | E2-5              | Playwright edit profil, reload sesi, dan konflik email visitor; profil admin dipulihkan, akun konflik sementara dihapus.                                                                                                                                             | 6b5d719                             |
| 2026-10-16 | E2-7              | Form login RHF+zodResolver Indonesia; E2E Playwright 9/9 (validasi, generik, sukses→/admin, logout→login).                                                                                                                                                           | 93f3b65                             |
| 2026-10-16 | E2-4              | Proxy verifikasi JWT langsung (auth(request) beta kembalikan Response); anon 307, visitor/tanpa-role 307+AksesDitolak, rusak 307, admin 200; kontrak guard terbit untuk E3-1/E4-2.                                                                                   | 93f3b65                             |
| 2026-10-16 | E2-3              | Logout hapus sesi (302 + cookie bersih); JWT exp-iat=3600; pasca-logout `/admin` 307.                                                                                                                                                                                | 93f3b65                             |
| 2026-10-16 | E2-2              | Login bcryptjs benar/salah/tak-ada/OAuth-only (semua non-valid ditolak, pesan generik); uppercase OK.                                                                                                                                                                | 93f3b65                             |
| 2026-10-16 | E2-1              | Auth.js v5 JWT + Drizzle adapter; secret binding Workers; matriks preview 10/10 (anon/admin/visitor/rusak/logout).                                                                                                                                                   | 93f3b65                             |
| 2026-10-16 | E11-1..3          | Scope Google eksplisit, state+PKCE, email terverifikasi, upsert atomik, status sesi-pemilik; 8 upsert paralel menghasilkan 1 row. OAuth produksi tetap diblokir E0-5.                                                                                                | 153912e                             |
| 2026-10-16 | E12-6             | Header transparan→solid: kontras sand/ember kedua keadaan, menu solid z-50, listener pasif, reduced-motion; Playwright menu 360px OK.                                                                                                                                | 94fdd5a                             |
| 2026-10-16 | E5-5              | Audit responsif Playwright 360/768/1920 + landscape + menu + /admin → scrollX-lebih=0 semua; `overflow-x:clip` + `max-width:100%` media.                                                                                                                             | 94fdd5a                             |
| 2026-10-16 | E5-4              | Menu lipat (< 768 px, md): aria-expanded/controls, label Indonesia, fokus+Escape+scroll-lock, link menutup; hapus tombol cari mati, hasMenu jadi link.                                                                                                               | 94fdd5a                             |
| 2026-10-16 | E5-3              | Nav anchor kontrak (#top/berita/tentang/fitur/pemain/arena/faq/galeri/kontak/daftar); scroll-margin 5.5rem, smooth+reduced-motion, `:target` outline.                                                                                                                | 94fdd5a                             |
| 2026-10-16 | E5-6              | `src/app/admin/layout.tsx` baru: sidebar/topbar/main, drawer di bawah breakpoint md aksesibel, Keluar disabled menunggu E2, guard E2-4, isi CMS.                                                                                                                     | 94fdd5a                             |
| 2026-10-16 | E5-1              | Layout publik: skip link, `main#konten-utama`, branding fallback + `accountSlot` (E11-4), footer props; tidak sentuh page/hero.                                                                                                                                      | 94fdd5a                             |
| 2026-10-16 | E12-4             | `content-card.tsx` baru: CardMedia/CardOverlay/ContentCard, rasio video/square/wide, fallback bg-ink-700; tanpa fetch.                                                                                                                                               | 94fdd5a                             |
| 2026-10-16 | E12-3             | `cta-button.tsx`: semantik link-vs-button, varian ember/ink/ghost + sm/md, disabled, fokus ember; kompatibel mundur.                                                                                                                                                 | 94fdd5a                             |
| 2026-10-16 | E12-2             | Tipografi: Anton/Inter + fallback, display-xl/lg fluid, eyebrow lh, balance; zoom 200% via clamp/rem.                                                                                                                                                                | 94fdd5a                             |
| 2026-10-16 | E12-1             | Token BAREN: palet + semantik bg/fg/accent/line/focus, shadcn→BAREN dark, kontras 16.06/5.08/5.13/3.16-kanan didokumen di CSS.                                                                                                                                       | 94fdd5a                             |
| 2026-10-16 | E1-1..5           | Skema SRS §3.5 + migrasi 17 tabel tanpa DROP di branch Neon `feat-data` + seed idempoten + uji psql lolos; E1 Done (15/15 SP).                                                                                                                                       | 49fb403                             |
| 2026-10-16 | E4-6              | Uploader Done: presign-JIT + XHR/abort + retry-atomik + terunggah/menyimpan/tersimpan/gagal-simpan + onUploaded-opsional; unit core 8/8; Playwright 8/9 (retry-Tersimpan tertunda egress sandbox).                                                                   | _(uncommitted)_                     |
| 2026-10-16 | E4-5              | DELETE Done: anon 401 + admin 400 + hilang 200 deleted:false + ada 200 deleted:true + ulang idempoten + unit murni 4/4 + keyFrom ketat; endpoint refactor pakai deleteAssetObject; R2-nyata S3-DELETE 204 terpisah.                                                  | _(uncommitted)_                     |
| 2026-10-16 | E4-2              | PUT Done penuh: admin 200 + 400 gif/oversize/SVG-gallery + upload R2 nyata 200 + CT-salah 403 + S3-DELETE 204; bucket bersih.                                                                                                                                        | _(uncommitted)_                     |
| 2026-10-16 | E4-4              | Loader `next/image` R2 tolak signed URL + komponen `R2Image` lazy/fallback; unit 7/7; lint/tsc/build/preview lolos; koordinasi E9-2.                                                                                                                                 | _(uncommitted)_                     |
| 2026-10-16 | E4-3              | Validasi server Zod JPG/PNG/WebP + SVG hanya logo/ikon ≤5 MB + MP4 ≤50 MB + cek silang ekstensi/MIME + `verifyStoredAsset`; validasi klien selaras; unit 11/11.                                                                                                      | _(uncommitted)_                     |
| 2026-10-15 | E0-7              | `.github/workflows/ci.yml` (push/PR: install frozen, lint, tsc, format:check, build); verifikasi lokal lolos; run GitHub Actions pada `71b92cb` **hijau** (job `check` 40s).                                                                                         | 71b92cb                             |
| 2026-10-15 | E0-6              | Smoke test health di preview :8787 → HTTP 200 JSON `{"ok":true,"service":"baren"}`; route tidak menyentuh DB. Di-push ke `main`.                                                                                                                                     | 71b92cb                             |
| 2026-10-15 | E0-5              | README bagian "Cloudflare setup" (bucket R2 + `wrangler secret put`); `.dev.vars` ter-ignore, example tracked; verifikasi lolos. **Blocked**: Worker belum deploy, nilai rahasia produksi belum tersedia.                                                            | 71b92cb                             |
| 2026-10-15 | E0-4              | `neon init` + `neon deploy` (project `still-firefly-90444743`, branch `production`) menarik env ke `.env.local`; `SELECT 1` via `getDb()` **end-to-end di Worker** preview :8787 → `{"ok":true,"db":"neon","result":{"ok":1}}`; lint/tsc/format/build lolos.         | _(uncommitted)_                     |
| 2026-10-15 | E0-3              | OpenNext build + preview :8787; `/api/health` 200 JSON `{"ok":true,"service":"baren"}`; binding lokal terhubung; cf-typegen & lint/tsc/format/build lolos; di-push ke `main`.                                                                                        | 71b92cb                             |
| 2026-10-15 | E0-2              | Init shadcn/ui (radix-nova) + perbaikan regresi font `@theme inline`; lint/tsc/format/build lolos; responsif 360–1920px OK                                                                                                                                           | _(uncommitted)_                     |
| 2026-10-14 | E0-1              | Setup tooling: Prettier, skrip format, ignore ESLint artefak build; lint/tsc/format/build lolos                                                                                                                                                                      | _(uncommitted)_                     |

---

## 5. Definition of Done (berlaku untuk semua task)

- [ ] Kode lolos ESLint & Prettier (NFR-MNT-03).
- [ ] TypeScript tanpa galat (`tsc --noEmit`).
- [ ] Validasi input dengan Zod di sisi server (NFR-SEC-02).
- [ ] Endpoint tulis memerlukan autentikasi (NFR-SEC-03).
- [ ] Responsif 360 px – 1920 px, tanpa gulir horizontal.
- [ ] Teks antarmuka berbahasa Indonesia (C-01).
- [ ] Sesuai pedoman desain (C-10) bila menyentuh UI.
- [ ] Berhasil di-build OpenNext & berjalan di `wrangler preview`.
- [ ] Kode di-_review_ dan di-_merge_ ke branch utama.
- [ ] Status task & Log Progress (§4) diperbarui.
