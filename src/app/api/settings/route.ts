// E3-2: API Settings/Branding — GET publik + PUT admin.
// Kontrak: GET mengembalikan branding (kolom hilang = null); PUT parsial
// minimal satu kolom, URL wajib https://, email tervalidasi (lihat
// src/lib/validation/settings.ts). Error: 400/401/403/500 amplop E3-1.
// Tabel `site_settings` key/value milik Data — route ini hanya query/insert.

import { auth } from "@/auth";
import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { checkAdmin, type SessionLike } from "@/lib/api/auth";
import { toDbResult } from "@/lib/api/db-errors";
import {
  forbidden,
  fromResult,
  internalError,
  unauthorized,
} from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import {
  readSettings,
  writeSettings,
  type SettingsRow,
  type SettingsStore,
} from "@/lib/api/settings";
import { settingsUpdateSchema } from "@/lib/validation/settings";

export const dynamic = "force-dynamic";

/** Adaptasi Drizzle ke antarmuka SettingsStore (upsert per key tetap). */
function drizzleStore(): SettingsStore {
  const db = getDb();
  return {
    async list(): Promise<SettingsRow[]> {
      const rows = await db
        .select({ key: siteSettings.key, value: siteSettings.value })
        .from(siteSettings);
      return rows.map((r) => ({ key: r.key, value: r.value }));
    },
    async upsert(key: string, value: string | null): Promise<void> {
      await db
        .insert(siteSettings)
        .values({ key, value })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: { value, updatedAt: new Date() },
        });
    },
  };
}

function toSessionLike(session: Awaited<ReturnType<typeof auth>>): SessionLike {
  const user = session?.user as
    { id?: unknown; role?: unknown } | null | undefined;
  if (!user) return null;
  return {
    user: {
      id: typeof user.id === "string" ? user.id : null,
      role: typeof user.role === "string" ? user.role : null,
    },
  };
}

/** Publik: branding game + email kontak. */
export async function GET(): Promise<Response> {
  let store: SettingsStore;
  try {
    store = drizzleStore();
  } catch {
    // Termasuk env DB belum diset — pesan generik, tanpa detail.
    return internalError();
  }
  try {
    return fromResult({ ok: true, data: await readSettings(store) });
  } catch (error) {
    console.error("GET /api/settings gagal:", error);
    return fromResult(toDbResult(error));
  }
}

/** Admin: ubah sebagian atau seluruh branding/kontak. */
export async function PUT(request: Request): Promise<Response> {
  let session: Awaited<ReturnType<typeof auth>>;
  try {
    session = await auth();
  } catch (error) {
    console.error("PUT /api/settings auth gagal:", error);
    return internalError();
  }
  const checked = checkAdmin(toSessionLike(session));
  if (!checked.ok) {
    return checked.status === 401 ? unauthorized() : forbidden();
  }
  const parsed = await parseJsonBody(request, settingsUpdateSchema);
  if (!parsed.ok) return fromResult(parsed);
  let store: SettingsStore;
  try {
    store = drizzleStore();
  } catch {
    return internalError();
  }
  try {
    return fromResult({
      ok: true,
      data: await writeSettings(store, parsed.data),
    });
  } catch (error) {
    console.error("PUT /api/settings gagal:", error);
    return fromResult(toDbResult(error));
  }
}
