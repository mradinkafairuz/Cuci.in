"use client";

import { useEffect, useState } from "react";
import type { LaundryItem, LaundryService } from "@/types";
import { LOCAL_LAUNDRY_ITEMS } from "@/lib/data/laundry-items";
import { LOCAL_LAUNDRY_SERVICES } from "@/lib/data/laundry-services";

interface PublicCatalog {
  services: LaundryService[];
  items: LaundryItem[];
  catalogWarning?: string | null;
}

export function usePublicCatalog() {
  const [catalog, setCatalog] = useState<PublicCatalog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingLocalServices, setUsingLocalServices] = useState(false);
  const [usingLocalItems, setUsingLocalItems] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadCatalog() {
      try {
        const response = await fetch("/api/catalog", { cache: "no-store" });
        const result: Partial<PublicCatalog> & { error?: string } = await response.json();
        if (!response.ok || !result.services || !result.items) {
          throw new Error(result.error ?? "Katalog tidak dapat dimuat.");
        }
        const localServices = result.services.length === 0;
        const localItems = result.items.length === 0 || Boolean(result.catalogWarning);
        if (active) {
          setCatalog({
            services: localServices ? LOCAL_LAUNDRY_SERVICES : result.services,
            items: localItems ? LOCAL_LAUNDRY_ITEMS : result.items,
            catalogWarning: result.catalogWarning ?? null,
          });
          setUsingLocalServices(localServices);
          setUsingLocalItems(localItems);
        }
      } catch (loadError) {
        if (active) {
          setCatalog({ services: LOCAL_LAUNDRY_SERVICES, items: LOCAL_LAUNDRY_ITEMS });
          setUsingLocalServices(true);
          setUsingLocalItems(true);
          setError("");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadCatalog();
    return () => { active = false; };
  }, []);

  return { catalog, isLoading, error, usingLocalServices, usingLocalItems };
}
