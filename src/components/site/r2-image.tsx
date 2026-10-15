"use client";

import Image from "next/image";
import { useState } from "react";

import { R2_IMAGE_FALLBACK_SRC, buildR2ImageUrl } from "@/lib/r2-image-loader";

export type R2ImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  /** Prioritaskan gambar di atas fold (LCP); default lazy di bawah fold. */
  priority?: boolean;
  className?: string;
  sizes?: string;
};

/**
 * Gambar R2 untuk konten publik (E4-4, NFR-PRF-03).
 * - `src` wajib URL publik permanen / key `assets/...`, BUKAN signed URL.
 * - Lazy loading default; `priority` hanya untuk hero/LCP (koordinasi E9-2).
 * - Fallback `/icon.svg` bila URL invalid atau gambar gagal dimuat.
 */
export function R2Image({
  src,
  alt,
  width = 800,
  height = 600,
  priority = false,
  className,
  sizes,
}: R2ImageProps) {
  const [failed, setFailed] = useState(false);

  let resolvedSrc = R2_IMAGE_FALLBACK_SRC;
  try {
    resolvedSrc = failed
      ? R2_IMAGE_FALLBACK_SRC
      : buildR2ImageUrl({ src, width });
  } catch {
    resolvedSrc = R2_IMAGE_FALLBACK_SRC;
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setFailed(true)}
      className={className}
      sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
    />
  );
}
