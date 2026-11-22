/**
 * Helper untuk normalisasi URL aset publik R2 (E4-4).
 *
 * Mengatasi masalah pemblokiran domain `*.r2.dev` oleh Internet Positif di Indonesia.
 * Jika URL mengarah ke subdomain `*.r2.dev`, otomatis diarahkan ke endpoint proxy
 * Worker `/api/assets/...` yang dilayani langsung dari binding R2 internal (BAREN_ASSETS).
 */
export function resolvePublicAssetUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Tangani URL r2.dev (misal: https://pub-xxx.r2.dev/assets/ikon/...)
  const r2DevMatch = trimmed.match(
    /^https?:\/\/[^/]+\.r2\.dev\/(assets\/.+)$/i,
  );
  if (r2DevMatch) {
    return `/api/assets/${r2DevMatch[1]}`;
  }

  // Jika URL diawali dengan "assets/" langsung tanpa prefix
  if (trimmed.startsWith("assets/")) {
    return `/api/assets/${trimmed}`;
  }

  return trimmed;
}
