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

## Uji manual (butuh kredensial uji + CORS)

1. Isi `.dev.vars` lokal dengan kredensial bucket uji (bukan produksi).
2. Jalankan `pnpm preview`, minta presigned URL sebagai admin (E4-2, setelah
   E2-4 tersedia).
3. Dari browser/curl: `PUT` file ke `uploadUrl` dengan header `Content-Type`
   yang sama; pastikan body file menuju host R2, Worker hanya menerima
   metadata.
4. Cek network: tidak ada `POST` byte file ke Worker; URL final yang disimpan
   adalah `publicUrl` (bukan signed URL).

**Blocker saat ini:** kredensial R2/CORS bucket uji belum tersedia di
lingkungan ini, sehingga uji upload nyata belum dapat dilakukan. Integrasi
tidak diklaim sukses sampai bukti tersebut ada (lihat plan E4).
