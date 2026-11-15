"use client";

import { useEffect, useState } from "react";
import type { LaundryItem, LaundryService, OperatingHour } from "@/types";
import { FALLBACK_LAUNDRY_EQUIPMENT, FALLBACK_LAUNDRY_ITEMS, FALLBACK_LAUNDRY_SERVICES, FALLBACK_OPERATING_HOURS } from "@/lib/data/catalog-fallback";

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

export function usePublicCatalog() {
  const [catalog, setCatalog] = useState<PublicCatalog>({
    services: FALLBACK_LAUNDRY_SERVICES,
    items: FALLBACK_LAUNDRY_ITEMS,
    equipment: FALLBACK_LAUNDRY_EQUIPMENT,
    businessHours: FALLBACK_OPERATING_HOURS,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingLocalServices, setUsingLocalServices] = useState(true);
  const [usingLocalItems, setUsingLocalItems] = useState(true);
  const [usingLocalEquipment, setUsingLocalEquipment] = useState(true);

  useEffect(() => {
    let active = true;
    let loading = false;
    async function loadCatalog() {
      if (loading) return;
      loading = true;
      try {
        const response = await fetch("/api/catalog", { cache: "no-store" });
        const result: Partial<PublicCatalog> & { error?: string } = await response.json();
        if (!response.ok || !Array.isArray(result.services) || !Array.isArray(result.items)) {
          throw new Error(result.error ?? "Katalog tidak dapat dimuat.");
        }
        if (active) {
          const services = result.services.length ? result.services : FALLBACK_LAUNDRY_SERVICES;
          const items = result.items.length ? result.items : FALLBACK_LAUNDRY_ITEMS;
          const remoteHours = result.businessHours ?? [];
          const hasConfiguredHours = result.businessHoursConfigured ?? remoteHours.some((hour) => !hour.closed && Boolean(hour.open && hour.close));
          setCatalog({
            services,
            items,
            equipment: result.equipment?.length ? result.equipment : FALLBACK_LAUNDRY_EQUIPMENT,
            businessHours: hasConfiguredHours ? remoteHours : FALLBACK_OPERATING_HOURS,
          });
          setUsingLocalServices(result.services.length === 0);
          setUsingLocalItems(result.items.length === 0);
          setUsingLocalEquipment(!result.equipment?.length);
          setError("");
        }
      } catch {
        if (active) {
          setCatalog({
            services: FALLBACK_LAUNDRY_SERVICES,
            items: FALLBACK_LAUNDRY_ITEMS,
            equipment: FALLBACK_LAUNDRY_EQUIPMENT,
            businessHours: FALLBACK_OPERATING_HOURS,
          });
          setUsingLocalServices(true);
          setUsingLocalItems(true);
          setUsingLocalEquipment(true);
          setError("");
        }
      } finally {
        if (active) setIsLoading(false);
        loading = false;
      }
    }

    void loadCatalog();
    const interval = window.setInterval(() => void loadCatalog(), 30_000);
    const reloadWhenVisible = () => {
      if (document.visibilityState === "visible") void loadCatalog();
    };
    window.addEventListener("focus", reloadWhenVisible);
    document.addEventListener("visibilitychange", reloadWhenVisible);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", reloadWhenVisible);
      document.removeEventListener("visibilitychange", reloadWhenVisible);
    };
  }, []);

  return { catalog, isLoading, error, usingLocalServices, usingLocalItems, usingLocalEquipment };
}
