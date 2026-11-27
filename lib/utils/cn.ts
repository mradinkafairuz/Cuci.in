// Menggabungkan class Tailwind secara kondisional tanpa library tambahan.
// Contoh: cn("px-4", isActive && "bg-brand-500", undefined) -> "px-4 bg-brand-500"
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
