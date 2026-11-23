import type { ButtonHTMLAttributes, ReactNode } from "react";

type CtaVariant = "ember" | "gold" | "ink" | "ghost";
type CtaSize = "md" | "sm";

const variantClass: Record<CtaVariant, string> = {
  // Terracotta Red (Nusantara Batik)
  ember:
    "bg-[#c83820] text-white hover:bg-[#a72d18] shadow-[0_4px_14px_rgba(200,56,32,0.4)] border border-[#e4572e]/60 active:scale-[0.98]",
  // Golden Amber (Wishlist & Highlights)
  gold: "bg-[#f59e0b] text-[#2f180a] font-extrabold hover:bg-[#d97706] shadow-[0_4px_14px_rgba(245,158,11,0.35)] border border-[#fbbf24] active:scale-[0.98]",
  // Timber Dark
  ink: "bg-[#2f180a] text-[#faf6ee] hover:bg-[#1f1007] shadow-md border border-[#422310] active:scale-[0.98]",
  // Outlined Ghost
  ghost:
    "border-2 border-[#f59e0b] text-[#f59e0b] bg-[#2f180a]/70 backdrop-blur-sm hover:bg-[#f59e0b]/15 active:scale-[0.98]",
};

const sizeClass: Record<CtaSize, string> = {
  md: "px-7 py-3.5 text-base sm:text-lg rounded-full font-bold tracking-wider",
  sm: "px-5 py-2.5 text-xs sm:text-sm rounded-full font-bold tracking-wider",
};

const baseClass =
  "inline-flex items-center justify-center gap-2 font-bold uppercase leading-none transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f59e0b] disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50";

type CtaButtonProps = {
  href?: string;
  children: ReactNode;
  variant?: CtaVariant;
  size?: CtaSize;
  className?: string;
  external?: boolean;
  disabled?: boolean;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  ariaLabel?: string;
};

/**
 * E12-3 — Primitif CTA tunggal (sumber untuk Publik & CMS).
 * Semantik: `href` → `<a>` (tautan/navigasi), tanpa `href` → `<button>` (aksi).
 * Gaya tegas uppercase + sudut geometris (rounded-none) + hover/focus/disabled.
 */
export function CtaButton({
  href,
  children,
  variant = "ember",
  size = "md",
  className = "",
  external = false,
  disabled = false,
  type = "button",
  onClick,
  ariaLabel,
}: CtaButtonProps) {
  const cls = `${baseClass} ${variantClass[variant]} ${sizeClass[size]} ${className}`;

  if (href === undefined) {
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        aria-label={ariaLabel}
        className={cls}
      >
        {children}
      </button>
    );
  }

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        aria-label={ariaLabel}
        className={cls}
        role="link"
      >
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={cls}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}
