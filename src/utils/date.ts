/** Formats an ISO timestamp for display, e.g. "Sat 19 Sep 2026, 14:05". */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(iso: string): string {
  const d = parseIsoDate(iso);
  if (!d) return iso;
  return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

/** Short child-friendly date: "Mon 21 Sep". */
export function formatShortDate(iso: string): string {
  const d = parseIsoDate(iso);
  if (!d) return iso;
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

/** 'YYYY-MM-DD' in local time. */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parses 'YYYY-MM-DD' (or a full ISO timestamp) as a local date. */
export function parseIsoDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function addDays(iso: string, days: number): string {
  const d = parseIsoDate(iso) ?? new Date();
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

/** 'HH:MM' (24h) for a Date. */
export function toTimeString(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** '15:00' -> '3:00 PM'. Returns '' for null. */
export function formatTime(hhmm: string | null | undefined): string {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** "Today", "Tomorrow", "Yesterday", "In 3 days", "2 days ago", or the short date. */
export function describeDueDate(iso: string | null, today: string): string {
  if (!iso) return 'No date';
  const a = parseIsoDate(iso);
  const b = parseIsoDate(today);
  if (!a || !b) return iso;
  const diff = Math.round((a.getTime() - b.getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff <= 6) return formatShortDate(iso);
  if (diff < -1) return `${-diff} days ago`;
  return formatShortDate(iso);
}

export function isPast(iso: string | null, today: string): boolean {
  return !!iso && iso < today;
}

/** First and last ISO dates of the month containing `iso`. */
export function monthRange(iso: string): { from: string; to: string } {
  const d = parseIsoDate(iso) ?? new Date();
  const from = new Date(d.getFullYear(), d.getMonth(), 1);
  const to = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { from: toIsoDate(from), to: toIsoDate(to) };
}

export function monthLabel(iso: string): string {
  const d = parseIsoDate(iso) ?? new Date();
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}
