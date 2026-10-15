import type { ButtonHTMLAttributes, ReactNode } from "react";

type CtaVariant = "ember" | "ink" | "ghost";
type CtaSize = "md" | "sm";

const variantClass: Record<CtaVariant, string> = {
  // E12-3 — Kontras: ember-700+sand 5.13:1; hover ember-800 6.24:1.
  ember: "bg-ember-700 text-sand hover:bg-ember-800",
  // Ink di atas sand/ember: sand/ink 16:1.
  ink: "bg-ink text-sand hover:bg-ink-800",
  ghost: "border border-current bg-transparent hover:bg-sand/10",
};

const sizeClass: Record<CtaSize, string> = {
  md: "px-8 py-4 text-[1.125rem]",
  sm: "px-5 py-3 text-sm",
};

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-none font-medium uppercase leading-none tracking-[0.08em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50";

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
