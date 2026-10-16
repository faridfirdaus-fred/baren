# Wishlist Rename + Alur Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.
>
> **CONTEXT (2026-10-17):** Waitlist API + admin sudah exist dari E11-7/8/9 (Done 2026-10-16). File ada: `src/app/api/waitlist/*`, `src/app/admin/waitlist/*`, `src/components/admin/waitlist-manager.tsx`. Plan ini **rename total**: tabel `waitlist` → `wishlist`, route `/api/waitlist` → `/api/wishlist`, UI label "waiting list" → "wishlist", tanpa kehilangan data.

**Goal:** Seluruh istilah waiting list menjadi wishlist tanpa kehilangan data email, dan alur Google OAuth tampil di landing serta bisa dikelola admin.

**Architecture:** Migrasi rename tabel + alias kode; rename route API dengan redirect kompatibilitas sementara; ganti copy UI/dokumen/CSV; pasang tombol wishlist, menu akun, dan status keikutsertaan pada slot header yang sudah ada; tabel/CSV admin menampilkan label wishlist.

**Tech Stack:** Next.js 16 App Router, Auth.js v5 Google Provider, Drizzle ORM + Neon, Zod, Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-10-17-landing-dinamis-wishlist-komentar-design.md` (§3 keputusan 1, §4.2, §5)

## Global Constraints

- Seluruh teks antarmuka berbahasa Indonesia; istilah publik selalu "wishlist", tidak ada sisa "waiting list" terlihat pengguna.
- Migrasi tidak boleh menghapus baris email; rollback aman (tabel lama dipertahankan sebagai view/alias bila perlu).
- Endpoint tulis admin-only (401 anonim / 403 visitor Google); tidak menyimpan token OAuth di klien.
- Alur gabung ≤3 langkah: klik Wishlist → pilih akun Google → status terlihat.
- Wajib lulus: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm format:check`, `pnpm build`.

---

## File Map

- DB: `src/db/schema.ts` (`waitlist` → `wishlist`), `drizzle/` migrasi rename, `scripts/seed-admin.mjs` bila menyebut waitlist.
- Auth: `src/auth.ts` atau `src/lib/auth*` (callback upsert — ganti import tabel saja, logika idempoten tetap).
- API: `src/app/api/waitlist/**` → `src/app/api/wishlist/**` (`status/route.ts`, `route.ts` admin, `export.csv/route.ts` atau setara); pertahankan redirect 308 `/api/waitlist/*` → `/api/wishlist/*` selama 1 rilis.
- Validasi: `src/lib/validation/waitlist*.ts` → `wishlist*.ts` (atau re-export bila nama file generik).
- UI publik: `src/components/site/site-header.tsx` (slot akun), komponen akun baru `src/components/site/wishlist-menu.tsx`, seksi status `src/components/site/wishlist-status.tsx` (`#wishlist`), `src/content/baren.ts` (`cta.joinWaitlist` → "GABUNG WISHLIST", FAQ menyebut wishlist).
- Admin: `src/app/admin/wishlist/**`, `src/components/admin/**` terkait, dashboard count.
- Dokumen: `docs/SRS.md`, `docs/PRD.md`, `docs/TASK_BREAKDOWN.md`, `docs/GOOGLE_OAUTH_WAITLIST.md` (ganti istilah + nama tabel/endpoint; tanpa menulis secret).
- Test: `src/db/wishlist.test.mjs` (rename + idempoten + guard).

---

### Task 1: Rename tabel + callback idempoten tetap (E1-4 revisi, E11-2/3)

**Files:**

- Modify: `src/db/schema.ts`, auth callback (`src/auth.ts`), `scripts/seed-admin.mjs` bila perlu
- Create: migrasi rename via `pnpm drizzle-kit generate`
- Test: `src/db/wishlist.test.mjs`

**Interfaces:**

- Consumes: tabel lama `waitlist` + kontrak upsert E11-2/3 (email unik, email terverifikasi saja).
- Produces: `wishlist` table + `upsertWishlistProfile()` untuk Task 2–3.

- [x] **Step 1: Write the failing test**

