import type { Palette } from '@/design/types';

/**
 * Ekstrak palet dari gambar apa pun — desain Canva, foto, poster.
 * Murni analisis piksel di browser: tanpa AI, tanpa panggilan jaringan,
 * instan dan gratis.
 *
 * Caranya: kuantisasi warna ke kotak-kotak kecil, hitung frekuensinya,
 * lalu pilih warna dominan yang cukup berbeda satu sama lain.
 */

const SAMPLE_SIZE = 120;
const BUCKET = 24;

type Rgb = { r: number; g: number; b: number };

export async function extractPalette(file: File): Promise<Palette> {
  const bitmap = await createImageBitmap(file);

  const canvas = document.createElement('canvas');
  const ratio = Math.min(SAMPLE_SIZE / bitmap.width, SAMPLE_SIZE / bitmap.height, 1);
  canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
  canvas.height = Math.max(1, Math.round(bitmap.height * ratio));

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas tidak tersedia di browser ini.');

  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const counts = new Map<string, { color: Rgb; count: number }>();

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 200) continue; // lewati piksel transparan

    const r = Math.round(data[i] / BUCKET) * BUCKET;
    const g = Math.round(data[i + 1] / BUCKET) * BUCKET;
    const b = Math.round(data[i + 2] / BUCKET) * BUCKET;

    const key = `${r},${g},${b}`;
    const entry = counts.get(key);
    if (entry) entry.count += 1;
    else counts.set(key, { color: { r, g, b }, count: 1 });
  }

  const ranked = [...counts.values()].sort((a, b) => b.count - a.count);
  if (!ranked.length) throw new Error('Gambar tidak punya warna yang bisa dibaca.');

  const distinct = pickDistinct(ranked.map((e) => e.color), 6);
  return buildPalette(distinct);
}

/** Ambil warna dominan yang jaraknya cukup jauh, supaya tidak semua mirip. */
function pickDistinct(colors: Rgb[], want: number): Rgb[] {
  const picked: Rgb[] = [];
  const minDistance = 60;

  for (const color of colors) {
    if (picked.every((p) => distance(p, color) > minDistance)) {
      picked.push(color);
      if (picked.length === want) break;
    }
  }

  // Kalau gambarnya monokrom, lengkapi dengan warna teratas apa adanya
  let i = 0;
  while (picked.length < want && i < colors.length) {
    if (!picked.includes(colors[i])) picked.push(colors[i]);
    i += 1;
  }

  return picked;
}

function distance(a: Rgb, b: Rgb): number {
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}

function luminance({ r, g, b }: Rgb): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function saturation({ r, g, b }: Rgb): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function hex({ r, g, b }: Rgb): string {
  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)));
  return `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('')}`;
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

/**
 * Petakan warna mentah ke slot palet. Aturan utamanya kontras:
 * background diambil dari yang paling gelap (atau paling terang untuk tema
 * terang), aksen dari yang paling berwarna, teks dipaksa kontras terhadap
 * background — bukan sekadar warna dominan berikutnya.
 */
function buildPalette(colors: Rgb[]): Palette {
  const byLum = [...colors].sort((a, b) => luminance(a) - luminance(b));
  const bySat = [...colors].sort((a, b) => saturation(b) - saturation(a));

  const darkest = byLum[0];
  const brightest = byLum[byLum.length - 1];
  const isDarkTheme = luminance(brightest) < 0.62 || luminance(darkest) < 0.22;

  const base = isDarkTheme ? darkest : brightest;
  const accent = bySat[0] ?? mix(base, isDarkTheme ? brightest : darkest, 0.6);

  const white: Rgb = { r: 255, g: 255, b: 255 };
  const black: Rgb = { r: 8, g: 6, b: 10 };

  const text = isDarkTheme ? mix(white, accent, 0.12) : mix(black, accent, 0.18);
  const textMuted = isDarkTheme ? mix(text, base, 0.42) : mix(text, base, 0.4);

  const bgMid = mix(base, accent, isDarkTheme ? 0.1 : 0.06);
  const bgSoft = mix(base, accent, isDarkTheme ? 0.22 : 0.14);
  const accentSoft = mix(accent, isDarkTheme ? white : black, 0.36);

  return {
    bgDeep: hex(base),
    bgMid: hex(bgMid),
    bgSoft: hex(bgSoft),
    accent: hex(accent),
    accentSoft: hex(accentSoft),
    text: hex(text),
    textMuted: hex(textMuted),
    glass: isDarkTheme ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.58)',
    glow: rgba(accent, isDarkTheme ? 0.34 : 0.22),
  };
}

function rgba({ r, g, b }: Rgb, alpha: number): string {
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha})`;
}
