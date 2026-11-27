import { cn } from "@/lib/utils/cn";

type Tone = "info" | "success" | "warning" | "neutral";

const tones: Record<Tone, string> = {
  info: "bg-brand-500/10 text-brand-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  neutral: "bg-slate-100 text-slate-600",
};

export function Badge({
  tone = "info",
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}
