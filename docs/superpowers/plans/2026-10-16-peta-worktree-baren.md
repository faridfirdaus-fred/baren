# Peta Eksekusi Paralel BAREN

**Tujuan:** Menuntaskan setiap task tersisa di `docs/TASK_BREAKDOWN.md` tepat satu kali, lewat worktree yang mempunyai pemilik file, kontrak antarmuka, gerbang dependensi, dan urutan integrasi jelas.

**Sumber otoritatif:** `docs/PRD.md`, `docs/SRS.md` (khususnya §2.4–2.5, §3.2–3.6), `docs/TASK_BREAKDOWN.md` (tabel task, §2 matriks, §3 urutan, §4 log, §5 DoD). Bila keputusan di plan bertentangan dengan sumber, perbaiki PRD/SRS dan task breakdown lebih dulu. Baca panduan Next.js versi terpasang di `node_modules/next/dist/docs/` sebelum mengubah kode Next.js. Plan E0 yang sudah ada tetap berlaku: `2026-10-14-fondasi-proyek-e0.md`.

## Kontrak kerja bersama

1. Tiap worktree bercabang dari `main` terbaru dan memiliki satu plan jalur. Jangan mulai task sebelum **semua** ID `Dep` pada tabel task bertanda `Done` di baseline yang sudah **terintegrasi**; rentang seperti `E3-2..8` berarti semua anggota, `E6` berarti seluruh epik. Status di branch lain belum memenuhi dependensi. Jika dependensi belum selesai, kerjakan task lain yang siap atau tunggu; jangan tandai `In Progress` hanya untuk memesan task.
2. Sebelum coding task siap: ubah statusnya menjadi `In Progress` di branch sendiri. Saat selesai: penuhi `docs/TASK_BREAKDOWN.md` §5, catat tanggal/bukti uji, ubah ke `Done`, hitung progress SP, tambah log terbaru di §4. Satu integrator merekonsiliasi `TASK_BREAKDOWN.md` saat merge; jangan menimpa baris/log milik branch lain. Catatan commit/PR ditambahkan saat ada tautan nyata. Arsipkan plan hanya setelah **seluruh** task di plan `Done` dan verifikasi lulus.
3. Gunakan PR kecil per task/kelompok task yang dependen. Rebase/merge `main` setelah prasyarat masuk; jalankan `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm format:check`, `pnpm build` sebelum integrasi dan `pnpm preview` untuk alur Worker yang berubah. Tidak ada commit/deploy otomatis dari plan ini.
4. Bahasa UI Indonesia, mobile-first 360–1920 px, aksesibel; Route Handler input memakai Zod server-side; mutasi dan penerbitan URL unggahan admin wajib 401 bila anonim dan 403 bila login bukan admin; data publik tidak membocorkan draf; query lewat Drizzle/Neon Workers; secret hanya `.dev.vars`/Wrangler; tidak ada upload berkas lewat Worker. Tautan luar wajib `target="_blank" rel="noopener noreferrer"`.
5. `E0-5` masih `Blocked` (secret produksi belum terbukti), walau E0-1..4/6/7 `Done`. Jangan menganggap rilis/tes HTTPS atau OAuth produksi selesai sebelum provisioning dan bukti langsung tersedia. File `src/db/schema.ts` dan komponen publik sekarang adalah baseline parsial, bukan kontrak final: tabel `branding`/`how_to_play` berbeda dari entitas SRS; audit data riil dan migrasi sebelum rename/drop. `src/app/api/assets/route.ts` adalah stub tak terlindungi; jalur aset harus mengganti/menutupnya sebelum exposed.

## Plan, kepemilikan, dan serah-terima

| [Data & identitas](archive/2026-10-16-data-identitas.md) | E1-1..5, E2-1..7, E11-1..3 | `src/db/**`, `drizzle/**`, `src/lib/auth*`, konfigurasi Auth.js, halaman login admin, package/lock auth | API, aset, UI akun, CMS |
| [API konten](archive/2026-10-16-api-konten.md) | E3-1..10 | `src/app/api/{settings,hero,game,gallery,news,faq,links}/**`, `src/lib/api/**`, validasi konten | Publik, CMS |

