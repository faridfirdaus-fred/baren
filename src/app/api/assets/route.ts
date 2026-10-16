// E4-2: penerbit presigned URL upload langsung browser -> R2 (admin only).
// Kontrak: PUT menerima metadata JSON saja (tanpa byte file), cek admin
// dulu (401 anonim / 403 non-admin), validasi Zod sebelum signing, key
// dibuat server-side, expiry tetap 600 detik (NFR-SEC-05), respons
// { key, uploadUrl, publicUrl }.
//
// E4-5: DELETE hapus objek R2 by key (admin only). Cakup E4-5 (bukan E8-6):
// - Guard admin 401/403, Zod `{key}` 400, `assertAssetKey` defensif.
// - Objek hilang -> 200 {deleted:false} idempoten (retry aman).
// - `deleted:true` = objek terdeteksi ada sebelum DELETE yang berhasil
//   (HEAD->DELETE bukan atomik; bukan bukti absolut pernah-ada-selamanya).
// - Gagal binding/R2 -> 500 generik. Log key saja (bukan secret).
// - Urutan DB->R2 + cek eksklusivitas referensi + cleanup persisten
//   (deletion outbox) adalah acceptance E8-6, BUKAN E4-5. E4-5 hanya
//   sediakan endpoint + `keyFromPublicUrl` agar pemanggil validasi key
//   SEBELUM hapus record (URL invalid -> record utuh).
// - Risiko: presigned PUT reusable selama belum expiry — objek terhapus
//   bisa diunggah lagi via URL PUT lama; mitigasi key unik per upload
//   (createAssetKey) + cleanup lanjutan di E8-6.
//
// Batas validasi metadata (revisi reviewer E4-2):
// - `bytes` adalah klaim klien, BUKAN bukti ukuran aktual objek R2.
//   Ukuran/tipe aktual wajib diverifikasi via metadata objek R2
//   (lihat `verifyStoredAsset`, E4-3) sebelum aset dinyatakan berhasil
//   diunggah/dipublikasikan pada tahap integrasi berikutnya.
// - `Content-Type` ikut ditandatangani (X-Amz-SignedHeaders mencakup
//   content-type;host); klien wajib mengirim header yang sama, bila beda
//   R2 menolak 403 SignatureDoesNotMatch.
// - SVG dibatasi purpose logo/ikon di skema; sanitasi isi SVG sebelum
//   publikasi ditangani tahap integrasi berikutnya.

import { requireAdminResponse } from "@/lib/api/guard";
import { parseJsonBody } from "@/lib/api/parse";
import { fromResult, internalError, ok } from "@/lib/api/response";
import { deleteAssetObject } from "@/lib/api/assets";
import {
  assetDeleteRequestSchema,
  assetPresignRequestSchema,
} from "@/lib/assets-validation";
import {
  PRESIGNED_URL_MAX_EXPIRY_SECONDS,
  assertAssetKey,
  buildPublicAssetUrl,
  createAssetKey,
  createPresignedPutUrl,
  deleteAsset,
  verifyStoredAsset,
} from "@/lib/r2";

export const dynamic = "force-dynamic";

/** PUT: terbitkan presigned URL upload (metadata saja, tanpa byte file). */
export async function PUT(request: Request): Promise<Response> {
  const denied = await requireAdminResponse("PUT /api/assets");
  if (denied) return denied;

  const parsed = await parseJsonBody(request, assetPresignRequestSchema);
  if (!parsed.ok) return fromResult(parsed);

  const { purpose, mimeType } = parsed.data;

  // 400 vs 500: validasi input gagal -> 400 (ditangani parseJsonBody).
  // Gagal generate key/publicUrl di server, gagal konfigurasi R2, atau
  // gagal signing -> 500 generik tanpa detail internal.
  let key: string;
  let publicUrl: string;
  try {
    key = createAssetKey(purpose, mimeType);
  } catch {
    console.error("PUT /api/assets key gagal dibuat.");
    return internalError();
  }
  try {
    publicUrl = buildPublicAssetUrl(key);
  } catch {
    console.error("PUT /api/assets publicUrl gagal dibuat.");
    return internalError();
  }

  try {
    const { uploadUrl, expiresInSeconds } = await createPresignedPutUrl({
      key,
      contentType: mimeType,
      expiresInSeconds: PRESIGNED_URL_MAX_EXPIRY_SECONDS,
    });
    // Jangan log secret/signature/uploadUrl lengkap: URL memberi kemampuan
    // upload sementara dan dapat dipakai ulang sebelum kedaluwarsa.
    console.info(
      `PUT /api/assets presign ok (key=${key}, expires=${expiresInSeconds}s).`,
    );
    return ok({ key, uploadUrl, publicUrl });
  } catch {
    // Kredensial R2 belum dikonfigurasi / gagal signing -> 500 generik.
    console.error("PUT /api/assets presign gagal.");
    return internalError();
  }
}

/** DELETE E4-5: hapus objek R2 by key (admin only; idempoten). */
export async function DELETE(request: Request): Promise<Response> {
  const denied = await requireAdminResponse("DELETE /api/assets");
  if (denied) return denied;
  const parsed = await parseJsonBody(request, assetDeleteRequestSchema);
  if (!parsed.ok) return fromResult(parsed);
  const { key } = parsed.data;

  // Key sudah lolos Zod; assert defensif sebelum sentuh store (400 bila
  // gagal). Pemeriksaan eksistensi via HEAD langsung ke R2 adalah sumber
  // kebenaran (bukan custom-domain/cached GET). HEAD->DELETE bukan atomik:
  // `deleted:true` = terdeteksi ada sebelum DELETE yang berhasil.
  try {
    assertAssetKey(key);
  } catch {
    return fromResult({
      ok: false,
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Validasi gagal. Periksa kembali kolom yang ditandai.",
      fields: { key: ["Key aset tidak valid."] },
    });
  }
  const result = await deleteAssetObject(
    {
      head: async (k) => verifyStoredAsset(k),
      remove: (k) => deleteAsset(k),
    },
    key,
  );
  if (!result.ok) {
    console.error("DELETE /api/assets gagal.");
    return internalError();
  }
  if (result.data.deleted) {
    // Log key saja (bukan secret); endpoint tak menangani secret.
    console.info(`DELETE /api/assets ok (key=${key}).`);
  }
  return fromResult(result);
}
