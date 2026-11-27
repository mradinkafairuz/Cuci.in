import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "outline";

const variants: Record<Variant, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 shadow-sm",
  secondary: "bg-soft text-brand-700 hover:bg-brand-300/40",
  outline: "border border-brand-500 text-brand-600 hover:bg-brand-500/10",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

interface Props {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  href?: string; // jika ada href -> render sebagai link
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}

// Tombol serbaguna. Pakai `href` untuk navigasi, tanpa `href` untuk aksi.
export function Button({
  variant = "primary",
  className,
  children,
  href,
  type = "button",
  disabled,
  onClick,
}: Props) {
  const classes = cn(base, variants[variant], className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
