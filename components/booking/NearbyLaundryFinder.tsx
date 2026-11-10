"use client";

import { useState } from "react";
import { LoaderCircle, MapPin, Navigation } from "lucide-react";

type Place = {
  id: number;
  type: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lon: number;
  distance: number;
};

type Position = { lat: number; lon: number };
type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    name?: string;
    osm_id?: number;
    osm_type?: "N" | "W" | "R";
    street?: string;
    housenumber?: string;
    district?: string;
    suburb?: string;
    city?: string;
    phone?: string;
    extra?: Record<string, string>;
  };
};

const SEARCH_RADIUS_METERS = 10_000;

function distanceInKm(a: Position, b: Position) {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = radians(b.lat - a.lat);
  const dLon = radians(b.lon - a.lon);
  const arc = Math.sin(dLat / 2) ** 2
    + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
}

async function searchLaundryPlaces(position: Position): Promise<Place[]> {
  const params = new URLSearchParams({
    q: "laundry",
    lat: position.lat.toFixed(3),
    lon: position.lon.toFixed(3),
    zoom: "14",
    limit: "12",
    lang: "id",
    osm_tag: "shop:laundry",
  });
  const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error("Pencarian laundry sekitar sedang tidak tersedia. Coba lagi sebentar.");

  const data: { features?: PhotonFeature[] } = await response.json();
  if (!Array.isArray(data.features)) throw new Error("Data laundry dari peta tidak bisa dibaca.");

  return data.features.flatMap((feature) => {
    const properties = feature.properties;
    const coordinates = feature.geometry?.coordinates;
    if (!properties?.osm_id || !coordinates || coordinates.length < 2) return [];

    const [lon, lat] = coordinates;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return [];
    const distance = distanceInKm(position, { lat, lon });
    if (distance > SEARCH_RADIUS_METERS / 1000) return [];

    const address = [
      [properties.street, properties.housenumber].filter(Boolean).join(" "),
      properties.suburb || properties.district,
      properties.city,
    ].filter(Boolean).join(", ");
    const osmType = properties.osm_type === "W" ? "way" : properties.osm_type === "R" ? "relation" : "node";

    return [{
      id: properties.osm_id,
      type: osmType,
      name: properties.name?.trim() || "Laundry tanpa nama",
      address,
      phone: properties.phone || properties.extra?.["contact:phone"] || properties.extra?.phone || "",
      lat,
      lon,
      distance: Number(distance.toFixed(2)),
    }];
  }).sort((a, b) => a.distance - b.distance).slice(0, 3);
}

function sortPlaces(places: Place[]): Place[] {
  return places.sort((a, b) => a.distance - b.distance);
}

function toWhatsAppPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

export function NearbyLaundryFinder() {
  const [position, setPosition] = useState<Position | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [message, setMessage] = useState("");

  async function findNearby() {
    if (!navigator.geolocation) {
      setState("error");
      setMessage("Browser ini tidak mendukung akses lokasi. Cari laundry berdasarkan lokasi di Google Maps.");
      return;
    }

    setState("loading");
    setMessage("");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const customer = { lat: coords.latitude, lon: coords.longitude };
      setPosition(customer);
      try {
        const nearby = sortPlaces(await searchLaundryPlaces(customer));
        setPlaces(nearby);
        setState("ready");
        setMessage(nearby.length
          ? `Ditemukan ${nearby.length} laundry terdekat dalam radius 10 km.`
          : "Belum ada laundry yang terdaftar di peta dalam radius 10 km. Cari pilihan lain di Google Maps.");
      } catch (error) {
        setPlaces([]);
        setState("error");
        setMessage(error instanceof Error ? error.message : "Daftar laundry sekitar belum tersedia. Cari pilihan lain di Google Maps.");
      }
    }, (error) => {
      setState("error");
      if (error.code === error.PERMISSION_DENIED) {
        setMessage("Izin lokasi ditolak. Izinkan akses lokasi di pengaturan browser, atau cari berdasarkan lokasi di Google Maps.");
      } else if (error.code === error.TIMEOUT) {
        setMessage("Pencarian lokasi terlalu lama. Periksa GPS/perangkat, lalu coba lagi.");
      } else {
        setMessage("Lokasi belum bisa ditemukan. Aktifkan layanan lokasi perangkat, atau gunakan pencarian Google Maps.");
      }
    }, { enableHighAccuracy: false, timeout: 20_000, maximumAge: 60_000 });
  }

  const mapUrl = position
    ? (() => {
        const deltaLat = 0.11;
        const deltaLon = Math.min(0.2, deltaLat / Math.max(0.25, Math.cos((position.lat * Math.PI) / 180)));
        const west = position.lon - deltaLon;
        const east = position.lon + deltaLon;
        const south = position.lat - deltaLat;
        const north = position.lat + deltaLat;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${position.lat}%2C${position.lon}`;
      })()
    : "";
  const googleSearchUrl = position
    ? `https://www.google.com/maps/search/laundry/@${position.lat},${position.lon},14z`
    : "https://www.google.com/maps/search/laundry+near+me";

  return (
    <div id="nearby-laundry" className="scroll-mt-24 rounded-2xl border border-brand-200 bg-soft/40 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-ink">Pilih laundry terdekat</h3>
          <p className="mt-1 text-sm text-muted">Cari berbagai laundry di sekitar lokasi Anda, bukan hanya satu tempat.</p>
        </div>
        <button
          type="button"
          onClick={findNearby}
          disabled={state === "loading"}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-wait disabled:opacity-60"
        >
          {state === "loading" ? <LoaderCircle size={16} className="animate-spin" /> : <Navigation size={16} />}
          {state === "loading" ? "Mencari laundry…" : position ? "Perbarui lokasi" : "Gunakan lokasi saya"}
        </button>
      </div>

      {message && <p aria-live="polite" className={`mt-3 text-sm ${state === "error" ? "text-amber-700" : "text-muted"}`}>{message}</p>}

      {position && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <iframe
            title="Peta lokasi Anda dan area laundry sekitar"
            src={mapUrl}
            loading="lazy"
            className="h-72 w-full rounded-xl border-0 bg-white"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-ink">Laundry terdekat · jarak garis lurus</h4>
            {places.length ? places.map((place, index) => {
              const phone = toWhatsAppPhone(place.phone);
              const message = `Halo ${place.name}, saya menemukan laundry Anda melalui Cuci.in dan ingin bertanya tentang pemesanan laundry. Apakah bisa dibantu?`;
              const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${position.lat},${position.lon}&destination=${place.lat},${place.lon}&travelmode=driving`;
              return (
                <article key={`${place.type}-${place.id}`} className="rounded-xl border border-soft bg-white p-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{index + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{place.name}</span>
                      <span className="mt-0.5 block text-xs text-muted">{place.address || "Alamat tidak tercantum"}</span>
                      <span className="mt-1 block text-xs font-semibold text-brand-700">{place.distance.toFixed(1)} km dari lokasi Anda</span>
                      <span className="mt-2 flex flex-wrap gap-2">
                        <a href={directionsUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100">Buka rute</a>
                        {phone && <a href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100">Pesan via WhatsApp</a>}
                      </span>
                    </span>
                  </div>
                </article>
              );
            }) : state === "ready" ? (
              <p className="rounded-xl bg-white p-3 text-sm text-muted">Belum ada data laundry di peta untuk area ini. Cari langsung di Google Maps.</p>
            ) : null}
            <a href={googleSearchUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-brand-300 bg-white px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
              <MapPin size={15} /> Cari laundry lain di peta
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
