import type { ButtonHTMLAttributes, ReactNode } from "react";

type CtaVariant = "ember" | "gold" | "ink" | "ghost";
type CtaSize = "md" | "sm";

const variantClass: Record<CtaVariant, string> = {
  ember:
    "bg-[#c83820] text-white hover:bg-[#a72d18] shadow-sm border border-transparent active:scale-[0.98]",
  gold: "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm border border-transparent active:scale-[0.98]",
  ink: "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm border border-transparent active:scale-[0.98]",
  ghost:
    "border border-zinc-200 text-zinc-800 bg-white hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98]",
};

const sizeClass: Record<CtaSize, string> = {
  md: "px-6 py-3 text-sm sm:text-base rounded-full font-semibold",
  sm: "px-4 py-2 text-xs sm:text-sm rounded-full font-semibold",
};

const baseClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 leading-none transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50";

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
