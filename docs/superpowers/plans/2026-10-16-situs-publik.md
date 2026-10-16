# Situs Publik — E6, E7, E11-4..6, E12-5/7/8

> ⚠️ **SUPERSEDED SEBAGIAN (2026-10-17):** plan ini digantikan sebagian oleh 4 plan delta + spec `docs/superpowers/specs/2026-10-17-landing-dinamis-wishlist-komentar-design.md`. **JANGAN** kerjakan task bertanda SUPERSEDED di bawah — kerjakan plan penggantinya. Task tanpa tanda tetap berlaku. Urutan: `landing-kartu-dinamis` → `wishlist-rename` → `komentar-landing` → `cms-mutu-landing`.
>
> | Task plan ini                                                              | Status                                      | Pengganti                                                                                                            |
> | -------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
> | E6-1, E6-3..6, E7-3 (bagian dinamis hero/kartu/news-3/FAQ/how-to-play/nav) | SUPERSEDED                                  | `2026-10-17-landing-kartu-dinamis.md` Task 3 (+ E6-9, E5-3)                                                          |
> | E7-1 (paginasi 9), E7-2 (detail `/news/[slug]`)                            | SUPERSEDED (E7-2 DITUNDA, bukan dibatalkan) | `2026-10-17-landing-kartu-dinamis.md` Task 2–3; sitemap tanpa rute berita di `2026-10-17-cms-mutu-landing.md` Task 3 |
> | E11-4..6 (`waitlist`, `AccountMenu`, "waiting list")                       | SUPERSEDED (rename total → `wishlist`)      | `2026-10-17-wishlist-rename.md` Task 1–3 (`wishlist-menu.tsx`, `wishlist-status.tsx`, `/api/wishlist/*`)             |
> | E12-5/7/8 (audit versi lama)                                               | SUPERSEDED SEBAGIAN (kriteria mutu berubah) | `2026-10-17-cms-mutu-landing.md` Task 3 (hero video, sitemap anchor, `LAPORAN-MUTU-LANDING-BARU.md`)                 |
> | E6-2, E6-7/8, E7-4/5/6                                                     | TETAP BERLAKU                               | kerjakan dari plan ini                                                                                               |
>
> Gunakan [peta worktree](2026-10-16-peta-worktree-baren.md), PRD/SRS §3.2, §3.6, EI-01/07 dan breakdown. Tiap task menunggu seluruh ID `Dep` berstatus `Done` di main. UI Indonesia, gambar aksesibel, reduced motion, jangan pakai aset pihak ketiga. Update status/bukti/progress/log sesuai breakdown §4–5. Baca panduan Next.js 16 sebelum page/metadata/cache.

**Tujuan (tersisa):** carousel/gallery/lightbox, download/kontak/tautan-blank, dan penyelesaian visual versi lama yang belum digantikan. Alur daftar memakai istilah **wishlist** (lihat plan `2026-10-17-wishlist-rename.md`). **File:** `src/app/(site)/page.tsx`, `src/components/site/{hero,about-game,game-features,faq-accordion,latest-news,...}.tsx`, komponen seksi baru dan `AccountMenu` terpisah — untuk file yang juga disentuh plan `2026-10-17-*` (`page.tsx`, `hero.tsx`, `latest-news.tsx`, `faq-accordion.tsx`, `baren.ts`), plan baru yang menang bila ada konflik merge. Jangan edit `src/app/(site)/layout.tsx`, header/footer, globals (milik Fondasi); jalur Fondasi memasang slot akun setelah PR kecil terintegrasi. Baseline `src/content/baren.ts` adalah data statis contoh; ganti sumber data per seksi ketika API siap, jangan biarkan data contoh menyamar konten CMS.

## Langkah situs utama (E6-1, E6-3..6 SUPERSEDED → `2026-10-17-landing-kartu-dinamis.md`; E6-2, E6-7/8 tetap di sini)

