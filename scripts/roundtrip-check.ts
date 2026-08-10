/**
 * Uji round-trip template markdown: sections → markdown → parse → sections.
 * Dijalankan manual: npx tsx scripts/roundtrip-check.ts
 */
import {
  SECTION_TYPES,
  starterContent,
  parseSectionContent,
  BLOCKS,
} from '@/design/blocks';
import { sectionsToMarkdown } from '@/lib/markdown/serialize';
import { parseLetterMarkdown } from '@/lib/markdown/parse';
import type { SectionRecord } from '@/design/types';

const sections: SectionRecord[] = SECTION_TYPES.map((type, i) => ({
  id: `s-${i}`,
  type,
  order: i,
  enabled: true,
  variant: '',
  content: starterContent(type),
}));

// Block berulang — dua "Surat" dan dua "Galeri" dalam satu surat.
sections.push({
  id: 'letter-2',
  type: 'letter',
  order: 100,
  enabled: true,
  variant: 'paper',
  content: { ...starterContent('letter'), title: 'Surat Kedua', body: 'Isi surat kedua.' },
});
sections.push({
  id: 'gallery-2',
  type: 'gallery',
  order: 101,
  enabled: true,
  variant: '',
  content: { ...starterContent('gallery'), title: 'Galeri Kedua' },
});

const md = sectionsToMarkdown(sections);
const parsed = parseLetterMarkdown(md);

console.log(`sections keluar : ${sections.length}`);
console.log(`sections terbaca: ${parsed.sections.length}`);
console.log(`peringatan      : ${parsed.warnings.length}`);
for (const w of parsed.warnings) console.log('  !', w);

const counts = new Map<string, number>();
let mismatches = 0;

for (const section of [...sections].sort((a, b) => a.order - b.order)) {
  const nth = (counts.get(section.type) ?? 0) + 1;
  counts.set(section.type, nth);

  const match = parsed.sections.find((p) => p.type === section.type && p.nth === nth);
  if (!match) {
    console.log(`HILANG: ${section.type}#${nth}`);
    mismatches += 1;
    continue;
  }

  // Impor menggabungkan ke konten yang ada, persis seperti Server Action.
  const before = parseSectionContent(section.type, section.content);
  const after = parseSectionContent(section.type, {
    ...section.content,
    ...match.content,
  });

  if (JSON.stringify(before) !== JSON.stringify(after)) {
    mismatches += 1;
    console.log(`\nBEDA ${section.type}#${nth}`);
    const b = before as Record<string, unknown>;
    const a = after as Record<string, unknown>;
    for (const key of Object.keys(b)) {
      const x = JSON.stringify(b[key]);
      const y = JSON.stringify(a[key]);
      if (x !== y) console.log(`  ${key}\n    keluar: ${x}\n    masuk : ${y}`);
    }
  }
}

const listBlocks = SECTION_TYPES.filter((t) => BLOCKS[t].fields.some((f) => f.kind === 'list'));

console.log(`\nblok        : ${SECTION_TYPES.length}`);
console.log(`punya daftar: ${listBlocks.length} (${listBlocks.join(', ')})`);
console.log(`BEDA        : ${mismatches}`);

if (mismatches > 0) process.exit(1);
