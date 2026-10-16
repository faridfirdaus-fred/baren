# Komentar Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Pengunjung login Google dapat berkomentar di satu kolom landing dan komentar langsung tayang; admin dapat menghapus.

**Architecture:** Tabel `comments` + API publik baca/tulis + hapus admin; seksi `#komentar` (daftar terbaru-dulu + form); tanpa antre moderasi, tanpa guest, tanpa balasan; rate limit per user; teks polos 1–500 karakter.

**Tech Stack:** Next.js 16 App Router, Auth.js v5 sesi Google, Drizzle ORM + Neon, Zod, Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-10-17-landing-dinamis-wishlist-komentar-design.md` (§3 keputusan 2, §4.3, §5)

## Global Constraints

- Bahasa Indonesia; tanpa akun tanpa nama (wajib login Google; nama dari profil).
- Komentar langsung tayang; satu-satunya moderasi adalah hapus oleh admin.
- Tulis API: Zod server + guard sesi/peran; daftar publik tidak membocorkan email.
- Tanpa HTML di body (render sebagai teks); tanpa dependency baru.
- Wajib lulus: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm format:check`, `pnpm build`.

---

## File Map

- DB: `src/db/schema.ts` (tambah `comments` + relasi `users.id` cascade), migrasi baru.
- Validasi: `src/lib/validation/comments.ts` (baru: body trim 1..500, tolak HTML tag).
- API: `src/app/api/comments/route.ts` (GET publik + POST visitor), `src/app/api/comments/[id]/route.ts` (DELETE admin), opsional `src/app/api/comments/admin/route.ts` bila daftar admin butuh email (boleh gabung via `?admin=1` guard admin).
- Lib: `src/lib/comments.ts` (baru: `listComments`, `createComment` + rate limit 5/10 menit, `deleteComment`).
- UI: `src/components/site/comments.tsx` (daftar + form, `#komentar`), dipasang di `src/app/(site)/page.tsx` setelah FAQ; admin: tambah aksi hapus di daftar komentar (boleh di halaman wishlist admin atau halaman `admin/komentar` baru).
- Test: `src/lib/validation/comments.test.mjs` (validasi + guard + rate limit).

---

### Task 1: Skema + validasi komentar (E13-1)

**Files:**

- Modify: `src/db/schema.ts`
- Create: `src/lib/validation/comments.ts`, `src/lib/validation/comments.test.mjs`, migrasi via generate
- Test: `src/lib/validation/comments.test.mjs`

**Interfaces:**

- Consumes: `users.id`, `timestamps`.
- Produces: `comments` + `commentBodySchema` untuk Task 2–3.

- [x] **Step 1: Write the failing test**

```ts
// src/lib/validation/comments.test.mjs
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { commentBodySchema } from "./comments.ts";

describe("commentBodySchema", () => {
  it("menolak body kosong dan HTML", () => {
    assert.equal(commentBodySchema.safeParse({ body: "   " }).success, false);
    assert.equal(
      commentBodySchema.safeParse({ body: "<b>halo</b>" }).success,
      false,
    );
    assert.equal(commentBodySchema.safeParse({ body: "Seru!" }).success, true);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `node --test src/lib/validation/comments.test.mjs`
Expected: FAIL with "Cannot find module '../src/lib/validation/comments.ts'".

- [x] **Step 3: Write minimal implementation**

```ts
// src/lib/validation/comments.ts
import { z } from "zod";

export const commentBodySchema = z
  .object({
    body: z
      .string()
      .trim()
      .min(1, "Komentar tidak boleh kosong")
      .max(500, "Maksimal 500 karakter")
      .refine((v) => !/<[a-z][\s\S]*>/i.test(v), "HTML tidak diizinkan"),
  })
  .strict();
```

```ts
// src/db/schema.ts — tambah
export const comments = pgTable("comments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  ...timestamps,
});
```

Generate migrasi, pastikan tanpa `DROP`.

- [x] **Step 4: Run test to verify it passes**

Run: `node --test src/lib/validation/comments.test.mjs && pnpm exec tsc --noEmit`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add src/db/schema.ts drizzle src/lib/validation/comments.ts src/lib/validation/comments.test.mjs
git commit -m "feat(komentar): skema comments + validasi body"
```

---

### Task 2: API komentar + rate limit (E13-2)

**Files:**

- Create: `src/lib/comments.ts`, `src/app/api/comments/route.ts`, `src/app/api/comments/[id]/route.ts`
- Modify: `src/lib/validation/comments.test.mjs` (tambah kasus guard)
- Test: `src/lib/validation/comments.test.mjs`

**Interfaces:**

- Consumes: `commentBodySchema` Task 1, sesi Auth.js, `checkAdmin`.
- Produces: `GET` (publik, `{ id, name, photoUrl, body, createdAt }`, cursor), `POST` (visitor), `DELETE` (admin) untuk Task 3.

- [x] **Step 1: Write the failing test**

