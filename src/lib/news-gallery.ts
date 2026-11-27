/**
 * E19-5 — Penyimpanan & pembacaan galeri multi-foto event pada `news.body`
 * tanpa migrasi skema Postgres (kompatibel penuh dengan artikel lama & Neon).
 */

const IMAGE_LINE_RE = /^!\[[^\]]*\]\(([^)\s]+)\)\s*$/;

const SAFE_MEDIA_URL_RE =
  /^(?:https:\/\/[^\s)]+|\/(?:art|media|brand|api\/assets)\/[a-zA-Z0-9._/-]+|assets\/[a-zA-Z0-9._/-]+)$/;

export function isSafeArticleImageUrl(url: string): boolean {
  const trimmed = url.trim();
  return (
    trimmed.length > 0 &&
    trimmed.length <= 2048 &&
    SAFE_MEDIA_URL_RE.test(trimmed)
  );
}

export function parseNewsBody(rawBody: string | null | undefined): {
  story: string;
  galleryUrls: string[];
} {
  if (!rawBody) return { story: "", galleryUrls: [] };

  const storyLines: string[] = [];
  const galleryUrls: string[] = [];

  for (const line of rawBody.split(/\r?\n/)) {
    const match = IMAGE_LINE_RE.exec(line.trim());
    if (match && isSafeArticleImageUrl(match[1])) {
      if (!galleryUrls.includes(match[1])) {
        galleryUrls.push(match[1]);
      }
    } else {
      storyLines.push(line);
    }
  }

  return {
    story: storyLines.join("\n").trim(),
    galleryUrls,
  };
}

export function serializeNewsBody(
  story: string,
  galleryUrls: readonly string[],
): string {
  const cleanStory = story.trim();
  const cleanUrls = Array.from(
    new Set(
      galleryUrls.map((u) => u.trim()).filter((u) => isSafeArticleImageUrl(u)),
    ),
  );

  if (cleanUrls.length === 0) return cleanStory;

  const galleryBlock = cleanUrls.map((u) => `![foto-event](${u})`).join("\n");
  return cleanStory ? `${cleanStory}\n\n${galleryBlock}` : galleryBlock;
}
