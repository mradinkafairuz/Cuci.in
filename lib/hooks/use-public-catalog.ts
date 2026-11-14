"use client";

import { useEffect, useState } from "react";
import type { LaundryItem, LaundryService } from "@/types";

interface PublicCatalog {
  services: LaundryService[];
  items: LaundryItem[];
}

export function usePublicCatalog() {
  const [catalog, setCatalog] = useState<PublicCatalog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadCatalog() {
      try {
        const response = await fetch("/api/catalog", { cache: "no-store" });
        const result: Partial<PublicCatalog> & { error?: string } = await response.json();
        if (!response.ok || !result.services || !result.items) {
          throw new Error(result.error ?? "Katalog tidak dapat dimuat.");
        }
        if (active) setCatalog({ services: result.services, items: result.items });
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Katalog tidak dapat dimuat.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadCatalog();
    return () => { active = false; };
  }, []);

  return { catalog, isLoading, error };
}
