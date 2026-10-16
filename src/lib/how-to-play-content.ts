// Fetch how-to-play content for landing page

import { getDb } from "@/db";
import { howToPlaySteps, howToPlayVideo } from "@/db/schema";
import { asc } from "drizzle-orm";

export type HowToPlayStep = {
  id: number;
  step: number;
  title: string;
  description: string | null;
  mediaUrl: string | null;
  sortOrder: number;
};

export type HowToPlayContent = {
  steps: HowToPlayStep[];
  videoUrl: string | null;
};

export async function getHowToPlayContent(): Promise<HowToPlayContent | null> {
  try {
    const db = getDb();
    const [steps, videos] = await Promise.all([
      db
        .select({
          id: howToPlaySteps.id,
          step: howToPlaySteps.step,
          title: howToPlaySteps.title,
          description: howToPlaySteps.description,
          mediaUrl: howToPlaySteps.mediaUrl,
          sortOrder: howToPlaySteps.sortOrder,
        })
        .from(howToPlaySteps)
        .orderBy(asc(howToPlaySteps.sortOrder), asc(howToPlaySteps.id)),
      db
        .select({ videoUrl: howToPlayVideo.videoUrl })
        .from(howToPlayVideo)
        .limit(1),
    ]);

    if (steps.length === 0) return null;

    return {
      steps,
      videoUrl: videos[0]?.videoUrl ?? null,
    };
  } catch (error) {
    console.error("getHowToPlayContent error:", error);
    return null;
  }
}
