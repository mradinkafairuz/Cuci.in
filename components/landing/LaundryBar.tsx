"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Minus, Plus, RotateCcw, Shirt, Sparkles } from "lucide-react";
import {
  ClothingRailHero,
  CUCI_SATUAN_ITEMS,
  type RailGarment,
} from "@/components/ui/product-rail-gallery";
import { usePublicCatalog } from "@/lib/hooks/use-public-catalog";
import { formatRupiah } from "@/lib/utils/format";

type GarmentCategory = "Semua" | "Pakaian" | "Linen & Rumah";

interface BarGarmentEntry {
  id: string;
  slug: string;
  name: string;
  processingMethod: string;
  price: number;
  category: Exclude<GarmentCategory, "Semua">;
  railItem: RailGarment;
}

const CATEGORIES: GarmentCategory[] = ["Semua", "Pakaian", "Linen & Rumah"];
const APPAREL_SLUGS = new Set([
  "kaos-katun",
  "kemeja-formal",
  "jas-blazer",
  "jaket-bomber",
  "hoodie-fleece",
]);

export function LaundryBar() {
  const router = useRouter();
  const { catalog, isLoading, error } = usePublicCatalog();
  const [activeCategory, setActiveCategory] = useState<GarmentCategory>("Semua");
  const [activeGarmentId, setActiveGarmentId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });

  const garments = useMemo<BarGarmentEntry[]>(() => {
    const items = catalog?.items ?? [];
    return items.map((item) => {
      const preset = CUCI_SATUAN_ITEMS.find((entry) => entry.id === item.slug);
      const isApparel =
        APPAREL_SLUGS.has(item.slug) ||
        preset?.kind === "tee" ||
        preset?.kind === "shirt" ||
        preset?.kind === "coat" ||
        preset?.kind === "jacket" ||
        preset?.kind === "hoodie";

      const railItem: RailGarment = {
        ...preset,
        id: item.id,
        name: item.name,
        description: preset?.description ?? item.processingMethod,
        kind: preset?.kind ?? "tee",
        tag: formatRupiah(item.price),
        details: [
          ...(preset?.details ?? [item.processingMethod]),
          `Harga ${formatRupiah(item.price)} / item`,
        ],
      };

      return {
        id: item.id,
        slug: item.slug || item.id,
        name: item.name,
        processingMethod: item.processingMethod,
        price: item.price,
        category: isApparel ? "Pakaian" : "Linen & Rumah",
        railItem,
      };
    });
  }, [catalog]);

  const filteredGarments = useMemo(() => {
    if (activeCategory === "Semua") return garments;
    return garments.filter((entry) => entry.category === activeCategory);
  }, [garments, activeCategory]);

  const railItems = useMemo(
    () => filteredGarments.map((entry) => entry.railItem),
    [filteredGarments],
  );

  const selectedEntries = useMemo(
    () =>
      garments
        .map((entry) => ({ entry, qty: quantities[entry.id] ?? 0 }))
        .filter(({ qty }) => qty > 0),
    [garments, quantities],
  );

  const totalCount = useMemo(
    () => selectedEntries.reduce((sum, { qty }) => sum + qty, 0),
    [selectedEntries],
  );

  const totalEstimate = useMemo(
    () => selectedEntries.reduce((sum, { entry, qty }) => sum + entry.price * qty, 0),
    [selectedEntries],
  );

  function updateQuantity(id: string, delta: number) {
    setQuantities((prev) => {
      const current = prev[id] ?? 0;
      const next = Math.max(0, Math.min(99, current + delta));
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  }

  function stepNavigation(direction: "prev" | "next") {
    const track = trackRef.current;
    if (track) {
      const step = Math.max(240, Math.round(track.clientWidth * 0.6));
      track.scrollBy({
        left: direction === "next" ? step : -step,
        behavior: "smooth",
      });
    }

    if (filteredGarments.length === 0) return;
    const currentIndex = filteredGarments.findIndex((g) => g.id === activeGarmentId);
    const nextIndex =
      currentIndex < 0
        ? 0
        : direction === "next"
          ? Math.min(filteredGarments.length - 1, currentIndex + 1)
          : Math.max(0, currentIndex - 1);
    setActiveGarmentId(filteredGarments[nextIndex]?.id ?? null);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("button, a, input, select")) return;

    const track = trackRef.current;
    if (!track) return;
    dragState.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: track.scrollLeft,
      moved: false,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragState.current;
    const track = trackRef.current;
    if (!drag.active || !track) return;

    const deltaX = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(deltaX) > 6) {
      drag.moved = true;
    }
    if (drag.moved) {
      track.scrollLeft = drag.scrollLeft - deltaX;
    }
  }

  function handlePointerUp() {
    dragState.current.active = false;
  }

  function handleProceedToBooking() {
    if (selectedEntries.length === 0) return;
    const primary = selectedEntries[0];
    router.push(
      `/pesan-satuan?item=${encodeURIComponent(primary.entry.slug)}&qty=${primary.qty}`,
    );
  }

  const selectionSummaryText = useMemo(() => {
    if (selectedEntries.length === 0) return "";
    const preview = selectedEntries
      .slice(0, 2)
      .map(({ entry, qty }) => `${entry.name} (${qty}x)`)
      .join(", ");
    const remaining = selectedEntries.length - 2;
    return remaining > 0 ? `${preview} +${remaining} lainnya` : preview;
  }, [selectedEntries]);

  return (
    <section
      id="cuci-satuan"
      className="relative isolate scroll-mt-20 overflow-hidden bg-white py-16 sm:py-20"
    >
      <div id="layanan" aria-hidden="true" className="pointer-events-none absolute -top-20 left-0 h-px w-px" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Open Header */}
        <div className="max-w-2xl">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#0079A8]">
            Laundry Bar · Cuci Satuan Interaktif
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
            Pilih &amp; periksa pakaian langsung di bar
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-600 sm:text-base">
            Arahkan kursor atau geser bar baju untuk melihat tampak depan–belakang secara 3D, lalu pilih jumlah item untuk estimasi cepat.
          </p>
        </div>

        {/* Minimalist Category Tabs + Desktop Arrows */}
        <div className="mt-8 flex items-center justify-between gap-4 border-b border-slate-200/80">
          <div
            role="tablist"
            aria-label="Filter kategori pakaian Laundry Bar"
            className="-mb-px flex items-center gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setActiveCategory(category);
                    setActiveGarmentId(null);
                    trackRef.current?.scrollTo({ left: 0, behavior: "smooth" });
                  }}
                  className={`shrink-0 whitespace-nowrap border-b-2 pb-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AEEF] ${
                    isActive
                      ? "border-[#00AEEF] text-[#0F172A]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="hidden items-center gap-2 pb-2 md:flex">
            <button
              type="button"
              onClick={() => stepNavigation("prev")}
              aria-label="Geser item Laundry Bar ke kiri"
              className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-[#00AEEF] hover:text-[#0079A8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AEEF]"
            >
              <ArrowLeft size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => stepNavigation("next")}
              aria-label="Geser item Laundry Bar ke kanan"
              className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-[#00AEEF] hover:text-[#0079A8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AEEF]"
            >
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {isLoading && garments.length === 0 && (
          <p role="status" className="mt-6 text-sm text-slate-500">
            Menyiapkan bar pakaian...
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 text-xs font-medium text-amber-700">
            {error}
          </p>
        )}

        {/* Open 3D Interactive Clothing Rail — zero outer container card */}
        {railItems.length > 0 && (
          <div className="mt-2">
            <ClothingRailHero
              items={railItems}
              hanger="wood"
              plainBackground
              autoplay={true}
              interval={3200}
              activeId={activeGarmentId}
              onActiveChange={setActiveGarmentId}
              caption="Geser atau sentuh pakaian di atas untuk memutar ke depan · Klik untuk detail 3D bolak-balik."
              labels={{
                front: "Tampak Depan",
                back: "Tampak Belakang",
                close: "Tutup",
                show: "Lihat Detail",
              }}
              renderDetailAction={(item) => {
                const qty = quantities[item.id] ?? 0;
                return qty === 0 ? (
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, 1)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#F7D44C] px-5 py-2.5 text-sm font-extrabold text-[#0F172A] shadow-xs transition hover:bg-[#efc52d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AEEF]"
                  >
                    <Plus size={15} aria-hidden="true" />
                    Tambah ke Estimasi
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#0F172A] px-2.5 py-1.5 text-white">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      aria-label={`Kurangi ${item.name}`}
                      className="grid size-7 place-items-center rounded-full text-white/80 hover:bg-white/15"
                    >
                      <Minus size={14} aria-hidden="true" />
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-extrabold tabular-nums">
                      {qty} pcs
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      aria-label={`Tambah ${item.name}`}
                      className="grid size-7 place-items-center rounded-full bg-[#F7D44C] text-[#0F172A] hover:bg-[#efc52d]"
                    >
                      <Plus size={14} aria-hidden="true" />
                    </button>
                  </div>
                );
              }}
            />
          </div>
        )}

        {/* Editorial Hairline Track — card-free interactive horizontal strip synced with 3D rail */}
        <div className="relative mt-2">
          <div
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 pr-10 cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-8"
          >
            {filteredGarments.map((entry) => {
              const qty = quantities[entry.id] ?? 0;
              const isSelected = qty > 0;
              const isHighlighted = activeGarmentId === entry.id;

              return (
                <article
                  key={entry.id}
                  onMouseEnter={() => setActiveGarmentId(entry.id)}
                  onClick={(event) => {
                    if ((event.target as HTMLElement | null)?.closest("button")) return;
                    if (!dragState.current.moved) {
                      setActiveGarmentId(entry.id);
                    }
                  }}
                  className={`group flex w-[76%] shrink-0 snap-start flex-col justify-between pt-4 transition-colors duration-200 sm:w-[44%] md:w-[30%] lg:w-[26%] ${
                    isSelected
                      ? "border-t-[3px] border-[#00AEEF]"
                      : isHighlighted
                        ? "border-t-[3px] border-[#F7D44C]"
                        : "border-t-2 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] ${
                          isSelected
                            ? "text-[#0079A8]"
                            : isHighlighted
                              ? "text-[#9A7400]"
                              : "text-slate-400"
                        }`}
                      >
                        {entry.category === "Pakaian" ? (
                          <Shirt size={13} aria-hidden="true" />
                        ) : (
                          <Sparkles size={13} aria-hidden="true" />
                        )}
                        {entry.category}
                      </span>
                      {isHighlighted && (
                        <span className="text-[11px] font-semibold text-[#0079A8]">
                          Tampil di rail
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 text-base font-bold leading-snug text-slate-900 sm:text-lg">
                      {entry.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 min-h-[2.25rem] text-xs leading-relaxed text-slate-500 sm:text-sm">
                      {entry.processingMethod}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-extrabold text-[#0F172A]">
                        {formatRupiah(entry.price)}
                      </span>
                      <span className="text-xs font-medium text-slate-500">/ item</span>
                    </div>

                    {isSelected ? (
                      <div
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#0F172A] px-1.5 py-1 text-white"
                        aria-label={`Jumlah ${entry.name}`}
                      >
                        <button
                          type="button"
                          onClick={() => updateQuantity(entry.id, -1)}
                          aria-label={`Kurangi ${entry.name}`}
                          className="grid size-6 place-items-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D44C]"
                        >
                          <Minus size={13} aria-hidden="true" />
                        </button>
                        <span className="min-w-[1.25rem] text-center text-xs font-extrabold tabular-nums">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(entry.id, 1)}
                          aria-label={`Tambah ${entry.name}`}
                          className="grid size-6 place-items-center rounded-full bg-[#F7D44C] text-[#0F172A] transition hover:bg-[#efc52d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          <Plus size={13} aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveGarmentId(entry.id);
                          updateQuantity(entry.id, 1);
                        }}
                        aria-label={`Tambah ${entry.name}`}
                        className="grid size-9 place-items-center rounded-full border border-slate-300 text-slate-700 transition hover:border-[#00AEEF] hover:bg-[#00AEEF] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AEEF]"
                      >
                        <Plus size={16} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Right peek fade */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-12 bg-gradient-to-l from-white to-transparent sm:block"
          />
        </div>

        {/* Slim Action Bar */}
        <div aria-live="polite" className="mt-6">
          {totalCount === 0 ? (
            <div className="flex flex-col items-start justify-between gap-2 rounded-2xl border border-slate-200/80 bg-[#EEF9FE]/75 px-5 py-3.5 text-sm text-slate-600 sm:flex-row sm:items-center">
              <p className="font-medium">
                Klik pakaian di rail 3D atau geser &amp; pilih item di atas untuk hitung estimasi cepat
              </p>
              <span className="text-xs font-semibold text-[#0079A8]">
                {filteredGarments.length} item tersedia
              </span>
            </div>
          ) : (
            <div className="flex flex-col justify-between gap-4 rounded-2xl bg-[#0F172A] px-5 py-4 text-white shadow-[0_14px_34px_rgba(15,23,42,0.14)] sm:flex-row sm:items-center sm:px-6">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white/75">
                  {totalCount} item dipilih · {selectionSummaryText}
                </p>
                <div className="mt-0.5 flex flex-wrap items-baseline gap-2">
                  <span className="text-lg font-extrabold text-white sm:text-xl">
                    Estimasi {formatRupiah(totalEstimate)}
                  </span>
                  <span className="text-[11px] text-white/60">
                    (siap lanjut ke form penjemputan satuan)
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setQuantities({})}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3.5 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <RotateCcw size={13} aria-hidden="true" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleProceedToBooking}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#F7D44C] px-5 py-2.5 text-sm font-extrabold text-[#0F172A] transition hover:bg-[#efc52d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Lanjut Jadwalkan Jemput
                  <ArrowUpRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
