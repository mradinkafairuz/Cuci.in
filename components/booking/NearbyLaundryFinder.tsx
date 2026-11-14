"use client";

import { useState } from "react";
import { LoaderCircle, MapPin, Navigation } from "lucide-react";

type Place = {
  id: number;
  type: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  distance: number;
};

type Position = { lat: number; lon: number };

function distanceInKm(a: Position, b: Position) {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = radians(b.lat - a.lat);
  const dLon = radians(b.lon - a.lon);
  const arc = Math.sin(dLat / 2) ** 2
    + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
}

export function NearbyLaundryFinder() {
  const [position, setPosition] = useState<Position | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [message, setMessage] = useState("");

  async function findNearby() {
    if (!navigator.geolocation) {
      setState("error");
      setMessage("Browser ini tidak mendukung akses lokasi.");
      return;
    }

    setState("loading");
    setMessage("");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const customer = { lat: coords.latitude, lon: coords.longitude };
      setPosition(customer);
      const query = `[out:json][timeout:20];(node(around:7000,${customer.lat},${customer.lon})[shop=laundry];way(around:7000,${customer.lat},${customer.lon})[shop=laundry];relation(around:7000,${customer.lat},${customer.lon})[shop=laundry];node(around:7000,${customer.lat},${customer.lon})[amenity=laundry];way(around:7000,${customer.lat},${customer.lon})[amenity=laundry];);out center tags;`;

      try {
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("Pencarian peta sedang sibuk.");
        const data = await response.json();
        const nearby = (data.elements ?? [])
          .map((element: { id: number; type: string; lat?: number; lon?: number; center?: Position; tags?: Record<string, string> }) => {
            const lat = element.lat ?? element.center?.lat;
            const lon = element.lon ?? element.center?.lon;
            if (lat == null || lon == null) return null;
            return {
              id: element.id,
              type: element.type,
              name: element.tags?.name || "Laundry tanpa nama",
              address: [element.tags?.["addr:street"], element.tags?.["addr:suburb"]].filter(Boolean).join(", "),
              lat,
              lon,
              distance: distanceInKm(customer, { lat, lon }),
            } satisfies Place;
          })
          .filter((place: Place | null): place is Place => place !== null)
          .sort((a: Place, b: Place) => a.distance - b.distance)
          .slice(0, 5);
        setPlaces(nearby);
        setState("ready");
        setMessage(nearby.length ? "Lokasi Anda sudah ditemukan." : "Belum ada laundry terdaftar di OpenStreetMap dalam radius 7 km.");
      } catch {
        setState("error");
        setMessage("Lokasi ditemukan, tetapi data laundry terdekat gagal dimuat. Coba lagi sebentar.");
      }
    }, (error) => {
      setState("error");
      setMessage(error.code === error.PERMISSION_DENIED
        ? "Izin lokasi ditolak. Izinkan akses lokasi di browser untuk mencari laundry terdekat."
        : "Lokasi tidak bisa ditemukan. Pastikan layanan lokasi perangkat aktif.");
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  }

  const mapUrl = position
    ? (() => {
        const delta = 0.035;
        const west = position.lon - delta;
        const east = position.lon + delta;
        const south = position.lat - delta;
        const north = position.lat + delta;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${position.lat}%2C${position.lon}`;
      })()
    : "";

  return (
    <div className="rounded-2xl border border-brand-200 bg-soft/40 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-ink">Laundry di sekitar Anda</h3>
          <p className="mt-1 text-sm text-muted">Gunakan lokasi perangkat untuk melihat laundry terdekat.</p>
        </div>
        <button
          type="button"
          onClick={findNearby}
          disabled={state === "loading"}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-wait disabled:opacity-60"
        >
          {state === "loading" ? <LoaderCircle size={16} className="animate-spin" /> : <Navigation size={16} />}
          {state === "loading" ? "Mencari lokasi…" : position ? "Perbarui lokasi" : "Gunakan lokasi saya"}
        </button>
      </div>

      {message && <p aria-live="polite" className={`mt-3 text-sm ${state === "error" ? "text-red-600" : "text-muted"}`}>{message}</p>}

      {position && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <iframe
            title="Peta lokasi pelanggan dan laundry terdekat"
            src={mapUrl}
            loading="lazy"
            className="h-72 w-full rounded-xl border-0 bg-white"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-ink">Hasil terdekat · jarak garis lurus</h4>
            {places.length ? places.map((place, index) => (
              <a
                key={`${place.type}-${place.id}`}
                href={`https://www.openstreetmap.org/${place.type}/${place.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 rounded-xl border border-soft bg-white p-3 transition-colors hover:border-brand-300 hover:bg-brand-50"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{place.name}</span>
                  <span className="mt-0.5 block text-xs text-muted">{place.address || "Alamat tidak tercantum"}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-brand-700">{place.distance.toFixed(1)} km</span>
              </a>
            )) : state === "ready" ? (
              <p className="rounded-xl bg-white p-3 text-sm text-muted">Coba cari langsung di peta untuk melihat tempat lain.</p>
            ) : null}
          </div>
        </div>
      )}

      {position && <p className="mt-3 flex items-center gap-1 text-xs text-muted"><MapPin size={13} /> Peta dan daftar tempat menggunakan OpenStreetMap. Data tempat bergantung pada kontribusi pengguna.</p>}
    </div>
  );
}
