# Fondasi Proyek E0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menuntaskan task E0-1 sampai E0-7 pada baseline BAREN, dengan build dan preview Cloudflare yang teruji serta fondasi tooling, database, rahasia, dan CI yang dapat dipakai epik berikutnya.

**Architecture:** Pertahankan aplikasi tunggal Next.js App Router dalam `src/`, konfigurasi OpenNext/Wrangler yang sudah ada, dan koneksi Drizzle melalui driver HTTP Neon. Lengkapi bagian yang hilang; jangan ganti UI hasil baseline scraping. Uji integrasi Workers melalui preview, bukan hanya `next build`.

**Tech Stack:** Next.js 16 App Router, TypeScript, pnpm, Tailwind CSS, shadcn/ui, Cloudflare Workers/OpenNext, Wrangler/R2, Neon serverless, Drizzle, ESLint, Prettier, GitHub Actions.

**Spec:** `docs/PRD.md` §5; `docs/SRS.md` §2.4–2.5, EI-03, NFR-DEP-01, NFR-MNT-01/03, NFR-SEC-06; `docs/TASK_BREAKDOWN.md` §E0 dan §5.

## Global Constraints

- `C-03`: teknologi mengikuti SRS §2.4: **Next.js 16 (App Router)** dengan TypeScript; baseline memakai Next.js 16.3.8. Baca panduan versi terpasang di `node_modules/next/dist/docs/` sebelum mengubah kode Next.
- `C-04`: seluruh kode server berjalan pada Cloudflare Workers; hindari modul native Node.js pada runtime.
- `C-05`/`EI-03`: Neon diakses melalui Drizzle ORM dan driver kompatibel Workers `@neondatabase/serverless`.
- `C-07`/`NFR-SEC-06`: kredensial hanya di `.dev.vars` lokal atau `wrangler secret` produksi; jangan commit nilainya.
- `C-08`/`NFR-SEC-04`: trafik produksi HTTPS dan HTTP dialihkan ke HTTPS oleh konfigurasi domain Cloudflare; validasi saat domain tersedia.
- `NFR-MNT-03`: ESLint, Prettier, dan `tsc --noEmit` harus lolos.
- `C-01`/`C-02`: jika menyentuh UI, teks Indonesia dan mobile-first; jangan mengubah tampilan baseline demi setup tooling.
- Mulai tiap task hanya setelah semua `Dep` berstatus `Done`; ubah `Todo` menjadi `In Progress` sebelum mengedit kode. Setelah verifikasi Definition of Done, isi catatan tanggal/bukti, progress SP, dan log terbaru di `docs/TASK_BREAKDOWN.md` §4. Review/merge dan secret eksternal perlu bukti nyata, bukan asumsi.
- Baseline audit 2026-10-14: tidak ada E0 `Done`; lint, typecheck, `pnpm build` dan build OpenNext lokal lolos. Route `/api/health` sudah ada, tetapi preview HTTP belum terverifikasi. Catatan parsial telah dicantumkan pada setiap baris E0. E0 tetap 0/21 SP.

## File Map

| File                                                           | Tanggung jawab                                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `docs/PRD.md`, `docs/SRS.md`, `docs/TASK_BREAKDOWN.md`         | Sinkronkan keputusan versi framework; status, progress, log, dan bukti E0.                  |
| `package.json`, `pnpm-lock.yaml`                               | Skrip kualitas, Prettier, dan dependensi UI yang benar-benar diperlukan.                    |
| `.prettierrc.json`, `.prettierignore`                          | Aturan format minimum dan pengecualian output/generated/media.                              |
| `components.json`, `src/lib/utils.ts`                          | Konfigurasi shadcn/ui dan helper `cn` bila dibutuhkan oleh instalasi komponen.              |
| `src/app/globals.css`                                          | Hubungkan token BAREN yang ada dengan variabel semantik shadcn tanpa merombak CSS baseline. |
| `wrangler.jsonc`, `open-next.config.ts`, `cloudflare-env.d.ts` | Binding Worker; types digenerasi, tidak diedit manual.                                      |
| `src/db/index.ts`, `drizzle.config.ts`                         | Koneksi runtime Neon dan migrasi Drizzle; jangan membawa migrasi/skema E1 ke E0.            |
| `.dev.vars.example`, `.gitignore`, `README.md`                 | Nama env contoh, proteksi secret, dan panduan instalasi, konfigurasi, deploy.               |
| `src/app/api/health/route.ts`, `.github/workflows/ci.yml`      | Smoke test JSON dan lint/typecheck/build di CI.                                             |

