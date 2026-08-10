import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Markdown ringan → HTML aman.
 * Sengaja bukan parser markdown penuh: hanya **tebal**, *miring*, dan baris
 * baru. Input di-escape lebih dulu, jadi tidak ada jalan masuk untuk HTML
 * atau <script> dari user.
 */
export function renderLite(input: string): string {
  const escaped = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  return escaped
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br/>');
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

export function formatDate(date: Date | string | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Waktu acara ditulis sebagai teks lokal tanpa zona ("2026-11-21T08:00"),
 * karena yang dimaksud selalu jam dinding di lokasi acara — bukan jam
 * pembaca. Diurai manual supaya tidak digeser ke zona waktu perangkat.
 */
export function parseLocalDateTime(input: string): Date | null {
  const raw = input.trim();
  if (!raw) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(raw);
  if (!match) {
    const fallback = new Date(raw);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  const [, y, m, d, hh = '0', mm = '0'] = match;
  const date = new Date(
    Number(y),
    Number(m) - 1,
    Number(d),
    Number(hh),
    Number(mm),
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

const DAY_FMT = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const TIME_FMT = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
});

export function formatEventDay(input: string): string {
  const date = parseLocalDateTime(input);
  return date ? DAY_FMT.format(date) : '';
}

export function formatEventTime(input: string): string {
  const date = parseLocalDateTime(input);
  return date ? `${TIME_FMT.format(date).replace('.', ':')} WIB` : '';
}

/** "08:00 – 10:00 WIB" bila ada jam selesai, "08:00 WIB" bila tidak. */
export function formatEventRange(start: string, end: string): string {
  const from = parseLocalDateTime(start);
  if (!from) return '';

  const to = parseLocalDateTime(end);
  const fromText = TIME_FMT.format(from).replace('.', ':');
  if (!to) return `${fromText} WIB`;

  return `${fromText} – ${TIME_FMT.format(to).replace('.', ':')} WIB`;
}
