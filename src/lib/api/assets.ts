// E4-5: logika hapus objek R2 by key (murni, tanpa impor runtime).
// Route tipis memetakan ApiResult -> Response via fromResult(); guard admin,
// parse Zod, dan akses binding tetap di route. Pola sama seperti E3
// (mis. src/lib/api/gallery.ts) agar teruji via node:test tanpa Workers.
// Hanya `import type`.

import type { ApiResult } from "./response";

export type AssetStore = {
  head(key: string): Promise<{ exists: boolean }>;
  remove(key: string): Promise<void>;
};

/**
 * Hapus objek idempoten: hilang -> {deleted:false} 200; ada + hapus sukses
 * -> {deleted:true} 200. `deleted:true` = terdeteksi ada sebelum DELETE yang
 * berhasil (HEAD->DELETE bukan atomik). Gagal store -> 500 generik.
 */
export async function deleteAssetObject(
  store: AssetStore,
  key: string,
): Promise<ApiResult<{ key: string; deleted: boolean }>> {
  let existed: boolean;
  try {
    existed = (await store.head(key)).exists;
  } catch {
    return {
      ok: false,
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Terjadi kesalahan pada server. Coba lagi nanti.",
    };
  }
  if (!existed) {
    return { ok: true, data: { key, deleted: false } };
  }
  try {
    await store.remove(key);
    return { ok: true, data: { key, deleted: true } };
  } catch {
    return {
      ok: false,
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Terjadi kesalahan pada server. Coba lagi nanti.",
    };
  }
}
