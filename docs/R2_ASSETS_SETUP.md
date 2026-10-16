# Penyiapan Aset R2 (E4-1)

Dokumen ini mencatat hasil audit helper R2 dan konfigurasi yang dibutuhkan
untuk upload langsung browser → R2 via presigned URL. Tanpa nilai rahasia.

## Temuan audit (E4-1)

- Binding `BAREN_ASSETS` (`wrangler.jsonc`, E0-3) hanya untuk akses
  server-side (head/hapus/verifikasi objek). Binding **tidak dapat**
  menandatangani URL untuk direct upload dari browser.
- Jalur upload: server menerbitkan presigned URL PUT S3 (SigV4, Web Crypto
  `crypto.subtle`, tanpa modul native Node) memakai kredensial API R2 dari
  secret Workers. Browser `PUT` langsung ke host
  `<ACCOUNT_ID>.r2.cloudflarestorage.com`; Worker tidak menerima byte file.
- Key acak: `assets/<purpose>/YYYY/MM/<uuid>.<ext>`, ekstensi dipetakan dari
  MIME yang divalidasi server (bukan dari nama file saja).
- Kadaluarsa presign ≤ 600 detik (NFR-SEC-05).
- URL publik permanen (`R2_PUBLIC_URL`, diawali `https://`) terpisah dari
  `uploadUrl` sementara. `next/image` hanya memakai URL publik, menolak
  signed URL (`X-Amz-*`).

## Variabel env (tanpa nilai nyata)

Tambahkan ke `.dev.vars` lokal (ter-ignore) dan `wrangler secret put` untuk
produksi. Jangan commit nilai nyata.

| Nama                   | Contoh placeholder       | Keterangan                                    |
| ---------------------- | ------------------------ | --------------------------------------------- |
| `R2_ACCOUNT_ID`        | `abc123…`                | ID akun Cloudflare untuk host S3 R2           |
| `R2_BUCKET_NAME`       | `baren-assets`           | Nama bucket (default `baren-assets`)          |
| `R2_ACCESS_KEY_ID`     | `…`                      | Access Key ID token API R2                    |
| `R2_SECRET_ACCESS_KEY` | `…`                      | Secret Access Key token API R2                |
| `R2_PUBLIC_URL`        | `https://pub-xxx.r2.dev` | Basis URL publik bucket (sudah ada contohnya) |

`.dev.vars.example` diperbarui dengan placeholder di atas.

## CORS bucket (tanpa rahasia)

Agar browser bisa `PUT` langsung ke host R2, pasang aturan CORS pada bucket
`baren-assets` (Dashboard R2 → Settings → CORS policy, atau `wrangler` bila
didukung di akun Anda). Sesuaikan origin dengan domain staging/produksi.

```json
[
  {
    "AllowedOrigins": [
      "https://staging.example.com",
      "https://www.example.com"
    ],
    "AllowedMethods": ["PUT", "HEAD"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Catatan: presigned URL mengikat `Content-Type`, jadi klien wajib mengirim
header `Content-Type` yang sama dengan MIME yang ditandatangani.

## Izin token API R2

Buat token API R2 (R2 → Manage API tokens) dengan izin baca/tulis pada bucket
`baren-assets` saja. Token ini hanya dipakai server untuk signing; tidak
pernah dikirim ke browser.

## Status penyiapan (2026-10-16, terverifikasi)

- Bucket `baren-assets` (APAC, Standard, private) + `baren-opennext-cache`
  ada pada satu akun; binding `wrangler.jsonc` cocok
  (`BAREN_ASSETS`, `NEXT_INC_CACHE_R2_BUCKET`).
- `.dev.vars` lokal terisi 5 key `R2_*` (ter-ignore git, tanpa nilai di repo).
- CORS bucket `baren-assets` terpasang: `PUT, HEAD`, `Content-Type`,
  `ETag`, `MaxAgeSeconds 3600`; origin localhost + staging/prod.
- `R2_PUBLIC_URL` hidup (404 di `/` wajar: bucket masih kosong).
- Token R2 scoped `Object Read & Write` hanya ke `baren-assets`.

Sisa: uji upload/delete nyata menunggu E2-4 (guard admin) + E3-5
(kontrak record) sesuai plan E4-2/E4-5.

## Uji manual (butuh kredensial uji + CORS — SUDAH TERSEDIA)

1. Isi `.dev.vars` lokal dengan kredensial bucket uji (bukan produksi).
2. Jalankan `pnpm preview`, minta presigned URL sebagai admin (E4-2, setelah
   E2-4 tersedia).
3. Dari browser/curl: `PUT` file ke `uploadUrl` dengan header `Content-Type`
   yang sama; pastikan body file menuju host R2, Worker hanya menerima
   metadata.
4. Cek network: tidak ada `POST` byte file ke Worker; URL final yang disimpan
   adalah `publicUrl` (bukan signed URL).

**Blocker kredensial/CORS gugur 2026-10-16:** kredensial R2 + CORS bucket uji
sudah terverifikasi (lihat `docs/R2_ASSETS_SETUP.md` § Status penyiapan).
Sisa blocker hanya dependensi kode: E2-4 (guard admin) untuk E4-2/E4-5
dan E3-5 (kontrak record) untuk E4-5. Integrasi upload nyata belum diklaim
sukses sampai uji E4-2 ada buktinya.
