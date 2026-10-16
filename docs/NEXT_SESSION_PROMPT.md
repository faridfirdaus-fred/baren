# Prompt Next Session: Lanjutan Implementasi BAREN Web

## Konteks Session Sebelumnya (2026-10-17)

Session produktif, 3 epik selesai 100%:

- ✅ **E1 (Skema DB):** 75% → 100% — migrasi 0001/0002 applied via psql
- ✅ **E3 (API & Validasi):** 82% → 100% — landing_cards & comments API verified
- ✅ **E6 (Situs Publik Utama):** 30% → 100% — GameFeatures CMS + hardcoded sections removed
- ✅ E10-7 Done: README lengkap (setup, deployment, rollback)
- ✅ 7 commits pushed: 975755d, f300867, 6941b03, a12ce6b, f526adb, 7fcbc79
- ✅ Total: 33 SP delivered

## Status Proyek Saat Ini

Branch: `main` (clean, synced dengan origin)

**Progress Epik:**

- E0..E6: Done 100% ✅
- E7: 29% (situs publik — konten tambahan)
- E8: 100% ✅ (panel admin)
- E9: 29% (mutu/audit)
- E10: 24% (testing/UAT/deploy) — naik dari 14%
- E11: 64% (wishlist/OAuth)
- E12: 58% (design system)
- E13: 0% (komentar landing)

**Task Todo:** ~15 task tersisa (E7, E9, E10, E11, E12, E13)

## Milestone Achieved

🎉 **6 dari 14 epik selesai 100%:**
E0 (Fondasi), E1 (DB), E2 (Auth), E3 (API), E4 (R2), E5 (UI/Layout), E6 (Situs Publik Utama), E8 (Admin CMS)

## Plan Tersisa (4 plan aktif)

Di `docs/superpowers/plans/`:

1. **2026-10-16-situs-publik.md** (E7 tersisa)
   - ✅ E6-1..9: Semua Done atau superseded
   - 🔲 E7-1 (paginasi news 9) — SUPERSEDED, E7-2 DITUNDA
   - 🔲 E7-3, E7-4, E7-5, E7-6 — lihat detail plan
   - 🔲 E11-4..6, E12-5/7/8 — audit/wishlist UI

2. **2026-10-16-mutu.md** (E9)
   - 🔲 E9-1: Lighthouse mobile LCP ≤3s, Performance ≥80 (Dep: E6 ✅, E7)
   - ✅ E9-2: next/image + R2 loader — Done
   - 🔲 E9-3: Audit aksesibilitas skor ≥90 (Dep: E6 ✅, E7)
   - 🔲 E9-4: Uji kegunaan 3 admin ganti logo ≤5 menit (Dep: E8-2 ✅)
   - ✅ E9-5: SEO metadata/sitemap/robots — Done
   - 🔲 E11-10: Uji Google OAuth (butuh kredensial)

3. **2026-10-16-rilis.md** (E10)
   - ✅ E10-1: Uji FR-PUB-01..25 — Done (Playwright E2E)
   - 🔲 E10-2: Uji FR-ADM-01..30 (admin CRUD, upload, waitlist CSV)
   - 🔲 E10-3: Uji keamanan (401/403, presigned URL expire, password hash)
   - 🔲 E10-4: Uji browser (Chrome, Firefox, Safari mobile/desktop)
   - 🔲 E10-5: UAT mitra (3 persona, feedback form)
   - 🔲 E10-6: Deploy staging + produksi (domain, HTTPS, rollback test)
   - ✅ E10-7: Dokumentasi & README — Done
   - 🔲 E10-8: Handover (checklist operasional, contact support)

4. **2026-10-16-peta-worktree-baren.md**
   - Dokumen strategi, bukan plan implementasi

**Archived:** `2026-10-16-cms-waitlist.md` (semua Done/superseded)

## Rekomendasi Prioritas Next Session

**Opsi 1 — E7 (Situs Publik Tambahan):** ⭐ Recommended
- Selesaikan E7 sisa di `2026-10-16-situs-publik.md`
- E7-3 (FAQ UI publik), E7-4 (download), E7-5 (kontak), E7-6 (footer)
- Impact: Landing page lengkap untuk visitor, unblock E9-1/3 (audit)
- Estimasi: ~10-15 SP
- Blocker: Tidak ada, semua dep Done

**Opsi 2 — E9 (Mutu/Audit yang unblocked):**
- E9-4: Uji kegunaan 3 admin ganti logo (butuh user riil)
- E9-2 sudah Done, E9-5 sudah Done
- E9-1/3 blocked sampai E7 selesai
- Impact: Validasi kualitas admin panel
- Estimasi: ~2 SP (E9-4 saja)

**Opsi 3 — E10 (Testing & Deploy):**
- E10-2 (uji admin CRUD lengkap)
- E10-3 (uji keamanan 401/403/presigned URL)
- E10-4 (uji browser cross-platform)
- Impact: Pre-UAT validation
- Estimasi: ~8-10 SP
- Blocker: Butuh env prod untuk E10-3 (staging HTTPS)

**Opsi 4 — E11 (OAuth Google):**
- E11-10: Setup Google OAuth kredensial + uji alur wishlist
- Impact: Wishlist feature lengkap
- Estimasi: ~3 SP
- Blocker: Butuh Google Cloud project + kredensial

## Instruksi Eksekusi

```bash
# Verifikasi status awal
git status
git log --oneline -5
grep "| Todo" docs/TASK_BREAKDOWN.md

# Pilih plan prioritas
cat docs/superpowers/plans/2026-10-16-situs-publik.md  # E7
# atau
cat docs/superpowers/plans/2026-10-16-mutu.md          # E9
# atau
cat docs/superpowers/plans/2026-10-16-rilis.md         # E10
```

Pola kerja:
1. Baca `docs/TASK_BREAKDOWN.md` untuk status terkini
2. Pilih 1 plan, identifikasi task Todo yang unblocked
3. Untuk setiap task:
   - Update TASK_BREAKDOWN status → In Progress
   - Implementasi (TDD jika perlu)
   - Verify: `pnpm lint && pnpm build`
   - Commit per task logis
   - Update status → Done + Log Progress
4. Arsipkan plan jika semua task Done
5. Push ke origin/main

## Catatan Penting

- **E6 100% Done:** GameFeatures CMS, LandingCards fleksibel, HowToPlay dari DB, hardcoded sections removed
- **E1, E3 100% Done:** Migrasi 0001/0002 applied, landing_cards + comments tables verified
- **Database migrations:** 0001 (landing_cards, comments), 0002 (waitlist→wishlist) sudah applied via psql
- **E7-2 (news detail page):** DITUNDA, bukan dibatalkan — sitemap tidak include `/news/[slug]` sampai E7-2 dikerjakan
- **E9-1, E9-3:** Blocked sampai E7 selesai (butuh landing lengkap untuk audit)
- **E11-10:** Butuh Google OAuth credentials dari Google Cloud Console

## Verifikasi Awal Next Session

Expected state:
- Clean tree, branch `main`
- Last commit: 7fcbc79 (docs: update plan situs-publik with E6 completion checkmarks)
- E0..E6, E8: 100% Done
- E7: 29% (6/21 SP)
- E9: 29% (6/21 SP)
- E10: 24% (5/21 SP)

---

**Mulai dengan:** "Lanjut implementasi BAREN. Prioritas: selesaikan E7 untuk unblock E9 audit, atau pilih E10 testing."
