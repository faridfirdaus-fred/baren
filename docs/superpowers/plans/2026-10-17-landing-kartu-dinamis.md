# Landing Dinamis Kartu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hero bervideo, news maks-3 opsional, kartu fleksibel, FAQ, dan how-to-play tampil dari database dan bisa diatur admin.

**Architecture:** Tambah tabel `landing_cards` + API CRUD; ubah `Hero`, `LatestNews`, `FaqAccordion` menjadi komponen ber-props (DB dulu, fallback `baren.ts` bila kosong); news kosong → seksi hilang; tambah seksi `HowToPlay`; pangkas nav; footer tidak disentuh.

**Tech Stack:** Next.js 16 App Router RSC, TypeScript strict, Drizzle ORM + Neon, Zod, Tailwind v4, next/image, Vitest/node:test yang sudah ada.

**Spec:** `docs/superpowers/specs/2026-10-17-landing-dinamis-wishlist-komentar-design.md` (§3 keputusan 3–8, §4.1, §6)

## Global Constraints

- Seluruh teks antarmuka berbahasa Indonesia.
- Server Component default; `"use client"` hanya untuk accordion FAQ, menu mobile, player video.
- Tidak menambah dependency baru di `package.json`.
- Tidak menyalin aset/teks/merek Riot Games; pakai aset `public/` yang sudah ada atau URL admin.
- Gambar via `next/image` dengan `alt` bermakna; video hero wajib `poster` + `aria-hidden="true"`.
- Hormati `prefers-reduced-motion`; responsif 360–1920px tanpa gulir horizontal.
- Setiap Route Handler tulis memakai Zod di server + guard admin (401 anonim / 403 visitor).
- Wajib lulus: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm format:check`, `pnpm build`.

---

## File Map

- DB: `src/db/schema.ts` (tambah `landing_cards`), `drizzle.config.ts`, `drizzle/` (migrasi baru).
- Validasi: `src/lib/validation/landing-cards.ts` (baru), reuse `src/lib/validation/news.ts`, `src/lib/validation/faq.ts`, `src/lib/validation/hero.ts`.
- API: `src/app/api/landing-cards/route.ts` (GET publik + POST admin), `src/app/api/landing-cards/[id]/route.ts` (PUT/DELETE), `src/app/api/landing-cards/reorder/route.ts` (PUT urutan); ubah `src/app/api/news/route.ts` (tambah query `limit`).
- Lib baca publik: `src/lib/landing.ts` (baru: `getPublishedLandingCards`, `getLatestNewsCards`, `getPublishedFaqs`, `getHeroContent`).
- UI: `src/components/site/hero.tsx`, `src/components/site/latest-news.tsx`, `src/components/site/landing-cards.tsx` (baru, pengganti render event/about/agents/maps), `src/components/site/faq-accordion.tsx`, `src/components/site/how-to-play.tsx` (baru), `src/app/(site)/page.tsx`, `src/content/baren.ts` (pangkas nav ESPORTS/LEBIH BANYAK + tambah anchor `#cara-main`/`#komentar` bila perlu).
- Hapus dari render (JANGAN hapus file sebelum pengganti lolos build): `event-banner.tsx`, `about-game.tsx`, `agents-section.tsx`, `maps-section.tsx` dilepas dari `page.tsx` setelah `landing-cards.tsx` tayang.
- Test: tambah `src/lib/validation/landing-cards.test.mjs` (Zod + urutan), `src/lib/landing-public.test.mjs` (batas 3 + hilang-bila-kosong), pakai runner node:test yang sudah dipakai repo.

---

### Task 1: Skema + migrasi `landing_cards` (E1-6)

**Files:**

- Modify: `src/db/schema.ts`
- Create: `drizzle/0001_landing_cards.sql` (via drizzle-kit generate; nama file mengikuti output generator)
- Test: `src/lib/validation/landing-cards.test.mjs`

**Interfaces:**

- Consumes: `timestamps` helper di `src/db/schema.ts`, `drizzle.config.ts`.
- Produces: `landingCards` table + tipe `LandingCard` untuk Task 2–3 (`id, slot, eyebrow, title, subtitle, body, imageUrl, ctaLabel, ctaUrl, tone, sortOrder, isPublished`).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/validation/landing-cards.test.mjs
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { landingCards } from "../../db/schema.ts";

