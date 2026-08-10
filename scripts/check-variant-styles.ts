/**
 * Menjaga agar setiap varian block punya kelas CSS yang benar-benar ada.
 *
 * Varian yang tidak punya kelas di berkas .module.css-nya membuat React
 * merender kelas literal "undefined" — tidak terlihat sebagai galat, tapi
 * tata letaknya diam-diam salah. Dijalankan manual:
 *   npx tsx scripts/check-variant-styles.ts
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { BLOCKS, SECTION_TYPES } from '@/design/blocks';

const SECTIONS_DIR = join(process.cwd(), 'src', 'components', 'sections');

/** Kelas yang dideklarasikan di sebuah berkas CSS module. */
function classesIn(file: string): Set<string> {
  const css = readFileSync(file, 'utf8');
  const found = new Set<string>();
  for (const match of css.matchAll(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g)) {
    found.add(match[1]);
  }
  return found;
}

let problems = 0;

for (const type of SECTION_TYPES) {
  // intro dirender IntroGate, bukan komponen section biasa
  if (type === 'intro') continue;

  const cssPath = join(SECTIONS_DIR, `${type}.module.css`);
  const tsxPath = join(SECTIONS_DIR, `${type}.tsx`);

  if (!existsSync(tsxPath)) {
    console.log(`✗ ${type}: komponen tidak ada (${type}.tsx)`);
    problems += 1;
    continue;
  }

  if (!existsSync(cssPath)) {
    console.log(`✗ ${type}: berkas CSS tidak ada (${type}.module.css)`);
    problems += 1;
    continue;
  }

  const declared = classesIn(cssPath);
  const tsx = readFileSync(tsxPath, 'utf8');

  /**
   * Pencarian dinamis `styles[variant]` wajib punya kelas untuk SETIAP varian,
   * kecuali sudah dijaga fallback (`?? styles.x` atau `?? ''`) — tanpa itu
   * kelasnya jadi "undefined".
   */
  const dynamic = /styles\[[^\]]+\]/.test(tsx);
  const guarded = /styles\[[^\]]+\]\s*(\?\?|\|\|)/.test(tsx);
  const needsAll = dynamic && !guarded;

  for (const variant of BLOCKS[type].variants) {
    // Cocokkan identifier utuh: `styles.glass` tidak boleh cocok dengan
    // `styles.glassCard`.
    const explicit = new RegExp(`styles\\.${variant}(?![A-Za-z0-9_])`).test(tsx);
    if (!needsAll && !explicit) continue;

    if (!declared.has(variant)) {
      console.log(`✗ ${type}: varian "${variant}" dipakai tapi .${variant} tidak ada di CSS`);
      problems += 1;
    }
  }
}

console.log(problems === 0 ? '\n✓ Semua varian punya kelas CSS.' : `\n${problems} masalah.`);
if (problems > 0) process.exit(1);
