/**
 * Tailwind font size tokens with their pixel equivalents.
 */
export type Size =
  | "5xl" // 48px
  | "4xl" // 36px
  | "3xl" // 30px
  | "2xl" // 24px
  | "xl" // 20px
  | "lg" // 18px
  | "base" // 16px
  | "sm" // 14px
  | "xs"; // 12px

/**
 * Tailwind font weight tokens with their numeric equivalents.
 */
export type FontWeight =
  | "thin" // 100
  | "extraLight" // 200
  | "light" // 300
  | "normal" // 400
  | "medium" // 500
  | "semibold" // 600
  | "bold" // 700
  | "extrabold" // 800
  | "black"; // 900

/**
 * Tailwind image object fit types.
 */
export type ObjectFit = "contain" | "cover" | "fill" | "none" | "scale-down";