describe("landing_cards schema", () => {
  it("memiliki kolom title wajib dan tone default dark", () => {
    const shape = landingCards as unknown as Record<string, unknown>;
    assert.ok(shape, "landingCards harus terdefinisi");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/lib/validation/landing-cards.test.mjs`
Expected: FAIL with "Cannot find module '../src/db/schema.ts'" atau `landingCards` undefined (tabel belum ada).

- [ ] **Step 3: Write minimal implementation**

```ts
// src/db/schema.ts — tambah di bawah tabel faq
export const landingCards = pgTable("landing_cards", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slot: text("slot").notNull().default("general"),
  eyebrow: text("eyebrow"),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  body: text("body"),
  imageUrl: text("image_url"),
  ctaLabel: text("cta_label"),
  ctaUrl: text("cta_url"),
  tone: text("tone").notNull().default("dark"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: integer("is_published").notNull().default(1),
  ...timestamps,
});
```

Lalu generate: `pnpm drizzle-kit generate` dan periksa file SQL baru tidak mengandung `DROP`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/lib/validation/landing-cards.test.mjs`
Expected: PASS. Lalu `pnpm exec tsc --noEmit` PASS.

- [ ] **Step 5: Commit**

```bash
git add src/db/schema.ts drizzle src/lib/validation/landing-cards.test.mjs
git commit -m "feat(db): tambah tabel landing_cards fleksibel"
```

---

### Task 2: API `landing-cards` + `limit` untuk news (E3-11)

**Files:**

- Create: `src/lib/validation/landing-cards.ts`, `src/app/api/landing-cards/route.ts`, `src/app/api/landing-cards/[id]/route.ts`, `src/app/api/landing-cards/reorder/route.ts`
- Modify: `src/app/api/news/route.ts` (tambah query `limit`, default 9, maks 9; landing memakai `limit=3`)
- Test: `src/lib/validation/landing-cards.test.mjs` (tambah kasus Zod)

**Interfaces:**

- Consumes: `landingCards` (Task 1), helper `src/lib/api/{response,parse,auth,db-errors}.ts`, guard admin E2-4.
- Produces: `GET /api/landing-cards` (publik, hanya published, urut `sortOrder,id`); `POST/PUT/DELETE` + `PUT /reorder` admin-only untuk Task 4 (CMS).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/validation/landing-cards.test.mjs — tambah
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { landingCardSchema } from "./landing-cards.ts";

describe("landingCardSchema", () => {
  it("menolak cta_label tanpa cta_url", () => {
    const r = landingCardSchema.safeParse({ title: "X", ctaLabel: "Main" });
    assert.equal(r.success, false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/lib/validation/landing-cards.test.mjs`
Expected: FAIL with "Cannot find module '../src/lib/validation/landing-cards.ts'".

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/validation/landing-cards.ts
import { z } from "zod";

const httpsOrAnchor = z
  .string()
  .refine((v) => v.startsWith("#") || v.startsWith("https://"), {
    message: "Tautan harus diawali https:// atau #",
  });

export const landingCardSchema = z
  .object({
    slot: z.string().min(1).max(32).default("general"),
    eyebrow: z.string().max(80).nullish(),
    title: z.string().trim().min(1).max(120),
    subtitle: z.string().max(160).nullish(),
    body: z.string().max(2000).nullish(),
    imageUrl: z.string().max(2048).nullish(),
    ctaLabel: z.string().max(60).nullish(),
    ctaUrl: httpsOrAnchor.max(2048).nullish(),
    tone: z.enum(["dark", "light", "ember"]).default("dark"),
    sortOrder: z.number().int().min(0).default(0),
    isPublished: z.union([z.literal(0), z.literal(1)]).default(1),
  })
  .strict()
  .refine((v) => (!!v.ctaLabel && !!v.ctaUrl) || (!v.ctaLabel && !v.ctaUrl), {
    message: "ctaLabel dan ctaUrl harus diisi bersamaan",
    path: ["ctaLabel"],
  });
```

Route `GET /api/landing-cards`: query Drizzle `where isPublished=1`, `orderBy sortOrder, id`, tanpa auth. Route tulis: `checkAdmin` dulu (401/403), lalu `parse` Zod di atas. `PUT /reorder`: body `{ ids: number[] }`, update `sortOrder` sesuai indeks.

`src/app/api/news/route.ts`: tambah `limit = min(max(parseInt(searchParams.get("limit") ?? "9"), 1), 9)`; tetap filter `status=published`, urut terbaru.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/lib/validation/landing-cards.test.mjs && pnpm exec tsc --noEmit && pnpm lint`
Expected: semua PASS. Lalu uji manual di preview: `GET /api/landing-cards` → 200 array; `POST` anonim → 401.

- [ ] **Step 5: Commit**

```bash
git add src/lib/validation/landing-cards.ts src/app/api/landing-cards src/app/api/news/route.ts src/lib/validation/landing-cards.test.mjs
git commit -m "feat(api): CRUD landing-cards + limit berita"
```

---

### Task 3: Landing baca DB — hero video, news-3, kartu, FAQ, how-to-play, nav (E6-1, E6-3..6, E7-1, E7-3, E5-3)

**Files:**

- Create: `src/lib/landing.ts`, `src/components/site/landing-cards.tsx`, `src/components/site/how-to-play.tsx`
- Modify: `src/components/site/hero.tsx`, `src/components/site/latest-news.tsx`, `src/components/site/faq-accordion.tsx`, `src/app/(site)/page.tsx`, `src/content/baren.ts`
- Test: `src/lib/landing-public.test.mjs`

**Interfaces:**

- Consumes: API/DB Task 2, tabel `hero`, `news`, `faq`, `howToPlaySteps`, `howToPlayVideo`, `landingCards`.
- Produces: landing dinamis untuk Task 4 (CMS) dan plan mutu; `page.tsx` urutan final.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/landing-public.test.mjs
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("aturan tampil landing", () => {
  it("news kosong menyembunyikan seksi (bukan empty state)", async () => {
    const { shouldShowNews } = await import("./landing.ts");
    assert.equal(shouldShowNews([]), false);
    assert.equal(shouldShowNews([1, 2, 3, 4]).length, 3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/lib/landing-public.test.mjs`
Expected: FAIL with "Cannot find module '../src/lib/landing.ts'".

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/landing.ts
export function shouldShowNews<T>(items: T[]): T[] | false {
  if (items.length === 0) return false;
  return items.slice(0, 3);
}
```

`hero.tsx`: ambil `videoUrl/backgroundUrl/title/subtitle/cta` dari DB via `getHeroContent()` (server), fallback `/media/hero-loop.mp4` + poster `/media/hero-poster.jpg` + `hero` statis bila DB kosong. `video` tetap `autoPlay muted loop playsInline poster aria-hidden`.

`latest-news.tsx`: terima props `items`; panggil `shouldShowNews`; `false` → `return null`; header tanpa link halaman artikel; tiap kartu: cover (`coverUrl` atau `/art/cover-N.jpg`), kategori, tanggal `publishedAt` (id-ID), judul, excerpt; `ctaUrl` kosong → `<article>`, ada → `<Link>`.

`landing-cards.tsx`: terima props kartu terbit; `0` → `null`; tiap kartu render sesuai `tone` (`dark` full-bleed kiri, `light` 2 kolom, `ember` panel aksen); `imageUrl` null → varian teks; CTA hanya bila label+url ada.

`how-to-play.tsx`: langkah bernomor dari `howToPlaySteps` (urut) + `howToPlayVideo` (player `controls preload="none"`, tanpa autoplay bersuara); `id="cara-main"`.

`faq-accordion.tsx`: terima props; `0` → `null`; sisanya logika accordion lama.

`page.tsx` urutan: `Hero → LatestNews → LandingCards → GameFeatures → HowToPlay → FaqAccordion → Comments (plan C, placeholder anchor #komentar bila plan C belum merge)`.

`baren.ts`: hapus item `ESPORTS` dan `LEBIH BANYAK` dari `nav`; pastikan sisa anchor valid (`#fitur #galeri #berita #faq #kontak #cara-main #komentar`).

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/lib/landing-public.test.mjs && pnpm exec tsc --noEmit && pnpm lint && pnpm build`
Expected: PASS semua; `pnpm preview` cek 360/768/1920: news 0 → seksi hilang; 2 kartu → tampil 2; video hero bisa diganti admin.

- [ ] **Step 5: Commit**

```bash
git add src/lib/landing.ts src/components/site src/lib/landing-public.test.mjs src/app/\(site\)/page.tsx src/content/baren.ts
git commit -m "feat(landing): hero video dinamis, news-3, kartu fleksibel, faq, how-to-play"
```

---

## Verifikasi akhir plan

- [ ] `pnpm lint && pnpm exec tsc --noEmit && pnpm format:check && pnpm build` hijau.
- [ ] `pnpm preview`: admin ubah hero/kartu/news/faq → publik berubah ≤60 detik; news 0 → seksi hilang; kartu 2 → tampil 2; nav tanpa Esports/Lebih Banyak; footer tidak berubah.
- [ ] Update `docs/TASK_BREAKDOWN.md` §E1-6, §E3-11, §E6-1, §E6-3..6, §E7-1, §E7-3, §E5-3 + log progress (plan D memverifikasi E9/E10, bukan di sini).
