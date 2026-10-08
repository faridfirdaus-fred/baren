# Panduan Agent — BAREN Web

Dokumen ini adalah instruksi kerja untuk agent (AI coding assistant) yang mengerjakan proyek **BAREN Web**. Tujuannya agar proses development tetap terarah dan terdokumentasi.

## 1. Dokumen Sumber (wajib dibaca sebelum bekerja)

| Dokumen | Fungsi |
| --- | --- |
| `docs/PRD.md` | **Kenapa & apa** — visi, persona, ruang lingkup, kebutuhan fungsional/nonfungsional, acuan desain. |
| `docs/SRS.md` | **Spesifikasi detail** — kebutuhan bernomor (FR-*, NFR-*, EI-*, C-*, DG-*) sebagai acuan implementasi & pengujian. |
| `docs/TASK_BREAKDOWN.md` | **Bagaimana & urutannya** — epik, task, estimasi, dependensi, status, dan log progress. |

> **Aturan:** Jangan mulai menulis kode sebelum membaca ketiga dokumen di atas. Setiap pekerjaan harus dapat dipetakan ke minimal satu task di `docs/TASK_BREAKDOWN.md` dan satu kebutuhan di `docs/SRS.md`.

## 2. Alur Kerja Development (WAJIB diikuti)

1. **Baca konteks** — `docs/PRD.md` → `docs/SRS.md` → `docs/TASK_BREAKDOWN.md`.
2. **Pilih task** — ambil task dari `docs/TASK_BREAKDOWN.md`. Pastikan kolom **Dep** (dependency) sudah `Done`. Prioritaskan `P0`.
3. **Tandai mulai** — ubah **Status** task dari `Todo` → `In Progress` di `docs/TASK_BREAKDOWN.md` **sebelum** mulai coding.
4. **Implementasi** — kerjakan sesuai kebutuhan terkait (FR/NFR/EI/DG). Ikuti batasan (C-01..C-10).
5. **Verifikasi** — penuhi seluruh checklist **Definition of Done** (`docs/TASK_BREAKDOWN.md` §5) dan jalankan lint/typecheck/build.
6. **Tandai selesai** — ubah **Status** task menjadi `Done`, isi kolom **Catatan** (tanggal + ringkasan + tautan commit/PR).
7. **Perbarui progress** — perbarui kolom **Progress** pada tabel §1 dan tambahkan entri di **Log Progress** (`docs/TASK_BREAKDOWN.md` §4), terbaru di atas.
8. **Sinkronkan dokumen** — bila scope/desain berubah, perbarui `docs/PRD.md` dan/atau `docs/SRS.md` lebih dulu agar tetap konsisten.

### Format pembaruan status task
Ubah baris tabel task, contoh:

```
| E11-2 | Handler login Google → simpan waitlist | ... | P0 | 5 | E11-1, E1-4 | In Progress | 2026-01-15: mulai implementasi callback |
```
Setelah selesai:
```
| E11-2 | Handler login Google → simpan waitlist | ... | P0 | 5 | E11-1, E1-4 | Done | 2026-01-16: upsert email, commit abc123 |
```

### Format entri Log Progress
```
| 2026-01-16 | E11-2 | Handler login Google menyimpan email ke waitlist (idempoten) | commit abc123 |
```

## 3. Aturan Teknis Proyek

- **Runtime:** seluruh kode server berjalan di Cloudflare Workers. Jangan memakai modul native Node.js (C-04).
- **Database:** semua kueri lewat Drizzle ORM; perubahan skema lewat migrasi drizzle-kit (NFR-MNT-02). Gunakan driver kompatibel Workers (`@neondatabase/serverless`).
- **Validasi:** setiap Route Handler yang menerima input memvalidasi dengan Zod di server (NFR-SEC-02).
- **Otorisasi:** endpoint tulis & penerbitan presigned URL menolak tanpa autentikasi dengan status 401 (NFR-SEC-03).
- **Aset:** unggahan memakai presigned URL ke R2; berkas tidak boleh melewati Workers (C-06).
- **Rahasia:** jangan commit rahasia. Gunakan `wrangler secret` / `.dev.vars` (NFR-SEC-06, C-07). Termasuk kredensial Google OAuth.
- **Bahasa UI:** seluruh teks antarmuka berbahasa Indonesia (C-01).
- **Desain:** mobile-first (C-02), mengikuti pedoman desain C-10 / DG-01..DG-10, aksesibel (NFR-ACC-01).
- **Tautan keluar:** `target="_blank"` + `rel="noopener noreferrer"` (EI-07).
- **Kualitas:** lolos ESLint & Prettier serta `tsc --noEmit` (NFR-MNT-03).

## 4. Fitur Kunci yang Perlu Diperhatikan

- **Mode Waiting List:** game belum dirilis. Pengunjung bergabung via **login Google OAuth**; email disimpan di tabel `waitlist` dan **tidak boleh duplikat** (FR-PUB-20/21, E11).
- **Dua jalur autentikasi:** admin (email+password) dan pengunjung (Google OAuth) melalui Auth.js v5 + Drizzle adapter. Pastikan proteksi rute `/admin` hanya untuk admin.
- **Acuan desain:** tata letak/gaya visual mengacu pada situs VALORANT, **tanpa menyalin aset berhak cipta** (DG-10), lalu disesuaikan dengan branding BAREN.

## 5. Perintah Berguna

```
pnpm dev            # jalankan dev server
pnpm build          # build Next.js
pnpm lint           # ESLint
pnpm preview        # build + preview OpenNext (Cloudflare)
pnpm deploy         # build + deploy ke Cloudflare Workers
pnpm db:generate    # generate migrasi Drizzle
pnpm db:push        # push skema ke Neon
```

---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