## Task 1: Lengkapi tooling (E0-1; 3 SP)

**Files:** Modify `docs/TASK_BREAKDOWN.md`, `package.json`, `pnpm-lock.yaml`; Create `.prettierrc.json`, `.prettierignore`.

**Interfaces:** Produces `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm format:check`, `pnpm build`. Task 2–6 bergantung pada E0-1.

- [x] **Step 1: Verifikasi baseline.** Pastikan `package.json` tetap memakai Next.js 16.3.8 dan `eslint-config-next` 16.3.8 sesuai PRD §5 dan SRS §2.4 yang sudah disinkronkan; tidak perlu migrasi versi.
- [x] **Step 2: Tandai E0-1 `In Progress`.** Baseline belum memiliki executable Prettier (`pnpm exec prettier --version` gagal). Jadikan kegagalan ini pemeriksaan awal, kemudian instal `prettier` sebagai dev dependency dengan `pnpm add -D prettier`.
- [x] **Step 3: Tambahkan skrip dan konfigurasi minimum.** Pada `package.json`, tambah `"format:check": "prettier --check ."` dan `"format": "prettier --write ."`. Gunakan `.prettierrc.json` yang selaras TS saat ini:

```json
{
  "singleQuote": false,
  "semi": true
}
```

Isi `.prettierignore` dengan `.next`, `.open-next`, `.wrangler`, `node_modules`, `pnpm-lock.yaml`, `cloudflare-env.d.ts`, `public/media`, `verify`, `scrape`, dan output generated lain yang benar-benar muncul. Jalankan `pnpm format:check` sebelum format untuk mengukur utang baseline. Jika banyak file gagal, format hanya kode/config yang dicakup DoD dalam commit terpisah yang direview; jangan mengabaikan source yang gagal sekadar untuk membuat check hijau.

- [x] **Step 4: Verifikasi.** Jalankan `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm format:check`, `pnpm build`. Jika format baseline belum seragam, pilih aturan dan cakupan secara sadar; rapikan file kecil yang perlu tanpa merusak UI. Perbarui E0-1 `Done` hanya bila seluruh DoD relevan terpenuhi; jika review/merge belum terjadi, pertahankan status dan catat blocker. Commit hanya bila diminta secara eksplisit.

> **Hasil 2026-10-14:** Semua langkah selesai. `prettier@3.9.10` terpasang, skrip `format`/`format:check` dan `.prettierrc.json`/`.prettierignore` dibuat, seluruh source diformat ulang (cosmetic saja, tanpa mengubah UI). `.open-next/**` dan `.wrangler/**` ditambahkan ke ignore ESLint agar `pnpm lint` bersih dari artefak build. Verifikasi: `pnpm lint` ✅, `pnpm exec tsc --noEmit` ✅, `pnpm format:check` ✅, `pnpm build` ✅. Blocker DoD: review/merge ke branch utama belum dilakukan (tidak ada commit atas permintaan).

## Task 2: Lengkapi token dan setup shadcn/ui (E0-2; 3 SP)

**Files:** Modify `package.json`, `pnpm-lock.yaml`, `src/app/globals.css`; Create `components.json`; Create `src/lib/utils.ts` hanya jika alias utility dibutuhkan oleh komponen shadcn.

**Interfaces:** Consumes alias `@/*` dari `tsconfig.json`, Tailwind 4 `@theme` pada `src/app/globals.css`. Produces konfigurasi `components.json` agar komponen E8/E12 bisa ditambahkan kemudian, tanpa membangun komponen yang belum diminta.

