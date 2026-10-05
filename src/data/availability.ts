/**
 * Business availability schedule for the Rayray app.
 *
 * This is the single place where the business owner edits working hours.
 * The booking flow reads from here: customers only see days you're open,
 * and only the time slots inside your hours.
 *
 * Hours are 24-hour "HH:MM" strings. A null entry means closed that day.
 * Index 0 = Sunday, 1 = Monday, ..., 6 = Saturday.
 */
export interface DayHours {
  /** Opening time, e.g. "08:00". */
  open: string;
  /** Closing time, e.g. "21:00". Last bookable slot starts one hour before close. */
  close: string;
}

export const WEEKLY_HOURS: (DayHours | null)[] = [
  null, // Sunday — closed
  { open: "08:00", close: "21:00" }, // Monday
  { open: "08:00", close: "21:00" }, // Tuesday
  { open: "08:00", close: "21:00" }, // Wednesday
  { open: "08:00", close: "21:00" }, // Thursday
  { open: "08:00", close: "21:00" }, // Friday
  { open: "09:00", close: "17:00" }, // Saturday
];

/** Slot length in minutes. */
export const SLOT_MINUTES = 60;

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** "8:00 AM" style label for a 24-hour hour value. Slots start on the hour. */
export function formatSlotLabel(hour24: number): string {
  const suffix = hour24 < 12 ? "AM" : "PM";
  const h12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${h12}:00 ${suffix}`;
}

/** Weekday index (0=Sunday..6=Saturday) for an ISO date string. */
function weekdayOf(isoDate: string): number {
  return new Date(isoDate + "T12:00:00").getDay();
}

/** True when the business is open on the given ISO date. */
export function isOpenOn(isoDate: string): boolean {
  return WEEKLY_HOURS[weekdayOf(isoDate)] !== null;
}

/**
 * Bookable time slot labels for an ISO date, e.g. ["8:00 AM", "9:00 AM", ...].
 * Empty array when closed that day. Slots are hourly; the last slot starts
 * one slot-length before closing time.
 */
export function getSlotsForDate(isoDate: string): string[] {
  const hours = WEEKLY_HOURS[weekdayOf(isoDate)];
  if (!hours) return [];
  const slots: string[] = [];
  for (let t = parseTime(hours.open); t + SLOT_MINUTES <= parseTime(hours.close); t += SLOT_MINUTES) {
    slots.push(formatSlotLabel(Math.floor(t / 60)));
  }
  return slots;
}

/** Next `count` open days as ISO date strings, starting tomorrow. Skips closed days. */
export function nextOpenDays(count: number): string[] {
  const days: string[] = [];
  const today = new Date();
  let offset = 1;
  while (days.length < count && offset < 60) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    const iso = d.toISOString().slice(0, 10);
    if (isOpenOn(iso)) days.push(iso);
    offset++;
  }
  return days;
}

/** One-line human summary of weekly hours, e.g. "Mon–Fri 8am–9pm · Sat 9am–5pm · Sun closed". */
export function hoursSummary(): string {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fmt = (t: string) => {
    const [h] = t.split(":").map(Number);
    const suffix = h < 12 ? "am" : "pm";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}${suffix}`;
  };
  // Group consecutive days with identical hours.
  const groups: { days: string[]; label: string }[] = [];
  WEEKLY_HOURS.forEach((h, i) => {
    const label = h ? `${fmt(h.open)}–${fmt(h.close)}` : "closed";
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.days.push(dayNames[i]);
    } else {
      groups.push({ days: [dayNames[i]], label });
    }
  });
  return groups
    .map((g) => {
      const dayPart = g.days.length > 1 ? `${g.days[0]}–${g.days[g.days.length - 1]}` : g.days[0];
      return g.label === "closed" ? `${dayPart} closed` : `${dayPart} ${g.label}`;
    })
    .join(" · ");
}
