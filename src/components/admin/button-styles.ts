/**
 * Gaya tombol panel admin (E12-8 — audit konsistensi visual).
 * Satu sumber untuk seluruh aksi admin agar tombol selalu tampil sebagai
 * tombol: permukaan, border, padding, target sentuh ≥44px, serta state
 * hover/focus/disabled yang mengikuti tema ink/sand/ember (DG-02, DG-04).
 */
export type AdminButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export type AdminButtonSize = "sm" | "md" | "icon" | "icon-sm";

const baseClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-none border font-semibold uppercase leading-none tracking-[0.08em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember disabled:cursor-not-allowed disabled:opacity-50";

const variantClass: Record<AdminButtonVariant, string> = {
  // ember-700 + sand = 5.13:1; hover ember-800 + sand = 6.24:1.
  primary:
    "border-ember-700 bg-ember-700 text-sand hover:border-ember-800 hover:bg-ember-800 active:bg-ember-800",
  secondary:
    "border-line bg-ink-800 text-sand hover:border-ember hover:bg-ink-700 hover:text-ember",
  ghost:
    "border-transparent bg-transparent text-sand-600 hover:bg-ink-700 hover:text-sand",
  danger:
    "border-ember/60 bg-transparent text-ember hover:border-ember hover:bg-ember hover:text-ink",
};

const sizeClass: Record<AdminButtonSize, string> = {
  sm: "min-h-11 px-3 py-2 text-xs",
  md: "min-h-11 px-4 py-2 text-sm",
  icon: "min-h-11 min-w-11 p-2",
  "icon-sm": "min-h-11 min-w-11 p-1.5",
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