- [x] **Step 1: Setelah E0-1 `Done`, tandai E0-2 `In Progress`.** Bukti awal: `pnpm exec shadcn --version` belum tersedia; `components.json` tidak ada. Periksa panduan shadcn versi yang kompatibel dengan Next/Tailwind yang sudah dipilih.
- [x] **Step 2: Init shadcn secara minimal** menggunakan CLI resmi (`pnpm dlx shadcn@latest init` bila diperlukan) dan cek hasil `components.json` sebelum menerima perubahan. Konfigurasi inti yang harus dihasilkan:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib"
  },
  "iconLibrary": "lucide"
}
```

Install hanya runtime dependency yang benar-benar diminta oleh output konfigurasi/komponen pertama; hindari scaffold komponen contoh. Pertahankan token `ink`, `sand`, `ember` yang ada; tambah pemetaan CSS variabel semantik seperti `--background`, `--foreground`, `--primary`, dan radius hanya bila dibutuhkan CLI.

- [x] **Step 3: Pemeriksaan gagal/lulus.** Sebelum setup, periksa file `components.json` tidak ada; sesudah setup, jalankan validasi CLI shadcn yang sesuai versinya. Jika CLI tak menyediakan validasi tanpa mengubah proyek, tambahkan satu komponen UI yang memang diperlukan E8/E12 pada saat itu saja; jangan buat komponen dummy. Jalankan `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm format:check`, `pnpm build`. Verifikasi screenshot beranda tetap sesuai baseline pada lebar 360 px dan desktop jika CSS berubah. Update status/progress/log setelah DoD; commit hanya jika diminta.

> **Hasil 2026-10-15:** `shadcn@4.21.5 init` (CLI resmi) menghasilkan `components.json` + `src/lib/utils.ts` (`export { cn } from "cn"`). **Deviasi dari contoh plan:** CLI versi ini tidak lagi memakai style `new-york` (legacy, butuh `tailwindcss-animate` v3 yang tak kompatibel Tailwind 4); style default yang dihasilkan adalah `radix-nova` (native Tailwind 4, base `radix`, `baseColor: neutral`, `cssVariables: true`, `iconLibrary: lucide`) — diterima karena lebih kompatibel. **Perbaikan regresi:** blok `@theme inline` dari shadcn menulis `--font-sans: var(--font-sans)` (referensi melingkar) ke `:root`, menghapus pemetaan `--font-sans: var(--font-inter)` sehingga font Inter hilang; diubah menjadi `--font-sans: var(--font-inter)` dan `--font-heading: var(--font-display)`. Token `ink`/`sand`/`ember` dipertahankan. `shadcn` & `tw-animate-css` dipindah ke `devDependencies` sesuai registry (lockfile sinkron). Validasi tanpa komponen dummy: `pnpm exec shadcn info` exit 0, "No components installed". Verifikasi: `pnpm lint` ✅, `pnpm exec tsc --noEmit` ✅, `pnpm format:check` ✅, `pnpm build` ✅; Playwright 360/390/768/1024/1440/1920 px tanpa overflow horizontal; body=Inter, `.font-display`/`.display-xl`=Anton. Blocker DoD: review/merge ke branch utama belum dilakukan (tidak ada commit atas permintaan).

## Task 3: Validasi binding dan preview OpenNext (E0-3; 5 SP)

**Files:** Inspect/modify only if necessary `wrangler.jsonc`, `open-next.config.ts`, `next.config.ts`; regenerate `cloudflare-env.d.ts` via `pnpm cf-typegen` if bindings change.

**Interfaces:** Produces Worker dengan `BAREN_ASSETS`, `NEXT_INC_CACHE_R2_BUCKET`, `IMAGES`, `ASSETS`; E0-5/6 memakai konfigurasi ini. R2 cache `baren-opennext-cache` berbeda dari aset aplikasi `baren-assets`.

- [x] **Step 1: Setelah E0-1 `Done`, tandai E0-3 `In Progress`.** Periksa config saat ini: dua R2 bucket, `IMAGES`, `ASSETS`, dan self-reference sudah ada. Jangan mengganti config tanpa reproduksi kegagalan.
- [x] **Step 2: Jalankan `pnpm exec opennextjs-cloudflare build`, lalu `pnpm exec opennextjs-cloudflare preview` pada terminal terpisah.** Tunggu pesan listening; pada terminal lain jalankan `curl -i http://localhost:8787/api/health` (sesuaikan port yang dicetak). Perbaiki binding/config hanya bila preview gagal; untuk bucket preview lokal, cek dukungan simulasi lokal Wrangler, jangan menaruh kredensial produksi di repo.
- [x] **Step 3: Periksa `pnpm cf-typegen` dan typecheck.** Jika perlu perubahan binding, regenerasi `cloudflare-env.d.ts` dan pastikan nama binding cocok. Verifikasi `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm format:check`, `pnpm build`. Catat output preview dan status E0-3; commit hanya jika diminta.

