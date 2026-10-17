// E6-4: Helper untuk fetch fitur game dari CMS.

import { asc } from "drizzle-orm";

import { getDb } from "@/db";
import { features } from "@/db/schema";
import type { FeatureRow } from "@/lib/api/game";

export type FeatureItem = FeatureRow;

export async function getFeatures(): Promise<FeatureRow[]> {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(features)
      .orderBy(asc(features.sortOrder), asc(features.id));
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      iconUrl: r.iconUrl,
      sortOrder: r.sortOrder,
    }));
  } catch {
    return [];
  }
}
