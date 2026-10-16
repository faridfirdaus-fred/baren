# Prompt Next Session: Lanjutan Implementasi BAREN Web

## Konteks Session Sebelumnya (2026-10-17)

Session panjang, selesai:
- ✅ Plan `2026-10-17-cms-mutu-landing.md` (3 task, 4 commits: 9c55b89, f38811a, 48da9f7, 40d3306)
- ✅ CMS admin UI lengkap: hero, landing-cards, news, how-to-play, comments
- ✅ Dashboard nav + komentar management
- ✅ Mutu audit: sitemap, robots, metadata OG, LAPORAN-MUTU-LANDING-BARU.md, Playwright E2E
- ✅ E8 Done 100% (45 SP), E9 29% (4/14 SP), E10 14% (3/21 SP)
- ✅ Pushed ke `origin/main` (8f4593f..40d3306)

## Status Proyek Saat Ini

Branch: `main` (clean, synced dengan origin)

**Progress Epik:**
- E0..E5: Done 100%
- E6: 30% (situs publik — konten utama)
- E7: 29% (situs publik — tambahan)
- E8: 100% ✅ (panel admin)
- E9: 29% (mutu)
- E10: 14% (testing/UAT/deploy)
- E11: 64% (wishlist/OAuth)
- E12: 58% (design system)
- E13: 0% (komentar landing — belum dikerjakan)

**Task Todo:** 22 task tersisa (dari grep "Todo" TASK_BREAKDOWN.md)

## Plan Tersisa (5 plan)

Di `docs/superpowers/plans/`:

1. **2026-10-16-situs-publik.md**
   - Scope: E6, E7, E11-4..6, E12-5/7/8
   - Catatan: E6-1, E6-3..6 SUPERSEDED → plan lain `2026-10-17-landing-kartu-dinamis.md` (belum exist?)
   - Tersisa: E6-2 (hero publik), E6-7/8 (footer, navigasi), E7 (gallery, FAQ UI publik)

2. **2026-10-16-cms-waitlist.md**
   - Scope: E8, E11-7..9
   - Catatan: E8-3/4/5/7/10/11/12 SUPERSEDED (sudah dikerjakan di session lalu)
   - Tersisa: E8-2 (branding UI — Done), E8-6 (gallery UI — Done), E8-8 (FAQ UI — Done), E8-9 (links UI — Done). **Plan ini mungkin sudah selesai, cek ulang.**

3. **2026-10-16-mutu.md**
   - Scope: E9, E11-10
   - E9: optimasi performa (LCP, Lighthouse), audit aksesibilitas (axe), uji kegunaan
   - E11-10: waiting list (sudah jadi wishlist, mungkin sudah Done)

4. **2026-10-16-rilis.md**
   - Scope: E10-1..8
   - E10-1 Done (Playwright E2E landing)
   - Tersisa: E10-2..8 (uji admin, keamanan, browser, UAT, deployment, docs, handover)

5. **2026-10-16-peta-worktree-baren.md**
   - Dokumen strategi paralel eksekusi, bukan plan implementasi teknis

## Rekomendasi Prioritas Next Session

**Opsi 1 — Situs Publik (E6, E7):**
- Kerjakan `2026-10-16-situs-publik.md`
- Task: E6-2 (hero publik), E6-7/8 (footer, nav), E7-3/4/5 (gallery, FAQ, footer UI publik)
- Impact: Landing page jadi lengkap untuk visitor
- Estimasi: ~15-20 SP

**Opsi 2 — Mutu + Testing (E9, E10):**
- Kerjakan `2026-10-16-mutu.md` + sebagian `2026-10-16-rilis.md`
- Task: E9-1 (Lighthouse audit), E9-3 (axe a11y), E10-2 (uji admin), E10-3 (uji keamanan)
- Impact: Validasi kualitas sebelum UAT/deploy
- Estimasi: ~12-15 SP

**Opsi 3 — Cleanup + Rilis (E10, docs):**
- Audit plan tersisa, arsipkan yang sudah selesai
- Kerjakan E10-2..8 (testing lengkap → UAT → deploy → docs)
- Impact: Proyek siap rilis
- Estimasi: ~18-21 SP

## Instruksi Eksekusi

```
Baca /home/fred-demarco/Development/baren/docs/TASK_BREAKDOWN.md untuk status terkini.

Cek 5 plan di /home/fred-demarco/Development/baren/docs/superpowers/plans/:
- Identifikasi task yang SUPERSEDED/Done (jangan kerjakan ulang)
- Prioritaskan plan dengan task Todo paling banyak
- Pilih 1 plan, baca lengkap, eksekusi task by task dengan pola TDD

Pola kerja:
1. Baca plan + TASK_BREAKDOWN
2. Identifikasi task belum Done
3. Untuk setiap task:
   - Update TASK_BREAKDOWN status → In Progress
   - TDD: test failing → implement → test pass → verify (tsc/lint/build)
   - Commit per task/subtask logis
   - Update TASK_BREAKDOWN status → Done + Log Progress
4. Arsipkan plan setelah semua task Done
5. Push ke origin/main

Jangan duplikasi pekerjaan yang sudah Done di session lalu.
```

## Catatan Penting

- **Session kemarin sudah selesai:** E8 (CMS admin) 100%, shared components (DeleteConfirmDialog, Toast), dashboard nav lengkap, komentar admin, mutu audit baseline
- **Plan `2026-10-17-cms-mutu-landing.md`** sudah di `archive/` — jangan kerjakan lagi
- **E13 (komentar landing)** sudah Done meskipun epik Todo — lihat E13-3 Done di TASK_BREAKDOWN
- **Cek dulu** plan `2026-10-16-cms-waitlist.md` — kemungkinan sudah selesai karena E8 100%

## Verifikasi Awal Next Session

```bash
git status
git log --oneline -5
grep "| Todo" docs/TASK_BREAKDOWN.md | wc -l
ls docs/superpowers/plans/*.md
```

Expected:
- Clean tree, branch `main`
- Last commit: 40d3306 (docs: update TASK_BREAKDOWN)
- 22 task Todo
- 5 plan files

---

**Mulai dengan:** "Lanjut implementasi BAREN. Pilih plan prioritas dari 5 plan tersisa."