> **Hasil 2026-10-15:** Tidak ada perubahan config (tidak ada kegagalan binding). `pnpm exec opennextjs-cloudflare build` sukses (`Worker saved in .open-next/worker.js`). `pnpm exec opennextjs-cloudflare preview` di `http://localhost:8787`; `curl --fail-with-body -i http://localhost:8787/api/health` → HTTP/1.1 200 OK, `content-type: application/json`, body `{"ok":true,"service":"baren"}`. Beranda runtime Worker 200 (title `BAREN | Rebut benteng. Kuasai arena.`, font Inter, tanpa overflow 360px). Binding lokal terhubung: `BAREN_ASSETS` & `NEXT_INC_CACHE_R2_BUCKET` (R2 local), `IMAGES`, `ASSETS`, `WORKER_SELF_REFERENCE` `[connected]`. `pnpm cf-typegen` regen sukses dan binding cocok (file `cloudflare-env.d.ts` tracked; dikembalikan ke baseline karena binding tidak berubah). `pnpm lint` ✅, `pnpm exec tsc --noEmit` ✅, `pnpm format:check` ✅, `pnpm build` ✅. Blocker DoD: review/merge ke branch utama belum dilakukan (tidak ada commit atas permintaan).

## Task 4: Verifikasi Neon + Drizzle di runtime (E0-4; 3 SP)

**Files:** Inspect/modify if needed `src/db/index.ts`, `drizzle.config.ts`, `.dev.vars.example`, `README.md`.

**Interfaces:** Existing `getDb(url?: string): Db` dari `src/db/index.ts` memakai `neon(databaseUrl)` dan `drizzle(sql, { schema })`. E1 membangun skema/migrasi di atas kontrak ini.

- [x] **Step 1: Setelah E0-1 `Done`, tandai E0-4 `In Progress`.** Uji tanpa env: `getDb()` harus melempar `NEON_DATABASE_URL is not set`; lakukan self-check sementara dengan runner TS yang sudah tersedia atau satu uji kecil bila setup test memang tersedia. Jangan menambah dependensi test hanya untuk ini.
- [ ] **Step 2: Bila pemilik menyediakan kredensial Neon nonproduksi, simpan di `.dev.vars` yang di-ignore, jalankan query read-only `SELECT 1` melalui `getDb()` di runtime Worker atau skrip sementara yang tidak dicommit, lalu pastikan berhasil.** Contoh ekspresi Drizzle untuk cek yang benar-benar mengirim kueri:

```ts
import { sql } from "drizzle-orm";
import { getDb } from "./src/db";

const result = await getDb(process.env.NEON_DATABASE_URL).execute(
  sql`select 1 as ok`,
);
if (result.rows[0]?.ok !== 1) throw new Error("Neon smoke test gagal");
```

Jangan menganggap `getDb()` membuat koneksi saat pemanggilan: query diperlukan untuk membuktikan koneksi. Jangan buat tabel E1 atau jalankan `db:push` untuk smoke test E0. Jika tidak ada kredensial, catat E0-4 terblokir; jangan menandainya `Done`.