**File bersama:** `docs/TASK_BREAKDOWN.md` disentuh di tiap branch hanya untuk status task miliknya; integrator menyatukan tabel, progress, log secara semantik. `package.json`/`pnpm-lock.yaml` dikelola jalur Data untuk dependensi auth; jalur lain minta perubahan terpisah setelah perubahan Data masuk (jangan ubah lock paralel). `src/app/layout.tsx` dan `src/app/globals.css` milik Fondasi; metadata dinamis dari Mutu dikerjakan setelah Fondasi merge. `src/components/site/site-header.tsx` milik Fondasi; tombol akun dari Publik memakai slot/komponen anak terpisah dan integrasi header dilakukan setelah Fondasi merge. `src/app/admin/page.tsx` milik CMS; login admin berada pada rute terpisah. `src/components/site/hero.tsx` hanya milik Publik. `README.md` saat ini juga disentuh oleh E0-5 yang `Blocked`; jalur Rilis boleh menyiapkan instruksi di dokumen sendiri, tetapi perubahan README E10-7 hanya diintegrasikan setelah pekerjaan README E0-5 masuk dan tidak menimpa catatannya. Bila file baru melintasi batas, integrator mengatur PR follow-up; jangan cherry-pick edit tumpang tindih tanpa review.

## Gelombang integrasi (bukan izin melompati `Dep`)

1. Mulai mandiri dari status saat ini: Data `E1-1..4`; Fondasi `E5-1`, `E5-6`, `E12-1`; Aset `E4-1` (E4-3/4 menunggu E4-1); Rilis `E10-7` (butuh E0-1; dokumentasikan di file terpisah sampai README E0-5 terintegrasi). Bedakan task boleh dimulai dari seluruh epik boleh dimerge; satu task dulu tiap file bersama.
2. Data finalkan skema/kontrak dan migrasi `E1-5`, lalu auth `E2-1..4`; Fondasi finalkan header/layout. API `E3-1` setelah `E2-4`, dan Aset `E4-2` setelah `E2-4`. Publik, CMS, dan waiting-list melakukan integrasi bertahap hanya setelah task API/visual terkait masuk main.
3. API selesai `E3-2..9`, Aset `E4-2/5/6`; Data `E11-1..3`; kemudian Publik `E6/E7/E11-4..6`, CMS `E8/E11-7..9`. `E3-10` setelah semua endpoint konten; E12-8 setelah E12-1..7.
4. Mutu `E9` dan `E11-10` sesuai dep masing-masing; Rilis `E10-1..6/8` sesuai dep epik/rentang yang tertulis. Uji HTTPS E10-3 memakai domain staging nyata agar UAT tidak menunggu deploy produksi. `E10-6` hanya setelah UAT `E10-5`; bootstrap Worker dan provisioning secret E0-5 dilakukan di dalam E10-6 sebelum deploy final, lalu ulang uji domain produksi. Bila staging atau secret belum tersedia, laporkan blocker, bukan bypass dependensi.

## Kontrak lintas-jalur yang dikunci sebelum konsumen mulai

- Data menerbitkan nama tabel/kolom, relasi, unique email waitlist, status berita, urutan, user role, strategi sesi dan migrasi; API/Aset/CMS/Publik tidak menebak bentuk skema. Lakukan satu migrasi terurut pada satu branch; uji cabang Neon/nonproduksi dahulu, jangan menjalankan `db:push` paralel pada database sama.
- Auth menerbitkan `auth()`/guard identitas admin dan pengunjung, tipe sesi, rute login, dan aturan 401/403 sebelum E3-1/E4-2. Google OAuth verifikasi email dan upsert idempoten di server; hanya `email` terverifikasi digunakan sebagai kunci.
- API menerbitkan tabel kontrak per endpoint (path/metode, input Zod, output JSON, error 400/401/403/404, publikasi, urutan/paginasi) sebelum UI; implementasi mengikuti kontrak tersebut. URL aset disimpan sebagai key/URL yang disepakati Data+Aset, bukan URL presigned yang kedaluwarsa. Setelah mutasi, konsumen membaca data terbaru ≤60 detik.
- Fondasi menerbitkan token warna/font/spacing, primitives CTA/kartu, ID section, slot header, dan boundary server/client. Publik hanya mengisi slot serta seksi; CMS menggunakan primitives tanpa mengganti token. Putuskan urutan dan ID seksi sebelum navigasi sticky.
- R2 menetapkan jalur presign, bentuk respons `{ key, uploadUrl, publicUrl }`, batas ukuran/tipe dan CORS bucket. Selaraskan dengan API gallery dan CMS uploader sebelum mengerjakan E8-6.

## Pemeriksaan cakupan

E0: 7 task, plan lama; E1: 5; E2: 7; E3: 10; E4: 6; E5: 6; E6: 8; E7: 6; E8: 12; E9: 5; E10: 8; E11: 10; E12: 8. Total **98 task**, 91 task pada delapan plan ini dan 7 pada E0. Tiap plan di bawah mencantumkan setiap ID miliknya satu kali. Matriks kebutuhan `docs/TASK_BREAKDOWN.md` §2 menjadi checklist tambahan; jika kebutuhan tidak tercakup oleh task, perbarui breakdown sebelum mengklaim selesai.
