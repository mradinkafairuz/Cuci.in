import { Droplets, Shirt, ShoppingBasket, Sparkles, WashingMachine, Wind } from "@/lib/icons";

const motifs = [
  [WashingMachine, Shirt],
  [ShoppingBasket, Sparkles],
  [Droplets, Wind],
  [Shirt, ShoppingBasket],
  [Wind, WashingMachine],
  [Sparkles, Droplets],
] as const;

/** Subtle 2D laundry illustrations kept in the outer gutters, away from text. */
export function LaundryDecor({ variant = 0 }: { variant?: number }) {
  const [FirstIcon, SecondIcon] = motifs[variant % motifs.length];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden xl:block">
      <span className="absolute left-[max(0.5rem,calc((100%-72rem)/2-6rem))] top-[24%] grid size-11 place-items-center rounded-[1rem] border border-[#7ab2b2]/25 bg-[#cde8e5]/50 text-[#4d869c]/55 shadow-sm motion-safe:animate-[laundryFloat_8s_ease-in-out_infinite]">
        <FirstIcon size={23} weight="duotone" />
      </span>
      <span className="absolute right-[max(0.5rem,calc((100%-72rem)/2-6rem))] bottom-[17%] grid size-10 place-items-center rounded-full border border-white/80 bg-[#eef7ff]/75 text-[#4d869c]/50 shadow-sm motion-safe:animate-[laundryFloat_7s_ease-in-out_infinite_alternate]">
        <SecondIcon size={21} weight="duotone" />
      </span>
      <span className="absolute bottom-[13%] left-[max(4rem,calc((100%-72rem)/2-2rem))] size-3 rounded-full border-2 border-[#7ab2b2]/35 motion-safe:animate-[laundryBubble_5s_ease-in-out_infinite]" />
      <span className="absolute right-[max(4rem,calc((100%-72rem)/2-2rem))] top-[19%] size-2.5 rounded-full bg-[#4d869c]/20 motion-safe:animate-[laundryBubble_6s_ease-in-out_infinite_1s]" />
    </div>
  );
}