- [x] **Step 3: Verifikasi lint/typecheck/format/build**, lalu status dan log sesuai bukti. Commit hanya jika diminta.

> **Hasil 2026-10-15 (sebagian — Blocked pada Step 2):** Step 1 lolos: `getDb()` tanpa env melempar `NEON_DATABASE_URL is not set` (diuji dengan bundle esbuild sementara di `/tmp`, tidak dicommit; tidak menambah dependensi test). Step 2 **terblokir**: tidak ada kredensial Neon nonproduksi (`NEON_DATABASE_URL`) di `.dev.vars`, environment, maupun CI, sehingga kueri read-only `SELECT 1` melalui `getDb()` belum dapat dibuktikan; E0-4 **tidak** ditandai `Done`. Step 3: `pnpm lint` ✅, `pnpm exec tsc --noEmit` ✅, `pnpm format:check` ✅, `pnpm build` ✅. Tindak lanjut: pemilik menyediakan `NEON_DATABASE_URL` nonproduksi di `.dev.vars` (ter-ignore) untuk menjalankan smoke test.

## Task 5: Dokumentasi rahasia dan operasi (E0-5; 2 SP; NFR-MNT-01)

**Files:** Modify `.dev.vars.example`, `.gitignore` only if needed, `README.md`, `docs/TASK_BREAKDOWN.md`.

**Interfaces:** Consumes binding dari E0-3. Produces nama env contoh `NEON_DATABASE_URL`, `R2_PUBLIC_URL`, `NEXTJS_ENV`; tambah `AUTH_SECRET`/Google OAuth/R2 API secret sebagai placeholder hanya ketika E2/E4/E11 memerlukannya, tanpa nilai nyata.

- [x] **Step 1: Setelah E0-3 `Done`, tandai E0-5 `In Progress`.** Verifikasi `git check-ignore .dev.vars` dan `git ls-files .dev.vars` (harus ter-ignore, tidak tracked); `.dev.vars.example` tetap tracked.
- [x] **Step 2: Ganti README create-next-app dengan perintah instal (`pnpm install`), contoh konfigurasi `.dev.vars`, pembuatan bucket cache/aset, `pnpm dev`, `pnpm preview`, `pnpm deploy`, dan prosedur secret untuk tiap rahasia runtime yang digunakan.** Contoh perintah tanpa nilai kredensial:

```bash
pnpm exec wrangler r2 bucket create baren-assets
pnpm exec wrangler r2 bucket create baren-opennext-cache
pnpm exec wrangler secret put NEON_DATABASE_URL
```

Jelaskan bahwa file contoh berisi placeholder, bukan kredensial; akses HTTPS/redirect produksi diverifikasi saat domain tersedia. Jangan membuka isi `.dev.vars` di log.

- [x] **Step 3: Uji langkah lokal tanpa rahasia nyata** (`pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm format:check`, `pnpm build`) dan cek secret produksi hanya jika akses Cloudflare diberikan. Tanpa akses, status tetap belum `Done` jika syarat task mensyaratkan setup produksi; catat blocker. Commit hanya jika diminta.

> **Hasil 2026-10-15 (sebagian — Blocked pada provisioning produksi):** Step 1 lolos: `.dev.vars` ter-ignore (`.gitignore:48` `.dev.vars*`), `git ls-files .dev.vars` kosong; `.dev.vars.example` tracked. Step 2 selesai: README ditambah bagian "Cloudflare setup" (buat bucket `baren-assets`/`baren-opennext-cache`, `wrangler secret put NEON_DATABASE_URL`/`R2_PUBLIC_URL`, penjelasan placeholder, larangan menaruh nilai nyata). Step 3: `pnpm lint` ✅, `pnpm exec tsc --noEmit` ✅, `pnpm format:check` ✅, `pnpm build` ✅. Akses Cloudflare tersedia (`wrangler whoami` = akun Temutixindonesia), tetapi Worker `baren` belum di-deploy (`wrangler secret list` → "Worker baren not found") dan tidak ada nilai rahasia produksi, sehingga provisioning secret produksi (syarat NFR-SEC-06) **belum terbukti**; E0-5 tetap `Blocked`.

