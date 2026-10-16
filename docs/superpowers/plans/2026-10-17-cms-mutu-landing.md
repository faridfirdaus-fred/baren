# CMS + Mutu Landing Baru Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin dapat mengelola hero video, kartu fleksibel, news-3, FAQ, how-to-play, wishlist, dan komentar; landing baru lolos performa, aksesibilitas, dan SEO tanpa halaman detail berita.

**Architecture:** CRUD admin mengikuti pola E8 yang sudah direncanakan (form + uploader R2 + konfirmasi hapus + toast); dashboard menghitung wishlist + komentar; mutu mengaudit ulang LCP/a11y/SEO dengan sitemap tanpa rute berita (E7-2 ditunda); E10 diperbarui untuk cakupan baru.

**Tech Stack:** Next.js 16 App Router, react-hook-form + zodResolver, Tailwind v4 + shadcn/ui, R2 presigned URL, Playwright/Lighthouse/axe.

**Spec:** `docs/superpowers/specs/2026-10-17-landing-dinamis-wishlist-komentar-design.md` (§7–§8)

## Global Constraints

- Bahasa Indonesia di semua form, error per kolom, dan konfirmasi hapus.
- Upload gambar/video hanya via presigned URL R2 (tidak melewati Workers); batas lama berlaku (gambar ≤5MB, video ≤50MB, SVG hanya logo/ikon).
- Endpoint tulis admin-only; perubahan tampil ≤60 detik.
- Responsif 360–1920px; fokus terlihat; reduced motion dihormati.
- Wajib lulus: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm format:check`, `pnpm build`.

---

## File Map

- Admin: `src/app/admin/{hero,landing-cards,news,faq,how-to-play,wishlist,komentar}/**`, `src/components/admin/**` (form, tabel, dialog konfirmasi, toast, drag-drop urutan + alternatif keyboard), `src/app/admin/page.tsx` (dashboard).
- Uploader: reuse E4-2/E4-5/E4-6 (`src/app/api/assets/**`, komponen uploader) — plan ini hanya mengonsumsi, tidak merancang ulang.
- Mutu: `src/app/layout.tsx` metadata, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/(site)/page.tsx` (prioritas hero/LCP), laporan `docs/LAPORAN-MUTU-LANDING-BARU.md` (baru, ringkas).
- Test: Playwright `scripts/test-cms-landing.mjs` (baru, mengikuti pola `scripts/test-admin-account.mjs`), `src/lib/cms-landing.test.mjs` untuk aturan murni (mis. label wishlist, batas news-3).

---

### Task 1: CMS konten landing (E8-3..8 revisi + E8-10/11/12)

**Files:**

- Modify: `src/app/admin/hero/**`, `src/app/admin/landing-cards/**` (baru), `src/app/admin/news/**`, `src/app/admin/faq/**`, `src/app/admin/how-to-play/**` (baru), `src/components/admin/**`
- Test: `src/lib/cms-landing.test.mjs`

**Interfaces:**

- Consumes: API plan A/B/C (`landing-cards`, `news?limit`, `faq`, `how-to-play`, uploader R2).
- Produces: konten terbit untuk Task 2 (dashboard + mutu).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/cms-landing.test.mjs
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

describe("CMS landing baru", () => {
  it("halaman news mengingatkan batas 3 dan tanpa halaman detail", () => {
    const src = readFileSync("src/app/admin/news/page.tsx", "utf8");
    assert.match(src, /maksimal 3/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/lib/cms-landing.test.mjs`
Expected: FAIL with ENOENT `src/app/admin/news/page.tsx` atau teks belum ada.

- [ ] **Step 3: Write minimal implementation**

Hero: edit title/subtitle/videoUrl/backgroundUrl/CTA + preview + validasi URL + simpan (PUT). Landing-cards: tabel urut + tambah/ubah/hapus + toggle terbit + reorder (drag-drop + tombol naik/turun keyboard) + tone selector. News: CRUD + cover + excerpt + tanggal + link opsional + status; helper teks "Hanya 3 terbaru tampil; kosong = seksi hilang; belum ada halaman detail". FAQ: CRUD + urutan. How-to-play: langkah + media opsional + video demo URL. Semua hapus memakai dialog konfirmasi (Escape/batal aman); semua form memakai toast sukses/gagal + error per kolom + loading + pertahankan input saat error.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/lib/cms-landing.test.mjs && pnpm exec tsc --noEmit && pnpm lint`
Expected: PASS; preview Worker: tiap modul CRUD → publik berubah; hapus selalu konfirmasi; URL `http://` ditolak dengan pesan kolom.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin src/components/admin src/lib/cms-landing.test.mjs
git commit -m "feat(cms): kelola hero, kartu, news-3, faq, how-to-play"
```

---

### Task 2: Dashboard + wishlist/komentar admin (E8-1, E11-9, E13-3 revisi)

**Files:**

- Modify: `src/app/admin/page.tsx`, `src/app/admin/wishlist/page.tsx`, daftar komentar admin
- Test: `src/lib/cms-landing.test.mjs` (tambah label check)

**Interfaces:**

- Consumes: Task 1 + `GET /api/wishlist` + CSV + `GET /api/comments?admin=1`.
- Produces: angka + tabel untuk Task 3 (UAT/mutu).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/cms-landing.test.mjs — tambah
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

describe("dashboard baru", () => {
  it("menampilkan wishlist dan komentar, bukan waiting list", () => {
    const src = readFileSync("src/app/admin/page.tsx", "utf8");
    assert.match(src, /wishlist/i);
    assert.match(src, /komentar/i);
    assert.doesNotMatch(src, /waiting list/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/lib/cms-landing.test.mjs`
Expected: FAIL (masih waiting list / belum ada komentar).

- [ ] **Step 3: Write minimal implementation**

Dashboard: hitung `features, gallery_assets, news(published), faq, wishlist, comments` + waktu update terakhir; loading/error/kosong; tanpa fetch sensitif dari klien anonim (server fetch). Wishlist admin: tabel email/nama/tanggal + cari + paginasi + total + ekspor CSV + label wishlist. Komentar admin: daftar + hapus + info akun; tanpa edit body.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/lib/cms-landing.test.mjs && pnpm exec tsc --noEmit && pnpm lint && pnpm build`
Expected: PASS; preview: angka cocok dengan DB; CSV header wishlist; hapus komentar butuh konfirmasi.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/page.tsx src/app/admin/wishlist src/app/admin/komentar src/lib/cms-landing.test.mjs
git commit -m "feat(admin): dashboard wishlist-komentar + tabel admin"
```

---

### Task 3: Mutu + rilis delta (E9-1..5, E10-1..3 revisi; E7-2 ditunda)

**Files:**

- Modify: `src/app/layout.tsx` (metadata), `src/app/sitemap.ts`, `src/app/robots.ts`, hero `priority`/`fetchPriority`
- Create: `docs/LAPORAN-MUTU-LANDING-BARU.md`, `scripts/test-cms-landing.mjs`
- Test: Lighthouse + axe + Playwright 360/768/1920

**Interfaces:**

- Consumes: Task 1–2 + plan A–C selesai.
- Produces: bukti mutu untuk UAT (E10-5) dan deploy; menandai E7-2/E9-5 lama sebagai ditunda di breakdown.

- [ ] **Step 1: Write the failing test**

```bash
# scripts/test-cms-landing.mjs — Playwright: login admin → ubah hero/kartu/news/faq →
# cek publik ≤60 dtk; news 0 → #berita hilang; kartu 2 → tampil 2; komentar kirim+h apus.
node scripts/test-cms-landing.mjs http://localhost:3000
```

Expected awal: FAIL (script belum ada / selektor belum cocok).

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/test-cms-landing.mjs http://localhost:3000`
Expected: FAIL dengan "Cannot find module" atau timeout selektor.

- [ ] **Step 3: Write minimal implementation**

Sitemap: hanya `/` + anchor `#berita #fitur #cara-main #faq #komentar` (tanpa `/news/[slug]` sampai E7-2 dikerjakan). Metadata/OG: judul/deskripsi dinamis + cover hero. Performa: hero `priority`, gambar bawah-fold `lazy`, video `preload="none"` kecuali hero; audit Lighthouse mobile 4G terkendali (LCP ≤3s, Performance ≥80). Aksesibilitas: axe ≥90, alt, keyboard penuh, kontras, zoom 200%, reduced motion. Tulis hasil di `docs/LAPORAN-MUTU-LANDING-BARU.md` (tanggal, build, viewport, metrik, temuan).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm lint && pnpm exec tsc --noEmit && pnpm format:check && pnpm build && node scripts/test-cms-landing.mjs http://localhost:3000`
Expected: PASS semua + laporan terisi angka nyata (bukan asumsi).

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/sitemap.ts src/app/robots.ts docs/LAPORAN-MUTU-LANDING-BARU.md scripts/test-cms-landing.mjs
git commit -m "test(mutu): audit landing baru + sitemap tanpa detail berita"
```

---

## Verifikasi akhir plan

- [ ] Matriks E10-1 (FR-PUB) dan E10-2 (FR-ADM) diperbarui untuk news-3/kartu/wishlist/komentar; E7-2/E9-5 ditandai Ditunda di breakdown.
- [ ] Update `docs/TASK_BREAKDOWN.md` §E8, §E9, §E10 + log.
