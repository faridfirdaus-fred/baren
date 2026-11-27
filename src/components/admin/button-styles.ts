/**
 * Gaya tombol panel admin (E19-2 — Putih Modern Minimalis).
 * Permukaan bersih, sudut membulat modern, target sentuh >=44px, tanpa warna ramai.
 */
export type AdminButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export type AdminButtonSize = "sm" | "md" | "icon" | "icon-sm";

const baseClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border font-semibold leading-none transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-50";

const variantClass: Record<AdminButtonVariant, string> = {
  primary:
    "border-zinc-900 bg-zinc-900 text-white shadow-xs hover:border-zinc-800 hover:bg-zinc-800 active:scale-[0.99]",
  secondary:
    "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900",
  ghost:
    "border-transparent bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
  danger:
    "border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50",
};

const sizeClass: Record<AdminButtonSize, string> = {
  sm: "min-h-10 px-3.5 py-2 text-xs",
  md: "min-h-11 px-4 py-2.5 text-sm",
  icon: "min-h-10 min-w-10 p-2",
  "icon-sm": "min-h-9 min-w-9 p-1.5",
};

export function adminButtonClass(
  variant: AdminButtonVariant = "secondary",
  size: AdminButtonSize = "md",
  className = "",
): string {
  return [baseClass, variantClass[variant], sizeClass[size], className]
    .filter(Boolean)
    .join(" ");
}
