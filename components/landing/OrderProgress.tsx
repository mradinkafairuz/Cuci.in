import type { OrderStatus } from "@/types";

const steps: { key: OrderStatus; label: string; short: string }[] = [
  { key: "menunggu", label: "Menunggu", short: "Masuk" },
  { key: "diterima", label: "Diterima", short: "Diterima" },
  { key: "dicuci", label: "Sedang dicuci", short: "Dicuci" },
  { key: "disetrika", label: "Sedang disetrika", short: "Disetrika" },
  { key: "siap_diambil", label: "Siap diambil", short: "Siap" },
  { key: "selesai", label: "Selesai", short: "Selesai" },
];

export function OrderProgress({ status }: { status: OrderStatus }) {
  const activeIndex = steps.findIndex((step) => step.key === status);
  const progress = activeIndex <= 0 ? 0 : (activeIndex / (steps.length - 1)) * 100;
  return <div className="mt-6" aria-label={`Progres pesanan ${steps[activeIndex]?.label ?? ""}`}>
    <div className="relative px-1"><div className="absolute left-2 right-2 top-[9px] h-1 rounded-full bg-soft" /><div className="absolute left-2 top-[9px] h-1 rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `calc((100% - 16px) * ${progress / 100})` }} /><ol className="relative flex justify-between">{steps.map((step, index) => { const done = index <= activeIndex; const current = index === activeIndex; return <li key={step.key} className="flex w-[16.66%] flex-col items-center text-center"><span className={`grid size-5 place-items-center rounded-full border-2 ${done ? "border-emerald-500 bg-emerald-500" : "border-soft bg-white"} ${current ? "ring-4 ring-emerald-100" : ""}`}><span className={`size-1.5 rounded-full ${done ? "bg-white" : "bg-transparent"}`} /></span><span className={`mt-2 text-[10px] leading-tight sm:text-xs ${current ? "font-bold text-emerald-800" : done ? "font-semibold text-ink" : "text-muted"}`}>{step.short}</span></li>; })}</ol></div>
    <p className="sr-only" aria-live="polite">Status saat ini: {steps[activeIndex]?.label}</p>
  </div>;
}