## Task 6: Health smoke test, CI, dan penutupan E0 (E0-6 3 SP; E0-7 2 SP)

**Files:** Existing `src/app/api/health/route.ts`; Create `.github/workflows/ci.yml`; Modify `docs/TASK_BREAKDOWN.md`.

**Interfaces:** `/api/health` GET mengembalikan JSON `{ "ok": true, "service": "baren" }`; CI berjalan untuk push/PR dengan pnpm versi `packageManager`, lint, typecheck, format check, build. Endpoint health tidak menguji database agar pemeriksaan liveness tetap independen dari Neon.

- [x] **Step 1: Setelah E0-3 `Done`, tandai E0-6 `In Progress`.** Reproduksi kegagalan smoke sebelumnya: tidak ada bukti HTTP preview. Jalankan `pnpm preview` dan cek `curl --fail-with-body -i http://localhost:8787/api/health`; pastikan 200, `content-type` JSON, body `ok: true`, `service: baren`. Jika preview gagal karena instalasi/binding, perbaiki akar masalah di E0-3 lalu ulang. Tandai E0-6 `Done` setelah review/DoD dan catat bukti.
- [x] **Step 2: Setelah E0-1 `Done`, tandai E0-7 `In Progress`.** Buat `.github/workflows/ci.yml` dengan trigger `push` dan `pull_request`, `actions/checkout`, `pnpm/action-setup` sesuai `packageManager`, `actions/setup-node` dengan cache pnpm, lalu jalankan:

```yaml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm exec tsc --noEmit
      - run: pnpm format:check
      - run: pnpm build
```

- [ ] **Step 3: Verifikasi lokal** dengan urutan yang sama; pastikan workflow terbaca GitHub Actions dan run benar-benar hijau sebelum menandai E0-7 `Done`. Untuk setiap task yang selesai, isi catatan tanggal + bukti, tambahkan log terbaru di §4, lalu hitung E0 `Progress = SP Done / 21 × 100%`. Jalankan ulang `pnpm preview` dan health setelah perubahan akhir. Jangan mengklaim E0 tuntas jika koneksi Neon/secret/review/merge/CI masih terblokir. Commit hanya jika diminta.

> **Hasil 2026-10-15 (sebagian):** E0-6 `Done`: `pnpm preview` di :8787; `curl --fail-with-body -i /api/health` → HTTP 200, `content-type: application/json`, body `{"ok":true,"service":"baren"}` (assert ok:true & service:baren PASS); route health tidak menyentuh DB. E0-7 `In Progress`: `.github/workflows/ci.yml` dibuat (push/PR; checkout, pnpm/action-setup, setup-node 22 + cache pnpm; install --frozen-lockfile, lint, tsc, format:check, build); verifikasi lokal dengan urutan CI lolos (install/lint/tsc/format/build ✅). **Belum**: workflow terbaca & run hijau di GitHub Actions (butuh push ke remote; tidak ada commit atas permintaan), sehingga E0-7 belum `Done`. E0 keseluruhan **belum tuntas**: E0-4 (Neon), E0-5 (secret produksi), E0-7 (CI run) masih terblokir; Progress E0 = 14/21 = 67%.

## Review sebelum eksekusi

- Versi Next.js 16 sudah disetujui dan disinkronkan pada PRD, SRS, dan task E0-1; lanjutkan setup tooling tanpa migrasi framework.
- Kredensial Neon, akun Cloudflare, domain HTTPS, dan run GitHub Actions perlu akses eksternal; simpan status `Todo`/`In Progress` dengan blocker jujur sampai bukti tersedia.
- SRS `C-06` presigned upload dan E1 skema/migrasi bukan pekerjaan E0; jangan perluas `src/app/api/assets/route.ts` pada rencana fondasi ini.