- [ ] **E6-1** (Dep E3-3, E5-1): hero dari API/DB published: logo/tagline/banner/video/CTA yang valid; fallback jika belum ada konten, judul dan tombol Indonesia. Uji admin edit lalu pengunjung melihat perubahan; jaga LCP/gambar di fold.
- [ ] **E6-2** (Dep E6-1): carousel hanya bila banner >1; kontrol manual keyboard/label, pause untuk reduced motion/interaksi, alt gambar; uji 0/1/2 banner.
- [ ] **E6-3** (Dep E3-4): About judul/deskripsi/gambar gameplay dari admin; uji data kosong, teks panjang, alt.
- [ ] **E6-4** (Dep E3-4): kartu Features dari data terurut, ikon/gambar dan deskripsi; uji urutan hasil perubahan admin.
- [ ] **E6-5** (Dep E3-4): langkah How to Play bernomor urut dengan media gambar/video; uji urutan, langkah hilang, media gagal.
- [ ] **E6-6** (Dep E3-4): player video demo dengan kontrol, judul/teks alternatif, tidak autoplay bersuara; uji ketika URL kosong dan invalid.
- [ ] **E6-7** (Dep E3-5): gallery grid foto/banner/video dari CMS terurut, placeholder bila kosong, media optimal; uji tiap jenis dan ukuran layar.
- [ ] **E6-8** (Dep E6-7): lightbox gambar/video dengan keyboard Escape, fokus balik, close button, label/alt, scroll lock dan video berhenti saat tutup; uji mouse/touch/keyboard.

## Langkah berita, FAQ, download, kontak (E7-1/2 SUPERSEDED → kartu-dinamis + cms-mutu; E7-3 dinamis ikut kartu-dinamis; E7-4/5/6 tetap di sini)

- [ ] **E7-1** (Dep E3-6): daftar published terbaru, 9/halaman, link paging valid dan empty state; uji 0/9/10 item, halaman tidak valid, draf tak bocor.
- [ ] **E7-2** (Dep E3-6): detail `/news/[slug]` sesuai kontrak API (atau path tunggal yang disepakati), metadata SEO per berita, 404 untuk slug/draf, konten aman dan thumbnail alt.
- [ ] **E7-3** (Dep E3-7): FAQ accordion label/keyboard/aria-expanded, daftar urut, data dari admin dan empty state.
- [ ] **E7-4** (Dep E3-8): download per platform dengan state `Segera Hadir` ketika belum dirilis, link aktif hanya jika tersedia; uji URL/status dan layar sempit.
- [ ] **E7-5** (Dep E3-8): email kontak dan tautan sosial dari settings/links, label terakses, validasi output bila data kosong.
- [ ] **E7-6** (Dep E7-4 dan E7-5): semua tautan eksternal download/sosial memakai `target="_blank" rel="noopener noreferrer"`; uji render semua link, jangan menerapkan pada anchor internal.

## Waiting list dan penyelesaian visual (E11-4..6 SUPERSEDED → `2026-10-17-wishlist-rename.md`; E12-5/7/8 ikut `2026-10-17-cms-mutu-landing.md` Task 3)

- [ ] **E11-4** (Dep E5-1, E11-1): tombol header login/join bagi anonim, state masuk bagi pengunjung; komponen anak/slot, integrator pasang di header milik Fondasi. Uji mobile/desktop, jangan tampilkan email tanpa sesi.
- [ ] **E11-5** (Dep E11-4): menu akun email+logout, dropdown keyboard/fokus, server session sebagai sumber benar; logout menghapus state.
- [ ] **E11-6** (Dep E11-2): pesan berhasil/terdaftar setelah login Google, status dari query E11-3 bila sudah tersedia, kondisi gagal jelas, alur join ≤3 langkah tanpa submit email manual. Jika E11-3 belum `Done`, jangan klaim status idempoten UI terverifikasi.
- [ ] **E12-5** (Dep E6-1, E12-1): hero full-bleed judul besar, latar gambar/video, overlay terbaca; cocok untuk 360 px dan media gagal tanpa mengganti branding.
- [ ] **E12-7** (Dep E12-5): animasi scroll/hover ringan, hormati `prefers-reduced-motion`, hindari JS berat dan layout shift; uji Lighthouse setelahnya.
- [ ] **E12-8** (Dep E12-1..7): audit seluruh seksi termasuk header/kartu/hero mobile, konsistensi warna/typography/fokus, kepemilikan/lisensi aset; laporkan/perbaiki melalui PR pemilik bila edit file milik Fondasi.

**Verifikasi:** `pnpm lint && pnpm exec tsc --noEmit && pnpm format:check && pnpm build`; `pnpm preview` dengan konten admin seed/fixture, cek 360–1920 px, keyboard, link, publikasi dan perubahan ≤60 detik. Jangan menandai task konten `Done` dari mock statis.
