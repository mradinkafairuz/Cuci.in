const TIME_ZONE = "Asia/Jakarta";
const MINIMUM_LEAD_TIME_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function getJakartaDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

function parseDayKey(day: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const date = Number(match[3]);
  const timestamp = Date.UTC(year, month - 1, date);
  return new Date(timestamp).toISOString().slice(0, 10) === day ? timestamp : null;
}

function addDays(day: string, days: number) {
  const timestamp = parseDayKey(day);
  if (timestamp === null) return "";
  return new Date(timestamp + days * DAY_MS).toISOString().slice(0, 10);
}

export function getJakartaDateInputValue(date = new Date()) {
  const parts = getJakartaDateParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getPickupDateRange(now = new Date()) {
  const min = getJakartaDateInputValue(now);
  return { min, max: addDays(min, 7) };
}

export function getPickupSlots(day: string, now = new Date()) {
  const dayTimestamp = parseDayKey(day);
  const todayTimestamp = parseDayKey(getJakartaDateInputValue(now));
  if (dayTimestamp === null || todayTimestamp === null) return [];

  const daysAhead = (dayTimestamp - todayTimestamp) / DAY_MS;
  if (daysAhead < 0 || daysAhead > 7) return [];

  const earliestTimestamp = now.getTime() + MINIMUM_LEAD_TIME_MS;
  const slots: { value: string; label: string }[] = [];
  for (let hour = 8; hour < 20; hour += 1) {
    const start = `${String(hour).padStart(2, "0")}:00`;
    const end = `${String(hour + 1).padStart(2, "0")}:00`;
    const timestamp = Date.parse(`${day}T${start}:00+07:00`);
    if (timestamp < earliestTimestamp) continue;

    slots.push({
      value: new Date(timestamp).toISOString(),
      label: `${start}–${end} WIB`,
    });
  }
  return slots;
}

export function parsePickupAt(value: unknown, now = new Date()) {
  if (typeof value !== "string") return null;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp) || timestamp < now.getTime() + MINIMUM_LEAD_TIME_MS) return null;

  const pickupDate = new Date(timestamp);
  if (pickupDate.getUTCMilliseconds() !== 0) return null;
  const pickupParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(pickupDate);
  const parts = Object.fromEntries(pickupParts.map(({ type, value: partValue }) => [type, partValue]));
  const pickupDay = parseDayKey(`${parts.year}-${parts.month}-${parts.day}`);
  const today = parseDayKey(getJakartaDateInputValue(now));
  if (pickupDay === null || today === null) return null;

  const daysAhead = (pickupDay - today) / DAY_MS;
  const hour = Number(parts.hour);
  if (
    daysAhead < 0
    || daysAhead > 7
    || hour < 8
    || hour >= 20
    || parts.minute !== "00"
    || parts.second !== "00"
  ) {
    return null;
  }

  return pickupDate.toISOString();
}

export function formatPickupWindow(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "Menunggu konfirmasi";

  const date = new Date(timestamp);
  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
  const timeFormatter = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: TIME_ZONE,
  });
  return `${dateLabel} · ${timeFormatter.format(date)}–${timeFormatter.format(new Date(timestamp + 60 * 60 * 1000))} WIB`;
}
