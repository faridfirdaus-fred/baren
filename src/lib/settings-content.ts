import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { toBranding, type SettingsBranding } from "@/lib/api/settings";

/**
 * Membaca pengaturan landing dari DB (site_settings) sekali di server.
 * Gagal koneksi atau tabel kosong mengembalikan null agar landing tidak jatuh.
 */
export async function getLandingSettings(): Promise<SettingsBranding | null> {
  try {
    const db = getDb();
    const rows = await db
      .select({ key: siteSettings.key, value: siteSettings.value })
      .from(siteSettings);
    if (!rows || rows.length === 0) return null;
    return toBranding(rows.map((r) => ({ key: r.key, value: r.value })));
  } catch {
    return null;
  }
}
