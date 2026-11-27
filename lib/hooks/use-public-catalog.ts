"use client";

import { useSyncExternalStore } from "react";
import type { LaundryItem, LaundryService, OperatingHour } from "@/types";
import {
  FALLBACK_LAUNDRY_EQUIPMENT,
  FALLBACK_LAUNDRY_ITEMS,
  FALLBACK_LAUNDRY_SERVICES,
  FALLBACK_OPERATING_HOURS,
} from "@/lib/data/catalog-fallback";

interface PublicCatalog {
  services: LaundryService[];
  items: LaundryItem[];
  equipment: {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    priceUnit: "hari" | "minggu" | "bulan" | null;
    quantityAvailable: number;
  }[];
  businessHours: OperatingHour[];
  businessHoursConfigured?: boolean;
}

interface CatalogSnapshot {
  catalog: PublicCatalog;
  isLoading: boolean;
  error: string;
  usingLocalServices: boolean;
  usingLocalItems: boolean;
  usingLocalEquipment: boolean;
}

const REFRESH_INTERVAL_MS = 60_000;
const MIN_REQUEST_GAP_MS = 5_000;

const fallbackCatalog: PublicCatalog = {
  services: FALLBACK_LAUNDRY_SERVICES,
  items: FALLBACK_LAUNDRY_ITEMS,
  equipment: FALLBACK_LAUNDRY_EQUIPMENT,
  businessHours: FALLBACK_OPERATING_HOURS,
};

const initialSnapshot: CatalogSnapshot = {
  catalog: fallbackCatalog,
  isLoading: true,
  error: "",
  usingLocalServices: true,
  usingLocalItems: true,
  usingLocalEquipment: true,
};

let snapshot = initialSnapshot;
let requestInFlight: Promise<void> | null = null;
let lastRequestAt = 0;
let refreshInterval: number | null = null;
const subscribers = new Set<() => void>();

function publish(nextSnapshot: CatalogSnapshot) {
  snapshot = nextSnapshot;
  subscribers.forEach((subscriber) => subscriber());
}

function loadCatalog(): Promise<void> {
  if (requestInFlight) return requestInFlight;
  if (Date.now() - lastRequestAt < MIN_REQUEST_GAP_MS) return Promise.resolve();

  lastRequestAt = Date.now();
  requestInFlight = (async () => {
    try {
      const response = await fetch("/api/catalog", { cache: "no-store" });
      const result: Partial<PublicCatalog> & { error?: string } = await response.json();
      if (!response.ok || !Array.isArray(result.services) || !Array.isArray(result.items)) {
        throw new Error(result.error ?? "Katalog tidak dapat dimuat.");
      }

      const services = result.services.length ? result.services : FALLBACK_LAUNDRY_SERVICES;
      const items = result.items.length ? result.items : FALLBACK_LAUNDRY_ITEMS;
      const remoteHours = result.businessHours ?? [];
      const hasConfiguredHours =
        result.businessHoursConfigured ??
        remoteHours.some((hour) => !hour.closed && Boolean(hour.open && hour.close));

      publish({
        catalog: {
          services,
          items,
          equipment: result.equipment?.length ? result.equipment : FALLBACK_LAUNDRY_EQUIPMENT,
          businessHours: hasConfiguredHours ? remoteHours : FALLBACK_OPERATING_HOURS,
        },
        isLoading: false,
        error: "",
        usingLocalServices: result.services.length === 0,
        usingLocalItems: result.items.length === 0,
        usingLocalEquipment: !result.equipment?.length,
      });
    } catch {
      publish({
        catalog: fallbackCatalog,
        isLoading: false,
        error: "Katalog belum dapat diperbarui. Harga yang ditampilkan mungkin perlu dikonfirmasi.",
        usingLocalServices: true,
        usingLocalItems: true,
        usingLocalEquipment: true,
      });
    } finally {
      requestInFlight = null;
    }
  })();

  return requestInFlight;
}

function refreshWhenVisible() {
  if (document.visibilityState === "visible") void loadCatalog();
}

function startRefreshing() {
  void loadCatalog();
  refreshInterval = window.setInterval(() => void loadCatalog(), REFRESH_INTERVAL_MS);
  window.addEventListener("focus", refreshWhenVisible);
  document.addEventListener("visibilitychange", refreshWhenVisible);
}

function stopRefreshing() {
  if (refreshInterval !== null) {
    window.clearInterval(refreshInterval);
    refreshInterval = null;
  }
  window.removeEventListener("focus", refreshWhenVisible);
  document.removeEventListener("visibilitychange", refreshWhenVisible);
}

function subscribe(subscriber: () => void) {
  subscribers.add(subscriber);
  if (subscribers.size === 1) startRefreshing();

  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size === 0) stopRefreshing();
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return initialSnapshot;
}

export function usePublicCatalog() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
