# Google OAuth Waiting List

## Konfigurasi

1. Buat OAuth 2.0 Client ID tipe **Web application** di Google Cloud Console untuk tiap environment.
2. Tambahkan redirect URI berikut pada client yang sesuai:
   - Lokal: `http://localhost:3000/api/auth/callback/google`
   - Produksi: `https://<domain-produksi>/api/auth/callback/google`
3. Simpan nilai berikut sebagai secret, bukan di source control:
   - `AUTH_SECRET`
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
4. Untuk lokal, isi `.dev.vars`; untuk Cloudflare, set sebagai Worker secrets. `.dev.vars` bukan file shell: gunakan `node --env-file=.dev.vars <perintah>`, bukan `source .dev.vars`.

Provider meminta scope `openid email profile`. Auth.js memvalidasi `state` dan PKCE. Identitas Google stabil (`sub`) disimpan Auth.js pada tabel `accounts`; waiting list hanya menyimpan email terverifikasi, nama, foto, provider, dan waktu daftar.

## Kontrak waiting list

`GET /api/waitlist/status` tidak menerima email dari request. Endpoint mengambil email dari sesi Auth.js, lalu mengembalikan:

```json
{
  "registered": true,
  "email": "pemilik@example.test",
  "name": "Nama",
  "createdAt": "..."
}
```

Tanpa sesi/email valid, endpoint mengembalikan `401` dan `{ "registered": false }`. UI publik E11-6 memakai `registered` untuk pesan status pemilik. Dashboard E8 menghitung `waitlist` langsung dari DB setelah dependensi E3/E11 terpenuhi.

## Batas verifikasi

Skrip `node --env-file=.dev.vars scripts/test-waitlist-db.mjs` memeriksa upsert concurrent dan pembaruan nama/foto menghasilkan tepat satu row. Verifikasi OAuth lokal/produksi memerlukan client Google dengan URI yang telah didaftarkan. Jangan nyatakan OAuth produksi siap sampai E0-5 selesai dan redirect URI produksi, secret Worker, serta callback produksi telah diverifikasi.
