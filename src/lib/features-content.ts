// E6-4: Helper untuk fetch fitur game dari CMS.

import type { FeatureRow } from "@/lib/api/game";

export async function getFeatures(): Promise<FeatureRow[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/features`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: FeatureRow[] };
    return json.data || [];
  } catch {
    return [];
  }
}
