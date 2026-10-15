import type { ReactNode } from "react";

type CardAspect = "video" | "square" | "wide";
type CardTone = "light" | "dark";

const aspectClass: Record<CardAspect, string> = {
  // E12-4 — Rasio media konsisten: berita/galeri 16:9, fitur 1:1.
  video: "aspect-video",
  square: "aspect-square",
  wide: "aspect-[427/240]",
};

/**
 * E12-4 — Bingkai media kartu. Latar `bg-ink-700` menjaga teks di sekitarnya
 * tetap terbaca bila gambar gagal dimuat; hanya styling, tanpa fetch data.
 */
export function CardMedia({
  aspect = "video",
  altFallbackLabel,
  children,
}: {
  aspect?: CardAspect;
  altFallbackLabel?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative ${aspectClass[aspect]} overflow-hidden bg-ink-700`}
      role={altFallbackLabel ? "img" : undefined}
      aria-label={altFallbackLabel}
    >
      {children}
    </div>
  );
}

/**
 * E12-4 — Overlay gradien untuk teks di atas media (DG-08).
 * Dipakai di dalam `CardMedia` sebagai lapisan terbawah teks.
 */
export function CardOverlay({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent ${className}`}
    />
  );
}

type ContentCardProps = {
  id?: string;
  tone?: CardTone;
  media?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  footer?: ReactNode;
  href?: string;
  external?: boolean;
  className?: string;
};

/**
 * E12-4 — Primitif kartu untuk berita/fitur/galeri.
 * Antarmuka diserahkan ke Publik/CMS: mereka mengisi slot media/teks,
 * Fondasi hanya menetapkan struktur, rasio, dan overlay.
 */
export function ContentCard({
  id,
  tone = "light",
  media,
  eyebrow,
  title,
  description,
  meta,
  footer,
  href,
  external = false,
  className = "",
}: ContentCardProps) {
  const toneClass =
    tone === "light"
      ? "border-sand-600 bg-sand text-ink"
      : "border-ink-700 bg-ink-800 text-sand";
  const cls = `block border ${toneClass} ${className}`;

  const body = (
    <>
      {media}
      <div className="p-6">
        {meta}
        {eyebrow}
        <h3 className="mt-2 font-display text-xl uppercase leading-tight">
          {title}
        </h3>
        {description ? (
          <div
            className={`mt-3 leading-7 ${tone === "light" ? "text-ink/75" : "text-sand/80"}`}
          >
            {description}
          </div>
        ) : null}
        {footer}
      </div>
    </>
  );

  if (href === undefined) {
    return (
      <article id={id} className={cls}>
        {body}
      </article>
    );
  }

  return (
    <article id={id} className={cls}>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
      >
        {body}
      </a>
    </article>
  );
}
