// E7-5: konten media sosial untuk Server Component.
// Tidak pernah melempar — DB kosong/gagal jatuh ke fallback/null.

import { getDb } from "@/db";
import { socialLinks } from "@/db/schema";
import { readSocialLinks, type SocialRow } from "./api/links";

export type SocialItemResolved = {
  id: number;
  label: string;
  url: string;
  icon: "instagram" | "youtube" | "discord" | "tiktok" | "other";
};

function resolveSocialIcon(platform: string): SocialItemResolved["icon"] {
  const norm = platform.trim().toLowerCase();
  if (norm.includes("instagram")) return "instagram";
  if (norm.includes("youtube")) return "youtube";
  if (norm.includes("discord")) return "discord";
  if (norm.includes("tiktok")) return "tiktok";
  return "other";
}

/**
 * Daftar media sosial terurut dari DB, atau null bila gagal/kosong.
 */
export async function getSocialItems(): Promise<SocialItemResolved[] | null> {
  try {
    const db = getDb();
    const rows = await db.select().from(socialLinks);
    if (rows.length === 0) return null;
    const lister = {
      list: async (): Promise<SocialRow[]> =>
        rows.map((r) => ({
          id: r.id,
          platform: r.platform,
          url: r.url,
          sortOrder: r.sortOrder,
        })),
    };
    const ordered = await readSocialLinks(lister);
    return ordered.map((r) => ({
      id: r.id,
      label: r.platform,
      url: r.url,
      icon: resolveSocialIcon(r.platform),
    }));
  } catch {
    return null;
  }
}
