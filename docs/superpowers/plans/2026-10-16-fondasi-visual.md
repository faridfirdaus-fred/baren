# Fondasi Visual — E5, E12-1..4/6

> Ikuti [peta worktree](2026-10-16-peta-worktree-baren.md), PRD §7, SRS C-01/02/10, DG-01..10, EI-01, NFR-USE-01/ACC-01. Tiap task baru aktif jika `Dep` di breakdown sudah `Done` di main; status, DoD, log/progress menurut §4–5. Baca docs Next.js 16 sebelum edit layout/metadata.

**Tujuan:** Token, primitives, layout publik/admin, navigasi inklusif. **File:** `src/app/globals.css` (token), `src/app/layout.tsx`, `src/app/(site)/layout.tsx`, `src/app/admin/layout.tsx`, `src/components/site/site-header.tsx`, `site-footer.tsx`, CTA/kartu shared yang sudah ada atau baru di `src/components/`. Jangan edit `src/app/(site)/page.tsx`/`hero.tsx` (Publik), atau admin login/CMS page. Komponen UI statis dari baseline dapat dipakai ulang; jaga tampilan yang bekerja, ubah hanya untuk requirement.

## Langkah

- [x] **E12-1** (Dep E0-2): audit warna `ink/sand/ember` baseline, definisikan dark palette BAREN dan token semantik untuk latar/teks/aksen/border/fokus; periksa kontras teks normal ≥4.5:1 dan elemen besar ≥3:1. Jangan salin logo/asset Valorant. Catat token agar worktree lain mengonsumsi satu sumber.
- [x] **E5-1** (Dep E0-2): layout situs publik dengan header/footer, container, typography, branding fallback Indonesia dan slot untuk nama/logo dinamis E5-2; main landmark dan skip link. Integrasikan token E12-1 setelah task itu `Done` (jangan klaim E12-1 sebagai dep implisit sebelum siap).
- [x] **E5-6** (Dep E0-2): layout admin sidebar/topbar/main, layar kecil dapat menavigasi via keyboard/sentuh, link logout sesuai E2 setelah masuk, jangan membuat halaman admin publik; guard tetap tanggung jawab E2-4. Serahkan boundary layout ke CMS.
- [x] **E12-2** (Dep E12-1): display font + sans isi dan skala responsif dengan font yang sudah tersedia (`Inter`/`Anton` bila cocok), fallback dan line-height terbaca; uji 360/768/1920 dan zoom 200%.
- [x] **E12-3** (Dep E12-1): reuse `src/components/site/cta-button.tsx` atau buat satu primitive; style uppercase/geometris, hover/focus-visible/disabled, elemen button vs link semantik. Serahkan props/states ke Publik dan CMS.
- [x] **E12-4** (Dep E12-1): primitive kartu/overlay untuk berita/fitur/galeri, rasio media konsisten, teks tetap terbaca saat gambar gagal; styling tanpa abstraksi data konten. Serahkan antarmuka ke Publik.
- [ ] **E5-2** (Dep E3-2): ambil `site_settings` untuk logo, favicon, nama game di layout/header/footer/metadata yang relevan; fallback bila kosong dan pastikan perubahan admin muncul ≤60 detik dengan E3-10. Jangan menjalankan query DB di komponen klien tanpa alasan; koordinasi E9-5 metadata. **TERBLOKIR 2026-10-16: E3-2 masih Todo — slot branding + fallback sudah disiapkan di header/footer/layout, implementasi DB menunggu API.**
- [x] **E5-3** (Dep E5-1): sticky nav anchor ke ID seksi yang disepakati Publik, smooth scroll + offset sticky, `prefers-reduced-motion`; uji navigasi keyboard dan fokus anchor.
- [x] **E5-4** (Dep E5-1): menu lipat <768 px dengan `aria-expanded`, label Indonesia, fokus, Escape, scroll lock bila drawer modal dan link menutup menu; cek viewport kecil.
- [x] **E5-5** (Dep E5-1): audit 360–1920 px tanpa horizontal overflow di layout/header/footer termasuk menu, potret/landscape, zoom; perbaiki pada pemilik file terkait. Pekerjaan seksi publik lanjutan diaudit lagi di E12-8/E9-3.
- [x] **E12-6** (Dep E5-3, E12-1): header transparan di hero lalu solid saat scroll, teks/fokus tetap kontras di kedua keadaan; mobile menu tak tertutup hero, JS minimum dan reduced motion.

**Kontrak serah:** warna/font/primitives, ID anchor, lokasi slot akun header, role nav/layout admin dan fallback branding dicatat dalam PR integrasi. `src/components/site/site-header.tsx` tetap milik Fondasi; untuk E11-4 Publik mengirim child `AccountMenu`/slot dan integrator memasangnya setelah kedua sisi merge.

**Verifikasi:** `pnpm lint && pnpm exec tsc --noEmit && pnpm format:check && pnpm build`; viewport 360/768/1920, keyboard/mobile menu, kontras, tanpa gulir horizontal. Bila E5-2 belum siap, jangan blokir task visual yang tidak bergantung padanya.