```ts
// src/lib/validation/comments.test.mjs — tambah
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("rate limit komentar", () => {
  it("menolak kirim ke-6 dalam 10 menit", async () => {
    const { checkCommentRateLimit } = await import("../comments.ts");
    const now = Date.now();
    const stamps = [0, 1, 2, 3, 4].map((m) => now - m * 60_000);
    assert.equal(checkCommentRateLimit(stamps, now), false);
    assert.equal(checkCommentRateLimit(stamps.slice(1), now), true);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `node --test src/lib/validation/comments.test.mjs`
Expected: FAIL with "Cannot find module '../src/lib/comments.ts'" atau fungsi hilang.

- [x] **Step 3: Write minimal implementation**

```ts
// src/lib/comments.ts
export function checkCommentRateLimit(stamps: number[], now: number): boolean {
  const windowStart = now - 10 * 60_000;
  const recent = stamps.filter((t) => t >= windowStart);
  return recent.length < 5;
}
```

`GET /api/comments`: query `limit` (default 20, maks 50) + `cursor` (id terakhir), join `users` untuk nama/foto saja (tanpa email), urut `id desc`. `POST`: wajib sesi visitor Google; `parse` Zod; hitung 5 kiriman terakhir user 10 menit (query `created_at`); 429 bila lewat; insert lalu kembalikan baris publik. `DELETE /:id`: `checkAdmin`, 401/403, 404 bila tidak ada.

- [x] **Step 4: Run test to verify it passes**

Run: `node --test src/lib/validation/comments.test.mjs && pnpm exec tsc --noEmit && pnpm lint`
Expected: PASS; preview: anonim POST → 401; visitor valid → 201 langsung tampil; ke-6 cepat → 429; admin DELETE → 200.

- [x] **Step 5: Commit**

```bash
git add src/lib/comments.ts src/app/api/comments src/lib/validation/comments.test.mjs
git commit -m "feat(komentar): API daftar-kirim-hapus + rate limit"
```

---

### Task 3: Seksi komentar di landing + hapus admin (E13-3)

**Files:**

- Create: `src/components/site/comments.tsx`
- Modify: `src/app/(site)/page.tsx` (pasang `<Comments />` setelah FAQ), halaman admin terkait
- Test: verifikasi preview + `src/lib/validation/comments.test.mjs` tetap hijau

**Interfaces:**

- Consumes: Task 2 (GET/POST/DELETE), sesi Google, anchor `#komentar`.
- Produces: UI komentar untuk plan CMS/mutu; nav `MEDIA SOSIAL`/`SUPPORT` tidak berubah.

- [x] **Step 1: Write the failing test**

```ts
// src/lib/validation/comments.test.mjs — tambah (kontrak render)
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

describe("seksi komentar", () => {
  it("memiliki anchor #komentar dan ajakan login", () => {
    const src = readFileSync("src/components/site/comments.tsx", "utf8");
    assert.match(src, /id="komentar"/);
    assert.match(src, /Masuk dengan Google/i);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `node --test src/lib/validation/comments.test.mjs`
Expected: FAIL with ENOENT `src/components/site/comments.tsx`.

- [x] **Step 3: Write minimal implementation**

```tsx
// src/components/site/comments.tsx (Server Component + form client terpisah bila perlu)
export function Comments({
  items,
}: {
  items: { id: number; name: string; body: string }[];
}) {
  return (
    <section id="komentar" className="bg-ink py-12 text-sand lg:py-16">
      <div className="container-baren">
        <p className="eyebrow text-ember">Komentar</p>
        <h2 className="display-xl mt-4 text-sand">TANGGAPAN PEMAIN</h2>
        {/* Anonim: <a href="/api/auth/signin/google">Masuk dengan Google untuk berkomentar</a> */}
        {/* Login: form textarea maxlength 500 + tombol Kirim; daftar: nama + body teks + waktu */}
      </div>
    </section>
  );
}
```

Anonim melihat daftar + tombol "Masuk dengan Google untuk berkomentar". Login melihat form (wajib isi, maks 500, error per kolom Indonesia). Kirim sukses → komentar langsung muncul di atas tanpa reload penuh (revalidate). Admin melihat tombol Hapus per item + dialog konfirmasi (reuse pola E8-10).

- [x] **Step 4: Run test to verify it passes**

Run: `node --test src/lib/validation/comments.test.mjs && pnpm exec tsc --noEmit && pnpm lint && pnpm build`
Expected: PASS; preview: kirim sebagai 2 akun berbeda tampil nama masing-masing; admin hapus hilang ≤60 detik.

- [x] **Step 5: Commit**

```bash
git add src/components/site/comments.tsx "src/app/(site)/page.tsx" src/app/admin src/lib/validation/comments.test.mjs
git commit -m "feat(komentar): seksi landing + hapus admin"
```

---

## Verifikasi akhir plan

- [x] `pnpm lint && pnpm exec tsc --noEmit && pnpm format:check && pnpm build` hijau.
- [x] Spam dasar tertahan (429), XSS tidak mungkin (teks polos, tanpa `dangerouslySetInnerHTML`).
- [x] Update `docs/TASK_BREAKDOWN.md` §E13 + matriks + log.
