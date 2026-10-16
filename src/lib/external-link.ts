// E7-6: pembantu murni tautan eksternal (SRS EI-07).
// Tautan ke luar situs (http://, https://, //) wajib memakai
// target="_blank" dan rel="noopener noreferrer" untuk keamanan & tab baru.
// Tautan internal (path /..., hash #...) tidak memakai atribut ini.
// Tanpa impor runtime agar teruji via node:test.

export function isExternalUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("//")
  );
}

export function externalLinkProps(
  url: string | null | undefined,
): { target: "_blank"; rel: "noopener noreferrer" } | Record<string, never> {
  if (!isExternalUrl(url)) return {};
  return {
    target: "_blank",
    rel: "noopener noreferrer",
  };
}
