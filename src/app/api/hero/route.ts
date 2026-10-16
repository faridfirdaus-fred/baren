// E3-3: GET hero+banners publik, PUT hero admin (singleton id=1).

import { asc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { hero, heroBanners } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import {
  readPublicHome,
  writeHero,
  type BannerRow,
  type HeroRow,
  type HeroStore,
} from "@/lib/api/hero";
import { heroUpdateSchema, type HeroUpdate } from "@/lib/validation/hero";

export const dynamic = "force-dynamic";

type Db = ReturnType<typeof getDb>;

function toHeroRow(r: typeof hero.$inferSelect): HeroRow {
  return {
    id: r.id,
    title: r.title,
    subtitle: r.subtitle,
    backgroundUrl: r.backgroundUrl,
    videoUrl: r.videoUrl,
    primaryCtaLabel: r.primaryCtaLabel,
    primaryCtaUrl: r.primaryCtaUrl,
    secondaryCtaLabel: r.secondaryCtaLabel,
    secondaryCtaUrl: r.secondaryCtaUrl,
    isPublished: r.isPublished === 1 ? 1 : 0,
  };
}

function toBannerRow(r: typeof heroBanners.$inferSelect): BannerRow {
  return { id: r.id, imageUrl: r.imageUrl, sortOrder: r.sortOrder };
}

function heroStore(db: Db): HeroStore {
  return {
    async get(): Promise<HeroRow | null> {
      const rows = await db.select().from(hero).orderBy(asc(hero.id)).limit(1);
      return rows[0] ? toHeroRow(rows[0]) : null;
    },
    async save(input: HeroUpdate): Promise<HeroRow> {
      const now = new Date();
      // Kolom id generatedAlwaysAsIdentity tak bisa diinsert eksplisit,
      // sehingga singleton = baris id terkecil (update dulu, insert bila kosong).
      const values = {
        title: input.title,
        subtitle: input.subtitle ?? null,
        backgroundUrl: input.backgroundUrl ?? null,
        videoUrl: input.videoUrl ?? null,
        primaryCtaLabel: input.primaryCtaLabel ?? null,
        primaryCtaUrl: input.primaryCtaUrl ?? null,
        secondaryCtaLabel: input.secondaryCtaLabel ?? null,
        secondaryCtaUrl: input.secondaryCtaUrl ?? null,
        isPublished: input.isPublished === false ? 0 : 1,
        updatedAt: now,
      };
      const existing = await db
        .select({ id: hero.id })
        .from(hero)
        .orderBy(asc(hero.id))
        .limit(1);
      const rows =
        existing[0] === undefined
          ? await db.insert(hero).values(values).returning()
          : await db
              .update(hero)
              .set(values)
              .where(eq(hero.id, existing[0].id))
              .returning();
      const saved = rows[0];
      if (!saved) throw new Error("Gagal menyimpan hero.");
      return toHeroRow(saved);
    },
  };
}

function bannerLister(db: Db): { list(): Promise<BannerRow[]> } {
  return {
    async list(): Promise<BannerRow[]> {
      const rows = await db.select().from(heroBanners);
      return rows.map(toBannerRow);
    },
  };
}

/** Publik: hero terbit + banners berurutan. */
export async function GET(): Promise<Response> {
  try {
    const db = getDb();
    return fromResult({
      ok: true,
      data: await readPublicHome(heroStore(db), bannerLister(db)),
    });
  } catch (error) {
    console.error("GET /api/hero gagal:", error);
    return fromResult(toDbResult(error));
  }
}

/** Admin: tulis hero singleton. */
export async function PUT(request: Request): Promise<Response> {
  const denied = await requireAdminResponse("PUT /api/hero");
  if (denied) return denied;
  const parsed = await parseJsonBody(request, heroUpdateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    const db = getDb();
    return fromResult({
      ok: true,
      data: await writeHero(heroStore(db), parsed.data),
    });
  } catch (error) {
    console.error("PUT /api/hero gagal:", error);
    return fromResult(toDbResult(error));
  }
}