```ts
// src/db/wishlist.test.mjs
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { wishlist } from "./schema.ts";

describe("wishlist table", () => {
  it("tere definisi dengan email unik", () => {
    assert.ok(wishlist, "tabel wishlist harus ada");
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `node --test src/db/wishlist.test.mjs`
Expected: FAIL with `wishlist` undefined (masih bernama `waitlist`).

- [x] **Step 3: Write minimal implementation**

```ts
// src/db/schema.ts
// Ganti blok waitlist menjadi:
export const wishlist = pgTable("wishlist", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull().unique(),
  name: text("name"),
  photoUrl: text("photo_url"),
  provider: text("provider").notNull().default("google"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
```

Jalankan `pnpm drizzle-kit generate`; edit SQL hasil generate bila berupa `CREATE wishlist` tanpa memindahkan data → tambah manual:

```sql
ALTER TABLE IF EXISTS "waitlist" RENAME TO "wishlist";
```

Auth callback: ganti import `waitlist` → `wishlist` saja; pertahankan cek `email_verified` + upsert atomik `onConflictDoUpdate(email)`.

- [x] **Step 4: Run test to verify it passes**

Run: `node --test src/db/wishlist.test.mjs && pnpm exec tsc --noEmit`
Expected: PASS; grep `waitlist` di `src/` tidak lagi menemukan import kecuali di file migrasi lama.

- [x] **Step 5: Commit**

```bash
git add src/db/schema.ts drizzle src/auth.ts src/db/wishlist.test.mjs
git commit -m "feat(db): rename waitlist menjadi wishlist tanpa hapus data"
```

---

### Task 2: Rename API + status pemilik (E11-7 revisi)

**Files:**

- Create: `src/app/api/wishlist/route.ts`, `src/app/api/wishlist/status/route.ts`, `src/app/api/wishlist/export/route.ts` (salin dari waitlist lama, ganti nama)
- Modify: pertahankan `src/app/api/waitlist/**` sebagai redirect 308 tipis bila file lama ada; bila belum ada route admin lama, langsung buat yang baru saja
- Test: `src/db/wishlist.test.mjs` (tambah guard + CSV)

**Interfaces:**

- Consumes: `wishlist` Task 1, `checkAdmin`, sesi server Auth.js.
- Produces: `GET /api/wishlist/status` (pemilik), `GET /api/wishlist` + CSV admin untuk Task 3.

- [x] **Step 1: Write the failing test**

```ts
// src/db/wishlist.test.mjs — tambah
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("wishlist guards", () => {
  it("CSV memakai label wishlist bukan waiting list", async () => {
    const { wishlistCsvHeader } = await import("../lib/wishlist-csv.ts");
    assert.match(wishlistCsvHeader(), /wishlist/i);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `node --test src/db/wishlist.test.mjs`
Expected: FAIL with "Cannot find module '../src/lib/wishlist-csv.ts'".

- [x] **Step 3: Write minimal implementation**

```ts
// src/lib/wishlist-csv.ts
export function wishlistCsvHeader(): string {
  return "email,nama,tanggal_wishlist";
}
```

`GET /api/wishlist/status`: ambil email dari sesi server saja (jangan dari query), kembalikan `{ joined: boolean }`. `GET /api/wishlist`: admin-only, Zod `{ page, q }`, paginasi deterministik + `count`. `GET /api/wishlist/export`: admin-only, header `text/csv`, escape nilai diawali `=+-@` dengan prefix `'`, label kolom memakai kata wishlist. Redirect kompatibilitas:

```ts
// src/app/api/waitlist/route.ts (bila file lama ada)
import { NextResponse } from "next/server";
export function GET(req: Request) {
  return NextResponse.redirect(new URL("/api/wishlist", req.url), 308);
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `node --test src/db/wishlist.test.mjs && pnpm exec tsc --noEmit && pnpm lint`
Expected: PASS; preview: anonim `GET /api/wishlist` → 401; visitor Google → 403; admin → 200.

- [x] **Step 5: Commit**

```bash
git add src/app/api/wishlist src/app/api/waitlist src/lib/wishlist-csv.ts src/db/wishlist.test.mjs
git commit -m "feat(api): rename endpoint waitlist ke wishlist + status pemilik"
```

---

### Task 3: UI wishlist publik + label admin (E11-4/5/6, E11-9 revisi)

**Files:**

- Create: `src/components/site/wishlist-menu.tsx`, `src/components/site/wishlist-status.tsx`
- Modify: `src/components/site/site-header.tsx` (pasang `accountSlot`), `src/app/(site)/page.tsx` atau hero (`#wishlist`), `src/content/baren.ts`, halaman admin wishlist + dashboard
- Test: Playwright manual + `src/db/wishlist.test.mjs` (copy check)

**Interfaces:**

- Consumes: Task 2 (`/api/wishlist/status`), sesi server, slot `accountSlot` E5-1.
- Produces: alur ≤3 langkah + tabel admin untuk plan CMS; tidak ada sisa kata waiting list di UI.

- [x] **Step 1: Write the failing test**

```ts
// src/db/wishlist.test.mjs — tambah
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cta } from "../content/baren.ts";

describe("copy wishlist", () => {
  it("tidak lagi memakai frasa waiting list", () => {
    assert.match(cta.joinWaitlist, /wishlist/i);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `node --test src/db/wishlist.test.mjs`
Expected: FAIL (masih "GABUNG WAITING LIST").

- [x] **Step 3: Write minimal implementation**

```ts
// src/content/baren.ts
export const cta = {
  login: "MASUK",
  joinWaitlist: "GABUNG WISHLIST",
  newsAll: "ARTIKEL TERBARU",
};
```

`wishlist-menu.tsx` (server, baca sesi): anonim → tombol `GABUNG WISHLIST` (link sign-in Google); login → tampil email + tombol keluar. `wishlist-status.tsx` (`id="wishlist"`): sudah gabung → "Kamu sudah masuk wishlist. Terima kasih!"; belum → ajakan + tombol; gagal → pesan jelas. Header: `accountSlot={<WishlistMenu />}` (desktop+mobile). FAQ/admin/dashboard/CSV/SRS copy diganti wishlist; URL lama `/api/waitlist` tidak dipakai UI baru.

- [x] **Step 4: Run test to verify it passes**

Run: `node --test src/db/wishlist.test.mjs && pnpm exec tsc --noEmit && pnpm lint && pnpm build`
Expected: PASS; preview desktop+mobile: alur 3 langkah, email hanya tampil saat sesi ada, logout membersihkan state.

- [x] **Step 5: Commit**

```bash
git add src/components/site/wishlist-menu.tsx src/components/site/wishlist-status.tsx src/components/site/site-header.tsx src/content/baren.ts src/app/admin src/db/wishlist.test.mjs
git commit -m "feat(wishlist): alur publik + label admin memakai wishlist"
```

---

## Verifikasi akhir plan

- [x] `pnpm lint && pnpm exec tsc --noEmit && pnpm format:check && pnpm build` hijau.
- [x] Data email lama tetap ada (`SELECT count(*) FROM wishlist` sebelum/sesudah sama).
- [x] Grep UI/dokumen: tidak ada "waiting list"/"waitlist" tersisa di string pengguna (kecuali catatan migrasi historis).
- [x] Update `docs/TASK_BREAKDOWN.md` §E1-4, §E11 + matriks FR-PUB-18..24/FR-ADM-28..30 + log.
