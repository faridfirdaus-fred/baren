import Image from "next/image";

function isOptimizable(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    const host = new URL(src).hostname.toLowerCase();
    return (
      host === "r2.dev" ||
      host.endsWith(".r2.dev") ||
      host === "r2.cloudflarestorage.com" ||
      host.endsWith(".r2.cloudflarestorage.com")
    );
  } catch {
    return false;
  }
}

/**
 * E5-2 — Logo brand yang tahan URL dinamis dari `site_settings`.
 * Lokal/R2 (sesuai `remotePatterns` E4-4) lewat next/image; host luar
 * yang tak dikenal memakai `<img>` biasa agar tidak 400 dari optimizer.
 * `alt=""` karena nama brand selalu tampil sebagai teks di sampingnya.
 */
export function BrandLogo({
  src,
  size,
  className = "",
}: {
  src: string;
  size: number;
  className?: string;
}) {
  if (isOptimizable(src)) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={className}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
    />
  );
}
