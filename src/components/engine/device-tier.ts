export type Tier = 'low' | 'mid' | 'high';

/**
 * Deteksi kemampuan perangkat sekali di awal. Halaman surat paling sering
 * dibuka di HP dari tautan chat — jumlah partikel harus menyesuaikan,
 * bukan memaksakan angka desktop.
 */
export function detectTier(): Tier {
  if (typeof window === 'undefined') return 'mid';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'low';

  const cores = navigator.hardwareConcurrency ?? 2;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  if (isMobile && (cores <= 4 || memory <= 3)) return 'low';
  if (isMobile || cores <= 4 || memory <= 4) return 'mid';
  return 'high';
}

const CEILING: Record<Tier, number> = { low: 22, mid: 55, high: 110 };

/** density 0–1 dari DesignSpec dikalikan plafon tier. */
export function particleBudget(tier: Tier, density: number): number {
  const clamped = Math.min(Math.max(density, 0), 1);
  return Math.max(6, Math.round(CEILING[tier] * clamped));
}
