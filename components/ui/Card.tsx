import { cn } from "@/lib/utils/cn";

// Card dengan radius konsisten (rounded-2xl) di seluruh aplikasi.
export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-soft bg-white p-6 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
